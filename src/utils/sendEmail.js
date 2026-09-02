const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  try {
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
      console.log(
        `[Email Notification Mock] To: ${options.email} | Subject: ${options.subject}`
      );
      return true;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Gambling Harms UK" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Sent] MessageId: ${info.messageId} to ${options.email}`);
    return true;
  } catch (error) {
    console.error(`[Email Sending Failed] To: ${options.email}`, error.message);
    return false;
  }
};

module.exports = sendEmail;
