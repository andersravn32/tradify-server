const express = require("express");
const router = express.Router();
const check = require("../middleware/check");
const roles = require("../content/public/roles.json");
const { body } = require("express-validator");

// URL: /trades/
router.post(
  "/",
  check.auth,
  check.role(roles.member),
  body("title").isLength({ min: 5, max: 50 }),
  body("description").isLength({ min: 25, max: 500 }),
  body("to").isObject(),
  body("middleman").isObject(),
  require("../controllers/trades/trades.post")
);

module.exports = router;
