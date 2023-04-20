const { validationResult } = require("express-validator");
const compose = require("../../../utilities/compose");
const database = require("../../../utilities/database");
const roles = require("../../../content/public/roles.json");

module.exports = async (req, res) => {
  const validatorErrors = validationResult(req);
  if (!validatorErrors.isEmpty()) {
    return res.json(compose.response(null, null, validatorErrors.array()));
  }

  try {
    // Get database connection
    const db = database.get();

    const user = await db
      .collection("users")
      .findOne({ uuid: req.params.uuid });
    if (!user) {
      return res.json(
        compose.response(null, null, [
          { msg: "Failed to locate profile", location: "profileUpdate" },
        ])
      );
    }

    // Ensure that only admin users can change foreign profiles
    if (
      res.locals.user.uuid != req.params.uuid &&
      !(res.locals.user.role.permissionLevel >= roles.administrator.permissionLevel)
    ) {
      return res.json(
        compose.response(null, null, [
          { msg: "Insufficient permissions", location: "profileUpdate" },
        ])
      );
    }

    user.profile = {
      ...user.profile,
      firstName: req.body.firstName || user.profile.firstName,
      lastName: req.body.lastName || user.profile.lastName,
      dob: req.body.dob || user.profile.dob,
      bio: req.body.bio || user.profile.bio,
    };

    // Update user profile with changes stored in request body
    const profileUpdate = await db.collection("users").updateOne(
      { uuid: req.params.uuid },
      {
        $set: {
          profile: user.profile,
        },
      }
    );

    if (!profileUpdate.matchedCount) {
      return res.json(
        compose.response(null, null, [
          { msg: "Failed to update profile", location: "profileUpdate" },
        ])
      );
    }

    // If no errors occurred, return new user profile to user
    return res.json(compose.response(null, user.profile, null));
  } catch (error) {
    console.log(error);
    // Return error
    return res.json(
      compose.response(null, null, [
        { msg: "Internal server error", location: "trycatch", raw: error },
      ])
    );
  }
};
