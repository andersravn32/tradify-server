const database = require("../../utilities/database");
const roles = require("../../content/public/roles.json");

module.exports = async (user) => {
  try {
    // Get database connection
    const db = database.get();

    // Set user role to member in database
    const userUpdate = await db
      .collection("users")
      .updateOne({ uuid: user }, { $set: { role: roles.member } });
    if (!userUpdate.matchedCount) {
      return false;
    }

    // If everything succeeded, return true
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
