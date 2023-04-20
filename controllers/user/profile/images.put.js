const { validationResult } = require("express-validator");
const compose = require("../../../utilities/compose");
const database = require("../../../utilities/database");
const roles = require("../../../content/public/roles.json");

module.exports = (imageField) => {
  return async (req, res) => {
    const validatorErrors = validationResult(req);
    if (!validatorErrors.isEmpty()) {
      return res.json(compose.response(null, null, validatorErrors.array()));
    }

    // Ensure that file is present on request object
    if (!req.file) {
      return res.json(
        compose.response(null, null, [
          {
            msg: "No file is present on request",
          },
        ])
      );
    }

    try {
      // Get database connection
      const db = database.get();

      // Ensure that only admin users can change foreign images
      if (
        req.imageUser.uuid != req.params.uuid &&
        !(res.locals.user.role.permissionLevel >= roles.administrator.permissionLevel)
      ) {
        return res.json(
          compose.response(null, null, [
            {
              msg: "Insufficient permissions",
              imageField: imageField,
            },
          ])
        );
      }

      // Set correct imagefield in query
      let query = {};

      if (imageField == "avatar") {
        query = {
          "profile.avatar": `${process.env.URL_BASE_BACKEND}/content/uploads/${req.file.filename}`,
        };
      }
      if (imageField == "cover") {
        query = {
          "profile.cover": `${process.env.URL_BASE_BACKEND}/content/uploads/${req.file.filename}`,
        };
      }

      // Update avatar file path in database
      const avatarUpdate = await db.collection("users").updateOne(
        { uuid: req.imageUser.uuid },
        {
          $set: query,
        }
      );

      if (!avatarUpdate.matchedCount) {
        return res.json(
          compose.response(null, null, [
            {
              msg: `Failed to set ${imageField}`,
              location: imageField,
            },
          ])
        );
      }
      // Return file data to user
      return res.json(
        compose.response(
          `Updated ${imageField}`,
          {
            fieldname: req.file.fieldname,
            encoding: req.file.encoding,
            filename: req.file.filename,
            path: `${process.env.URL_BASE_BACKEND}/content/uploads/${req.file.filename}`,
          },
          null
        )
      );
    } catch (error) {
      // Return error
      return res.json(
        compose.response(null, null, [
          { msg: "Internal server error", location: "trycatch", raw: error },
        ])
      );
    }
  };
};
