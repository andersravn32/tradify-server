const database = require("../../../utilities/database");
const compose = require("../../../utilities/compose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { validationResult } = require("express-validator");
const mail = require("../../../utilities/mail");
const roles = require("../../../content/public/roles.json");

module.exports = async (req, res) => {
  const validatorErrors = validationResult(req);
  if (!validatorErrors.isEmpty()) {
    return res.json(compose.response(null, null, validatorErrors.array()));
  }

  const user = {
    uuid: crypto.randomUUID(),
    identifier: req.body.identifier.toLowerCase(),
    email: req.body.email.toLowerCase(),
    password: await bcrypt.hash(req.body.password, 10),
    role: roles.guest,
    verified: false,
    profile: {
      avatar: `${process.env.URL_BASE_BACKEND}/content/uploads/user.svg`,
      cover: `${process.env.URL_BASE_BACKEND}/content/uploads/cover.jpg`,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      dob: req.body.dob,
      bio: null,
    },
    settings: {
      notifications: {
        app: true,
        email: false,
      },
    },
  };

  try {
    // Get database connection
    const db = database.get();

    // Check database for duplicate entries
    const duplicate = await db.collection("users").findOne({
      $or: [{ email: user.email }, { identifier: user.identifier }],
    });

    if (duplicate) {
      // Return error
      return res.json(
        compose.response(null, null, [{ msg: "Duplicate email entry" }])
      );
    }

    // Insert newly created user object into database
    const userInsert = await db.collection("users").insertOne(user);
    if (!userInsert.insertedId) {
      // Return error
      return res.json(
        compose.response(null, null, [
          { msg: "Internal server error", location: "userInsert" },
        ])
      );
    }

    // Create accessToken
    const accessToken = jwt.sign(
      {
        type: "access",
        user: user.uuid,
        email: user.email,
        identifier: user.identifier,
        role: user.role,
      },
      process.env.JWT_AUTH,
      {
        expiresIn: process.env.JWT_AUTH_EXPIRES,
      }
    );

    // Create refreshToken
    const refreshToken = jwt.sign(
      {
        type: "refresh",
        user: user.uuid,
      },
      process.env.JWT_REFRESH,
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRES,
      }
    );

    // Insert newly created refresh token into database
    const refreshInsert = await db.collection("tokens").replaceOne(
      {
        type: "refresh",
        user: user.uuid,
      },
      {
        type: "refresh",
        user: user.uuid,
        token: refreshToken,
      },
      {
        upsert: true,
      }
    );
    if (!refreshInsert.upsertedId && !refreshInsert.modifiedCount) {
      // Return error
      return res.json(
        compose.response(null, null, [
          { msg: "Internal server error", location: "refreshInsert" },
        ])
      );
    }

    // Create callback signup callback token
    const callbackToken = jwt.sign(
      {
        type: "callback",
        action: "confirmEmail",
        user: user.uuid,
        callback: "https://tradify.dk",
      },
      process.env.JWT_CALLBACK,
      {
        expiresIn: process.env.JWT_CALLBACK_EXPIRES,
      }
    );

    // Insert newly created callback token into database
    const callbackInsert = await db.collection("tokens").replaceOne(
      {
        type: "callback",
        user: user.uuid,
      },
      {
        type: "callback",
        user: user.uuid,
        token: callbackToken,
      },
      {
        upsert: true,
      }
    );
    if (!callbackInsert.upsertedId && !callbackInsert.modifiedCount) {
      // Return error
      return res.json(
        compose.response(null, null, [
          { msg: "Internal server error", location: "callbackInsert" },
        ])
      );
    }

    // Send callback confirmation email to user
    const mailResult = await mail.send(
      "Velkommen til Tradify!",
      "signup.ejs",
      user,
      { token: callbackToken }
    );

    if (!mailResult) {
      // Return error
      return res.json(
        compose.response(null, null, [
          { msg: "Internal server error", location: "callbackEmail" },
        ])
      );
    }

    // Remove password and mongodb id from user object
    delete user._id;
    delete user.password;

    // Return accessToken, refreshToken and user object to requesting user
    return res.json(
      compose.response(null, { accessToken, refreshToken, user }, null)
    );
  } catch (error) {
    console.log(error);
    // Return error
    return res.json(
      compose.response(null, null, [
        { msg: "Internal server error", location: "trycatch", raw: error },
      ])
    );
  }
};
