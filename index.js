const express = require("express");
const database = require("./utilities/database");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const helmet = require("helmet");

const app = express();

const init = async () => {
  // Configure environment variables, loaded from either CI/CD or .env file
  dotenv.config();

  // Create database connection pool
  await database.connect();

  // Set trust proxy flag
  app.set("trust proxy", true);

  // Enable morgan as primary logger
  app.use(morgan("common"));

  // Enable helmet
  app.use(helmet());

  // Configure cors
  app.use(cors({ origin: "*" }));

  // Configure express body-parser
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  // Add main router
  app.use(require("./routes"));

  // Listen to port provided as environment variable
  app.listen(process.env.PORT, () => {
    !process.env.NODE_ENV ? console.log("Server is ready for requests") : null;
  });
};

init();
