const express = require("express");
const router = express.Router();
const check = require("../middleware/check");
const { param } = require("express-validator");

router.get(
  "/:id",
  check.auth,
  param("id").isMongoId(),
  require("../controller/trade/trade.get")
);

module.exports = router;
