const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signup = async (data) => {
  const { name, email, password } = data;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  return user;
};

exports.login = async (data) => {
  const { email, password } = data;

  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  console.log("Password Match", isMatch);
  if (!isMatch) {
    throw new Error("Invalid password");
  }

  const token = jwt.sign({ id: user._id, role: user.role }, "secretkey", {
    expiresIn: "7d",
  });

  return { user, token };
};

exports.getMe = async (userId) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

exports.updateMe = async (userId, data) => {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      name: data.name,
      email: data.email,
    },
    { new: true },
  ).select("-password");

  return user;
};
