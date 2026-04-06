const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return null;
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.log(`[Email Mock] To: ${to} | Subject: ${subject}`);
      return;
    }
    await transporter.sendMail({
      from: '"HomeRent" <noreply@homerent.com>',
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error('Email send error:', err.message);
  }
};

module.exports = { sendEmail };
