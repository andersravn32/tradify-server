const { validationResult } = require("express-validator");
const compose = require("../../utilities/compose");
const database = require("../../utilities/database");
const roles = require("../../content/public/roles.json");

module.exports = async (req, res) => {
  const validatorErrors = validationResult(req);
  if (!validatorErrors.isEmpty()) {
    return res.json(compose.response(null, null, validatorErrors.array()));
  }
  const trade = {
    from: {
      uuid: req.user.uuid,
      rating: 0,
      confirmed: true,
    },
    to: {
      uuid: req.body.to.uuid,
      rating: 0,
      confirmed: false,
    },
    middleman: {
      uuid: req.body.middleman.uuid,
      rating: 0,
      confirmed: false,
    },
    title: req.body.title,
    description: req.body.description,
    date: new Date(),
    completed: false,
  };

  // Ensure that no duplicate parameters are present
  if (trade.to.uuid == req.user.uuid) {
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
  if (trade.middleman.uuid == req.user.uuid) {
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

  try {
    // Get database connection
    const db = database.get();

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

    // Insert trade into database
    const tradeInsert = await db.collection("trades").insertOne(trade);

    // TODO: Send email to: to user, and middleman user

    // Return id of trade to user
    return res.json(
      compose.response(
        null,
        {
          _id: tradeInsert.insertedId,
        },
        null
      )
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
