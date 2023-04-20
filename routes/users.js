const express = require("express");
const router = express.Router();
const { param } = require("express-validator");
const check = require("../middleware/check");

// URL: /users/:identifier
router.get(
  "/:identifier",
  check.auth,
  param("identifier").isAlpha(),
  require("../controllers/users/users.get")
);

module.exports = router;
