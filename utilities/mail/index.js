const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");

const transporter = nodemailer.createTransport({
  service: "iCloud",
  auth: {
    user: process.env.MAIL_AUTH_USER,
    pass: process.env.MAIL_AUTH_PASS,
  },
});

const send = async (
  subject = null,
  templateFile = null,
  user = null,
  data = null
) => {
  // Render ejs template with user and data objects
  const html = await ejs.renderFile(
    path.join(__dirname, `/templates/${templateFile}`),
    { user, data }
  );

  // Send email using nodemailer transporter
  return await transporter.sendMail({
    from: "Tradify <support@tradify.dk>",
    to: user.email,
    subject: subject,
    html: html,
  });
};

module.exports = {
  send,
};
