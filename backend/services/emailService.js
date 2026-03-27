const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (email, token) => {
  const verificationLink = `https://wellness-tracker-backend-4if1.onrender.com/api/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    from: "WellTrack Team"`<${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Welcome to WellTrack – Verify Your Email (Optional)",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
        
        <h2 style="color: #031A6B;">Welcome to WellTrack 🎉</h2>
        
        <p>Your account has been created successfully.</p>

        <p>You can start using the app immediately — no verification required.</p>

        <p>If you'd like, you can verify your email for better security:</p>

        <a href="${verificationLink}" 
           style="
             display: inline-block;
             margin-top: 10px;
             padding: 10px 18px;
             background-color: #031A6B;
             color: #ffffff;
             text-decoration: none;
             border-radius: 6px;
             font-weight: bold;
           ">
           Verify Email
        </a>

        <p style="margin-top: 20px; font-size: 12px; color: gray;">
          If you didn’t create this account, you can ignore this email.
        </p>

      </div>
    `,
  });
};

module.exports = { sendVerificationEmail };
