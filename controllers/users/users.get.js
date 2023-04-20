const { validationResult } = require("express-validator");
const compose = require("../../utilities/compose");
const database = require("../../utilities/database");
const roles = require("../../content/public/roles.json");

module.exports = async (req, res) => {
  const validatorErrors = validationResult(req);
  if (!validatorErrors.isEmpty()) {
    return res.json(compose.response(null, null, validatorErrors.array()));
  }

  try {
    // Get database connection
    const db = database.get();

    // Locate users in database with query pattern
    const searchResult = await db
      .collection("users")
      .find({
        $or: [
          { identifier: new RegExp(".*" + req.params.identifier + ".*", "i") },
          { email: new RegExp(".*" + req.params.identifier + ".*", "i") },
        ],
      })
      .limit(
        res.locals.user.role.permissionLevel >= roles.administrator.permissionLevel
          ? 100
          : 10
      )
      .toArray();

    // Delete mongo document id and user hashed password
    const users = searchResult.map((user) => {
      delete user._id;
      delete user.password;
      return user;
    });

    // Return located users as response
    return res.json(compose.response(null, users, null));
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
