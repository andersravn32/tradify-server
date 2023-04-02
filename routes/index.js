const express = require("express");
const router = express.Router();

router.use("/auth", require("./auth"));

router.use("/content", require("./content"));

module.exports = router;