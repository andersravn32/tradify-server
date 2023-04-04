const express = require("express");
const router = express.Router();
const check = require("../middleware/check");
const { param, body } = require("express-validator");
const roles = require("../content/public/roles.json");

// URL: /trade/:id
router.get(
  "/:id",
  check.auth,
  param("id").isMongoId(),
  require("../controllers/trade/trade.get")
);

// URL: /trade/:id
router.put(
  "/:id",
  check.auth,
  check.role(roles.member),
  body("title").isLength({ min: 5, max: 50 }),
  body("description").isLength({ min: 25, max: 500 }),
  body("to").isObject(),
  body("middleman").isObject(),
  param("id").isMongoId(),
  require("../controllers/trade/trade.put")
);

// URL: /trade/:id
router.delete(
  "/:id",
  check.auth,
  param("id").isMongoId(),
  require("../controllers/trade/trade.delete")
);

// URL: /trade/:id/accept
router.use(
  "/:id/accept",
  check.auth,
  param("id").isMongoId(),
  require("../controllers/trade/trade.accept")
);

// URL: /trade/:id/reject
router.use(
  "/:id/reject",
  check.auth,
  param("id").isMongoId(),
  require("../controllers/trade/trade.reject")
);

module.exports = router;
