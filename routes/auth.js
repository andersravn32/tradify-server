const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");

// Provider based auth routes

// URL: /auth/provider/email/signin
router.use(
  "/provider/email/signin",
  body("email").isEmail(),
  body("password").isLength({ min: 8 }),
  require("../controllers/auth/provider/email.signin")
);

// URL: /auth/provider/email/signup
router.use(
  "/provider/email/signup",
  body("email").isEmail(),
  body("identifier").isLength({ min: 6, max: 24 }),
  body("password").isLength({ min: 8 }),
  require("../controllers/auth/provider/email.signup")
);

// General auth routes

// URL: /auth/refresh
router.use(
  "/refresh",
  body("token").isJWT(),
  require("../controllers/auth/refresh")
);

// URL: /auth/signout
router.use(
  "/signout",
  body("token").isJWT(),
  require("../controllers/auth/signout")
);

// URL: /auth/callback/:token
router.use(
  "/callback/:token",
  param("token").isJWT(),
  require("../controllers/auth/callback")
);
module.exports = router;
