const { validationResult } = require("express-validator");
const compose = require("../../utilities/compose");
const database = require("../../utilities/database");

module.exports = async (req, res) => {
  const validatorErrors = validationResult(req);
  if (!validatorErrors.isEmpty()) {
    return res.json(compose.response(null, null, validatorErrors.array()));
  }

  try {
    // Get database connection
    const db = database.get();

    // Locate user data in database
    const user = await db
      .collection("users")
      .findOne({ uuid: req.params.uuid });
    delete user.password;
    delete user._id;

    // If no user was found, return error
    if (!user) {
      return res.json(
        compose.response(null, null, [
          {
            msg: "Failed to locate user info",
            location: `user/${req.params.uuid}`,
          },
        ])
      );
    }

    // If request query ignoreTrades is present
    if (req.query.ignoreTrades) {
      // Return user object
      return res.json(compose.response(null, user, null));
    }

    // Append user trades
    user.trades = await db
      .collection("trades")
      .find({
        $or: [
          {
            "from.uuid": req.params.uuid,
            "from.confirmed": true,
          },
          {
            "to.uuid": req.params.uuid,
            "to.confirmed": true,
          },
          {
            "middleman.uuid": req.params.uuid,
            "middleman.confirmed": true,
          },
        ],
      })
      .toArray();

    // Return user object
    return res.json(compose.response(null, user, null));
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
