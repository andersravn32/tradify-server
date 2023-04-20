const express = require("express");
const router = express.Router();
const { params } = require("express-validator");
const check = require("../middleware/check");

// URL: /users/?identifier=<user.identifier>
router.get(
  "/:identifier",
  check.auth,
  params("identifier").isAlpha(),
  require("../controllers/users/users.get")
);

module.exports = router;
