const { ObjectId } = require("mongodb");
const database = require("../../../utilities/database");
const { validationResult } = require("express-validator");
const compose = require("../../../utilities/compose");
const actions = require("../../../actions");

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

    // Use actions to rate trade
    const action = await actions.trade.rate(trade, req.user, req.body.rating);
    if (!action) {
      // Return error
      return res.json(
        compose.response(null, null, [
          { msg: "Cannot rate trade", location: "trade" },
        ])
      );
    }

    // Return response
    return res.json(compose.response("Rated trade", action, null));
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
