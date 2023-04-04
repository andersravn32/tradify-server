const { ObjectId } = require("mongodb");
const actions = require("../../../actions");
const compose = require("../../../utilities/compose");
const database = require("../../../utilities/database");

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

    // Use actions to accept trade
    if (!(await actions.trade.accept(trade, req.user))) {
      // Return error
      return res.json(
        compose.response(null, null, [
          { msg: "Cannot accept trade", location: "trade" },
        ])
      );
    }

    // Return response
    return res.json(compose.response("Accepted trade", null, null));
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
