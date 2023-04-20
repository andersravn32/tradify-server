const { validationResult } = require("express-validator");
const database = require("../../utilities/database");
const compose = require("../../utilities/compose");
const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  const validatorErrors = validationResult(req);
  if (!validatorErrors.isEmpty()) {
    return res.json(compose.response(null, null, validatorErrors.array()));
  }

  try {
    // Get token from request headers or request query
    const token = jwt.verify(
      req.headers.authorization || req.query.token,
      process.env.JWT_AUTH
    );

    // Get database connection
    const db = database.get();

    // Find user in database
    const user = await db.collection("users").findOne({ uuid: token.user });
    if (!user) {
      // Return error
      return res.json(
        compose.response(null, null, [
          { msg: "Failed to locate user", location: "user" },
        ])
      );
    }
    delete user._id;
    delete user.password;

    // Set user as request object
    req.user = user;

    // Complete middleware
    next();
  } catch (error) {
    // Return error
    return res.json(
      compose.response(null, null, [
        { msg: "Failed to validate JWT", location: "trycatch", raw: error },
      ])
    );
  }
};
