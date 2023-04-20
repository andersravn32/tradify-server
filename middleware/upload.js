const multer = require("multer");
const path = require("path");
const database = require("../utilities/database");
const roles = require("../content/public/roles.json");
const compose = require("../utilities/compose");

// Define multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../content/uploads/"));
  },

  filename: async (req, file, cb) => {
    // Get database connection
    const db = database.get();

    // Locate given user in database
    const user = await db.collection("users").findOne({
      uuid: req.params.uuid,
    });

    // If no user was found
    if (!user) {
      return cb("Failed to upload image", null);
    }

    // Ensure that only admin users can change foreign images
    if (
      res.locals.user.uuid != req.params.uuid &&
      !(res.locals.user.role.permissionLevel >= roles.administrator.permissionLevel)
    ) {
      return cb("Insufficient permissions", null);
    }

    req.imageUser = user;

    // Return filename based on specified user
    return cb(
      null,
      `${user.uuid}_${file.fieldname}${path.extname(file.originalname)}`
    );
  },
});

// Define file filter
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png"
  ) {
    return cb(null, true);
  }
  return cb(null, false);
};

// Define upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5000000,
  },
});

module.exports = upload;
