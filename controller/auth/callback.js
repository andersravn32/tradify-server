const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const database = require("../../utilities/database");
const compose = require("../../utilities/compose");
const actions = require("../../actions");

module.exports = async (req, res) => {
  const validatorErrors = validationResult(req);
  if (!validatorErrors.isEmpty()) {
    return res.json(compose.response(null, null, validatorErrors.array()));
  }

  try {
    // Extract token data from token provided as parameter
    const token = jwt.verify(req.params.token, process.env.JWT_CALLBACK);

    // Get database connection
    const db = database.get();

    // Delete requesting token from database
    const tokenDelete = await db
      .collection("tokens")
      .deleteOne({ token: req.params.token, type: "callback" });
    if (!tokenDelete.deletedCount) {
      // Return error
      return res.json(
        compose.response(null, null, [
          { msg: "Failed to clear token from storage", location: "callback" },
        ])
      );
    }

    // Perform action contained in JWT
    switch (token.action) {
      // Action / confirmEmail
      case "confirmEmail": {
        if (await actions.callback.confirmEmail(token.user)) {
          break;
        }
      }

      // Every action returned false
      default: {
        // Return error
        return res.json(
          compose.response(null, null, [
            { msg: "Failed to complete provided action", location: "callback" },
          ])
        );
      }
    }

    // Redirect user to callback URL
    return res.redirect(token.callback);
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
