const database = require("../../utilities/database");
const { ObjectId } = require("mongodb");

module.exports = async (trade, user) => {
  // Create correct database query, based on user role in trade
  let query = null;

  // User has from role in trade
  if (user.uuid == trade.from.uuid && !trade.from.confirmed) {
    return false;
  }

  // User has to role in trade
  if (user.uuid == trade.from.uuid && !trade.to.confirmed) {
    query = {
      "to.uuid": null,
    };
  }

  // User has middleman role in trade
  if (user.uuid == trade.middleman.uuid && !trade.middleman.confirmed) {
    query = {
      "middleman.uuid": null,
    };
  }

  // If no query was created, return false
  if (!query) {
    return false;
  }

  try {
    // Get database connection
    const db = database.get();

    // Update trade data in database
    const rejectQuery = await db.collection("trades").updateOne(
      { _id: new ObjectId(trade._id) },
      {
        $set: query,
      }
    );
    // If query was un-successful, return false
    if (!rejectQuery.modifiedCount) {
      return false;
    }

    // If trade was accepted, return true
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
