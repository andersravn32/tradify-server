const express = require("express");
const router = express.Router();
const check = require("../middleware/check");

router.use("/users", check.auth, require("../controllers/search/users"))

module.exports = router;