const nodemailer = require('nodemailer');

const sendEmail = async options => {
  const port = Number(process.env.EMAIL_PORT) || 587;
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USERNAME,
    to: options.email,
    subject: options.subject,
    text: options.message
  });
};

module.exports = sendEmail;
