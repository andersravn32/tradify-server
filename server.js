const express = require("express");
const http = require("http");
const app = express();

const dotenv = require("dotenv");
dotenv.config();

const server = http.createServer(app);

app.get("*", (req, res) => {
  res.redirect("https://tradify.dk");
});

const init = async () => {
  server.listen(process.env.PORT);
  console.log("Server is listening at port " + process.env.PORT);
  console.log("CI Demo");
};

init();
