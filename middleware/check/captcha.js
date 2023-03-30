const { verify } = require("hcaptcha");

module.exports = async (req, res, next) => {
  const secret = process.env.CAPTCHA_SECRET;

  // Ensure captcha exists on request body
  if (!req.body.captcha) {
    return;
  }

  // Verify captcha token
  const { success } = await verify(secret, req.body.captcha);
  if (!success){
    return;
  }

  return next();
};
