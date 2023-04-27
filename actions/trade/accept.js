const database = require("../../utilities/database");
const { ObjectId } = require("mongodb");
const mail = require("../../utilities/mail");

module.exports = async (trade, user) => {
  // Create correct database query, based on user role in trade
  let query = null;

  // User has from role in trade
  if (user.uuid == trade.from.uuid && !trade.from.confirmed) {
    query = {
      "from.confirmed": 1,
    };
  }

  // User has to role in trade
  if (user.uuid == trade.to.uuid && !trade.to.confirmed) {
    query = {
      "to.confirmed": 1,
    };
  }

  // User has middleman role in trade
  if (user.uuid == trade.middleman.uuid && !trade.middleman.confirmed) {
    query = {
      "middleman.confirmed": 1,
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
    const acceptQuery = await db.collection("trades").updateOne(
      { _id: new ObjectId(trade._id) },
      {
        $set: query,
      }
    );
    // If query was un-successful, return false
    if (!acceptQuery.modifiedCount) {
      return false;
    }

    // Return complete trade dataset
    return await db
      .collection("trades")
      .findOne({ _id: new ObjectId(trade._id) });
  } catch (error) {
    console.log(error);
    return false;
  }
};
