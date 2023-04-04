const { validationResult } = require("express-validator");
const compose = require("../../utilities/compose");
const database = require("../../utilities/database");
const roles = require("../../content/public/roles.json");
const { ObjectId } = require("mongodb");

module.exports = async (req, res) => {
  const validatorErrors = validationResult(req);
  if (!validatorErrors.isEmpty()) {
    return res.json(compose.response(null, null, validatorErrors.array()));
  }

  if (req.body.to.uuid == req.user.uuid) {
    // Return error
    return res.json(
      compose.response(null, null, [
        { msg: "Identical parameters: from.uuid, to.uuid", location: "trade" },
      ])
    );
  }
  if (req.body.middleman.uuid == req.user.uuid) {
    // Return error
    return res.json(
      compose.response(null, null, [
        {
          msg: "Identical parameters: from.uuid, middleman.uuid",
          location: "trade",
        },
      ])
    );
  }

  if (req.body.to.uuid == req.body.middleman.uuid) {
    // Return error
    return res.json(
      compose.response(null, null, [
        {
          msg: "Identical parameters: to.uuid, middleman.uuid",
          location: "trade",
        },
      ])
    );
  }

  try {
    // Get database connection
    const db = database.get();

    // Locate trade in database
    const trade = await db
      .collection("trades")
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!trade || !(trade.from.uuid == req.user.uuid)) {
      // Return error
      return res.json(
        compose.response(null, null, [
          { msg: "Cannot locate trade", location: "trade" },
        ])
      );
    }

    // Ensure that trade has not been started yet
    if (trade.to.confirmed || trade.middleman.confirmed) {
      // Return error
      return res.json(
        compose.response(null, null, [
          { msg: "Trade has already started", location: "trade" },
        ])
      );
    }

    // Ensure that no duplicate parameters are present
    if (req.body.to.uuid == req.user.uuid) {
      // Return error
      return res.json(
        compose.response(null, null, [
          {
            msg: "Located duplicate parameter: to",
            location: "trade.to",
          },
        ])
      );
    }
    if (req.body.middleman.uuid == req.user.uuid) {
      // Return error
      return res.json(
        compose.response(null, null, [
          {
            msg: "Located duplicate parameter: middleman",
            location: "trade.middleman",
          },
        ])
      );
    }

    // Locate user marked as receiver in database if user is present and role permissionLevel is higher than or equal member role
    const to =
      trade.to.uuid == null
        ? null
        : await db.collection("users").findOne({
            uuid: trade.to.uuid,
            "role.permissionLevel": {
              $gte: roles.member.permissionLevel,
            },
          });

    if (trade.to.uuid && !to) {
      // Return error
      return res.json(
        compose.response(null, null, [
          {
            msg: "Failed to locate trade parameter: to",
            location: "trade.to",
          },
        ])
      );
    }

    // Locate user marked as middleman in database if role permissionLevel is higher than or equal middleman
    const middleman =
      trade.middleman.uuid == null
        ? null
        : await db.collection("users").findOne({
            uuid: trade.middleman.uuid,
            "role.permissionLevel": {
              $gte: roles.middleman.permissionLevel,
            },
          });

    if (trade.middleman.uuid && !middleman) {
      // Return error
      return res.json(
        compose.response(null, null, [
          {
            msg: "Failed to locate trade parameter: middleman",
            location: "trade.middleman",
          },
        ])
      );
    }

    // Update trade object with new data received from request body
    const tradeUpdate = await db.collection("trades").updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          ...trade,
          title: req.body.title,
          description: req.body.description,
          to: {
            uuid: req.body.to.uuid,
            rating: trade.to.rating,
            confirmed: trade.to.confirmed,
          },
          middleman: {
            uuid: req.body.middleman.uuid,
            rating: trade.middleman.rating,
            confirmed: trade.middleman.confirmed,
          },
        },
      }
    );
    if (!tradeUpdate.acknowledged || !tradeUpdate.matchedCount) {
      // Return error
      return res.json(
        compose.response(null, null, [
          { msg: "Failed to update trade", location: "trade" },
        ])
      );
    }

    // Return trade id to user
    return res.json(
      compose.response(null, {
        _id: trade._id,
      })
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
