const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");

const auth = require("../middleware/auth");
const authController = require("../controllers/authController");

// AUTH
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/verify-email", authController.verifyEmail);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// GOOGLE
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Google login successful",
      token,
      user: req.user,
    });
  }
);

// ✅ PROFILE ROUTES (CORRECT)
router.get("/me", auth, authController.getMe);
router.put("/me", auth, authController.updateMe);

module.exports = router;