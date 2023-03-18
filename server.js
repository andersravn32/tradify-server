const express = require("express");
const http = require("http");
const app = express();
const dotenv = require("dotenv");
const morgan = require("morgan");
const helmet = require("helmet");

const server = http.createServer(app);

// Async init function
const init = async () => {
  // Configure environment variables, loaded from either CI/CD or .env file
  dotenv.config();

  // Create database connection pool
  database.connect();

  // Enable morgan as primary logger
  app.use(morgan());

  // Enable helmet
  app.use(helmet());

  // Configure cors
  app.use(cors({ origin: "*" }));

  // Configure express body-parser
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  // Listen to default port 3000, or port provided from environment variables
  server.listen(process.env.PORT || 3000, () => {
    console.log("Server is ready for requests");
  });
};

init();
