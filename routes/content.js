const express = require("express");
const path = require("path");
const check = require("../middleware/check");
const router = express.Router();

router.use(
  "/public",
  express.static(path.join(__dirname, "../content/public"))
);

router.use(
  "/uploads",
  check.auth,
  express.static(path.join(__dirname, "../content/public"))
);

module.exports = router;
