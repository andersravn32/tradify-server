import { MongoClient } from "mongodb";
var connection: MongoClient | null = null;

export default {
  connect: async () => {
    // Create database connection
    connection = await MongoClient.connect(process.env.MONGODB || "");

    // If connection failed, throw error
    if (!connection) {
      throw Error("Failed to connect to database");
    }

    // Return connection object
    return connection.db(process.env.MONGODB_NAME);
  },

  get: () => {
    // If no connection is present, throw error
    if (!connection) {
      throw Error("Failed to connect to database");
    }

    // Return connection object
    return connection.db(process.env.MONGODB_NAME);
  },
};