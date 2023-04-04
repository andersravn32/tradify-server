const { ObjectId } = require("mongodb");
const database = require("../../utilities/database");

module.exports = async (trade, user, rating) => {
  // If trade has already been completed
  if (trade.completed) {
    return false;
  }

  // Ensure that all participants in the trade has confirmed
  if (
    (trade.from.uuid && !trade.from.confirmed) ||
    (trade.to.uuid && !trade.to.confirmed) ||
    (trade.middleman.uuid && !trade.middleman.confirmed)
  ) {
    return false;
  }

  // Create correct database query, based on user role in trade
  let query = null;

  // User has from role in trade
  if (user.uuid == trade.from.uuid && trade.from.confirmed) {
    // If trade parameter: from, already has rating, return false
    if (trade.from.rating) {
      return false;
    }
    query = {
      "from.rating": rating,
    };
  }

  // User has to role in trade
  if (user.uuid == trade.to.uuid && trade.to.confirmed) {
    // If trade parameter: to, already has rating, return false
    if (trade.to.rating) {
      return false;
    }
    query = {
      "to.rating": rating,
    };
  }

  // User has middleman role in trade
  if (user.uuid == trade.middleman.uuid && trade.middleman.confirmed) {
    // If trade parameter: middleman, already has rating, return false
    if (trade.middleman.rating) {
      return false;
    }
    query = {
      "middleman.rating": rating,
    };
  }

  // If no query was created, return false
  if (!query) {
    return false;
  }

  try {
    // Get database connection
    const db = database.get();

    // Update rating in database
    const updateQuery = await db.collection("trades").updateOne(
      { _id: new ObjectId(trade._id) },
      {
        $set: query,
      }
    );
    // If query could not update anything, return error
    if (!updateQuery.modifiedCount) {
      return false;
    }

    // Locate updated trade in database
    const updatedTrade = await db
      .collection("trades")
      .findOne({ _id: new ObjectId(trade._id) });

    // Determine if trade has been completed or not, and if another update should occur
    let complete =
      !!(
        updatedTrade.from.rating &&
        updatedTrade.to.rating &&
        !updatedTrade.middleman.uuid
      ) ||
      !!(
        updatedTrade.from.rating &&
        updatedTrade.to.rating &&
        updatedTrade.middleman.uuid &&
        updatedTrade.middleman.rating
      );

    // If updating completed state is not neccesary, return updatedTrade to user
    if (!complete) {
      return updatedTrade;
    }

    // Update complete state in database, and return trade data
    const completeTrade = await db.collection("trades").updateOne(
      {
        _id: new ObjectId(trade._id),
      },
      {
        $set: {
          completed: true,
        },
      }
    );

    // If query could not update anything, return error
    if (!completeTrade.modifiedCount) {
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
