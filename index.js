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

  // Enable morgan as primary logger
  app.use(morgan("common"));

  // Enable helmet
  app.use(helmet());

  // Configure cors
  app.use(cors({ origin: "*" }));

  // Configure express body-parser
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  // Listen to port provided as environment variable
  app.listen(process.env.PORT, () => {
    console.log("Server is ready for requests");
  })
}

init();