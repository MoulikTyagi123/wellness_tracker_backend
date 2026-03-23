const mongoose = require("mongoose");
const ROLE = require("../constants/Role");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
    },

    role: {
      type: String,
      enum: ROLE,
      default: "user",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    googleId: {
      type: String,
    },

    emailVerificationToken: {
      type: String,
    },

    emailVerificationTokenExpires: {
      type: Date,
    },
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
