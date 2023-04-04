const express = require("express");
const check = require("../middleware/check");
const upload = require("../middleware/upload");
const router = express.Router();

// URL: /user/:uuid
router.get("/:uuid", check.auth, require("../controllers/user/user.get"));

// URL: /user/:uuid/profile
router.put(
  "/:uuid/profile",
  check.auth,
  require("../controllers/user/profile/profile.put")
);

// URL: /user/:uuid/profile/avatar
router.put(
  "/:uuid/profile/avatar",
  check.auth,
  upload.single("avatar"),
  require("../controllers/user/profile/images.put")("avatar")
);

// URL: /user/:uuid/profile/cover
router.put(
  "/:uuid/profile/cover",
  check.auth,
  upload.single("cover"),
  require("../controllers/user/profile/images.put")("cover")
);

module.exports = router;
