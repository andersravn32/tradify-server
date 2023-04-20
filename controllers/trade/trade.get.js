const { validationResult } = require("express-validator");
const compose = require("../../utilities/compose");
const database = require("../../utilities/database");
const { ObjectId } = require("mongodb");

module.exports = async (req, res) => {
  const validatorErrors = validationResult(req);
  if (!validatorErrors.isEmpty()) {
    return res.json(compose.response(null, null, validatorErrors.array()));
  }

  try {
    // Get database connection
    const db = database.get();

    // Locate trade data in database
    const tradeQuery = await db
      .collection("trades")
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!tradeQuery) {
      // Return error
      return res.json(
        compose.response(null, null, [
          { msg: "Failed to locate trade data", location: "trade" },
        ])
      );
    }

    if (req.query.ignoreUsers) {
      // Return trade data to user
      return res.json(compose.response(null, tradeQuery, null));
    }

    // Set trade from parameter
    if (tradeQuery.from.uuid) {
      const fromQuery = await db
        .collection("users")
        .findOne({ uuid: tradeQuery.from.uuid });
      delete fromQuery.password;
      delete fromQuery._id;
      if (!fromQuery) {
        // Return error
        return res.json(
          compose.response(null, null, [
            { msg: "Failed to locate user data", location: "trade" },
          ])
        );
      }

      tradeQuery.from = {
        ...tradeQuery.from,
        ...fromQuery,
      };
    }

    // Set trade to parameter
    if (tradeQuery.to.uuid) {
      const toQuery = await db
        .collection("users")
        .findOne({ uuid: tradeQuery.to.uuid });
      delete toQuery.password;
      delete toQuery._id;
      if (!toQuery) {
        // Return error
        return res.json(
          compose.response(null, null, [
            { msg: "Failed to locate user data", location: "trade" },
          ])
        );
      }

      tradeQuery.to = {
        ...tradeQuery.to,
        ...toQuery,
      };
    }

    // Set trade middleman parameter
    if (tradeQuery.middleman.uuid) {
      const middlemanQuery = await db
        .collection("users")
        .findOne({ uuid: tradeQuery.middleman.uuid });
      delete middlemanQuery.password;
      delete middlemanQuery._id;
      if (!middlemanQuery) {
        // Return error
        return res.json(
          compose.response(null, null, [
            { msg: "Failed to locate user data", location: "trade" },
          ])
        );
      }

      tradeQuery.middleman = {
        ...tradeQuery.middleman,
        ...middlemanQuery,
      };
    }

    // Return trade data to user
    return res.json(compose.response(null, tradeQuery, null));
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
