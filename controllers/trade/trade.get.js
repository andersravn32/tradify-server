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
