import express from "express";
import database from "./utilities/database";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";

const app = express();

const init = async () => {
  // Configure environment variables, loaded from either CI/CD or .env file
  dotenv.config();

  // Create database connection pool
  database.connect();

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