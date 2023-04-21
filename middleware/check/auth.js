const { validationResult } = require("express-validator");
const database = require("../../utilities/database");
const compose = require("../../utilities/compose");
const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  const validatorErrors = validationResult(req);
  if (!validatorErrors.isEmpty()) {
    return res.json(compose.response(null, null, validatorErrors.array()));
  }

  try {
    // Get token from request headers or request query
    const token = jwt.verify(
      req.headers.authorization || req.query.token,
      process.env.JWT_AUTH
    );

    // Set user as token data
    req.user = {
      uuid: token.uuid,
      email: token.email,
      identifier: token.identifier,
      role: token.role,
    };

    // Complete middleware
    next();
  } catch (error) {
    // Return error
    return res.json(
      compose.response(null, null, [
        { msg: "Failed to validate JWT", location: "trycatch", raw: error },
      ])
    );
  }
};
