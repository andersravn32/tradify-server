const express = require("express");
const path = require("path");
const router = express.Router();

router.use(
  "/public",
  express.static(path.join(__dirname, "../content/public"))
);

module.exports = router;
