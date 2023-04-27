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

    delete user.password;
    delete user._id;

    // Append user trades
    user.trades = await db
      .collection("trades")
      .find({
        $or: [
          {
            "from.uuid": req.params.uuid,
            "from.confirmed": 1,
          },
          {
            "to.uuid": req.params.uuid,
            "to.confirmed": 1,
          },
          {
            "middleman.uuid": req.params.uuid,
            "middleman.confirmed": 1,
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
