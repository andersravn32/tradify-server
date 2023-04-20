const { validationResult } = require("express-validator");
const compose = require("../../utilities/compose");
const database = require("../../utilities/database");
const { ObjectId } = require("mongodb");
const roles = require("../../content/public/roles.json");

module.exports = async (req, res) => {
  const validatorErrors = validationResult(req);
  if (!validatorErrors.isEmpty()) {
    return res.json(compose.response(null, null, validatorErrors.array()));
  }

  try {
    // Get database connection
    const db = database.get();

    // Locate trade in database
    const trade = await db
      .collection("trades")
      .findOne({ _id: new ObjectId(req.params.id) });

    // Ensure that requesting user is the creator of the trade, or an administrator
    if (!trade || !(trade.from.uuid == res.locals.user.uuid)) {
      if (
        !(res.locals.user.role.permissionLevel >= roles.administrator.permissionLevel)
      ) {
        // Return error
        return res.json(
          compose.response(null, null, [
            { msg: "Cannot locate trade", location: "trade" },
          ])
        );
      }
    }

    // Ensure that trade has not started
    if (trade.to.confirmed || trade.middleman.confirmed) {
      // If trade has started, and user is not an administrator, return error
      if (
        !(res.locals.user.role.permissionLevel >= roles.administrator.permissionLevel)
      ) {
        // Return error
        return res.json(
          compose.response(null, null, [
            { msg: "Trade has already started", location: "trade" },
          ])
        );
      }
    }

    // Delete trade in database
    const tradeDelete = await db
      .collection("trades")
      .deleteOne({ _id: new ObjectId(req.params.id) });

    if (!tradeDelete.deletedCount) {
      // Return error
      return res.json(
        compose.response(null, null, [
          { msg: "Cannot delete trade", location: "trade" },
        ])
      );
    }

    // Return message to user
    return res.json(
      compose.response("Trade deleted", null, null)
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
