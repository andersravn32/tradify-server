const express = require("express");
const router = express.Router();
const { query } = require("express-validator");
const check = require("../middleware/check");

// URL: /users/?identifier=<user.identifier>
router.get(
  "/",
  check.auth,
  query("identifier").isAlpha(),
  require("../controllers/users/users.get")
);

module.exports = router;
