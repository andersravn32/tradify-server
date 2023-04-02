const database = require("../../utilities/database");

module.exports = async (user) => {
  try {
    // Get database connection
    const db = database.get();

    // Set user role to member in database
    const userUpdate = await db
      .collection("users")
      .updateOne(
        { uuid: user },
        { $set: { role: { title: "Medlem", permissionLevel: 1 } } }
      );
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
