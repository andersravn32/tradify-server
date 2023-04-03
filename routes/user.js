const express = require("express");
const check = require("../middleware/check");
const router = express.Router();

// URL: /user/:uuid
router.get("/:uuid", check.auth, require("../controller/user/user.get"));

module.exports = router;
