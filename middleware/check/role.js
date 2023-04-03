const { validationResult } = require("express-validator");
const compose = require("../../utilities/compose");

module.exports = (role) => {
  return (req, res, next) => {
    const validatorErrors = validationResult(req);
    if (!validatorErrors.isEmpty()) {
      return res.json(compose.response(null, null, validatorErrors.array()));
    }

    // Ensure that user role is higher than or equal to that set as param
    if (req.user.role.permissionLevel >= role.permissionLevel) {
      return next();
    }

    // If user doesnt have permission, return error
    return res.json(
      compose.response(null, null, [
        { msg: "Insufficient permissions", location: "role" },
      ])
    );
  };
};
