const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (email, token) => {
  const verificationLink = `http://localhost:5000/api/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify your account",
    html: `<p>Click this link to verify your account:</p>
           <a href="${verificationLink}">${verificationLink}</a>`,
  });
};

module.exports = { sendVerificationEmail };
