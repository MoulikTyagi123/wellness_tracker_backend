const authService = require("../services/authService");
const User = require("../models/User");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");

const { sendVerificationEmail } = require("../services/emailService");

exports.signup = async (req, res) => {
  try {
    console.log("Signup request body:", req.body);
    const user = await authService.signup(req.body);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await user.save();

    // Send verification email
    await sendVerificationEmail(user.email, emailVerificationToken);

    res.status(201).json({
      message: "User created",
      user,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired token",
      });
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpires = undefined;

    await user.save();

    res.json({
      message: "Email verified successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.login = async (req, res) => {
  try {
    console.log("Login request body:", req.body);

    const result = await authService.login(req.body);

    console.log("Login result:", result);

    if (!result.user.isVerified) {
      return res.status(400).json({
        message: "Please verify your email first",
      });
    }

    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.passwordResetToken = resetToken;
    user.passwordResetTokenExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    const resetURL = `http://localhost:5000/api/auth/reset-password?token=${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset",
      text: `Reset your password using this link:\n\n${resetURL}`,
    });

    res.json({
      message: "Password reset email sent",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.query;
    const { newPassword } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired token",
      });
    }

    const bcrypt = require("bcryptjs");

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;

    await user.save();

    res.json({
      message: "Password reset successful",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ✅ GET PROFILE
exports.getMe = async (req, res) => {
  try {
    const { id: userId } = req.user;

    const user = await authService.getMe(userId);

    res.json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// ✅ UPDATE PROFILE
exports.updateMe = async (req, res) => {
  try {
    const { id: userId } = req.user;

    const user = await authService.updateMe(userId, req.body);

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
