const { verify } = require("hcaptcha");
const compose = require("../../middleware/check");

module.exports = async (req, res, next) => {
  const secret = process.env.CAPTCHA_SECRET;

  // Ensure captcha exists on request body
  if (!req.body.captcha) {
    // Return error
    return res.json(
      compose.response(null, null, [
        { msg: "Missing captcha", location: "check" },
      ])
    );
  }

  // Verify captcha token
  const { success } = await verify(secret, req.body.captcha);
  if (!success) {
    // Return error
    return res.json(
      compose.response(null, null, [
        { msg: "Captcha validation failed", location: "check" },
      ])
    );
  }

  return next();
};
