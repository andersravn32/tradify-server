const express = require("express");
const router = express.Router();

// Auth specific routes
router.use("/auth", require("./auth"));

// Routes for serving static content
router.use("/content", require("./content"));

// Singular trade specific routes
router.use("/trade", require("./trade"));

// General trades specific routes
router.use("/trades", require("./trades"));

// General user route
router.use("/user", require("./user"));
module.exports = router;
