import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

const router = express.Router();

// Setup nodemailer transporter (use Gmail app password)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "tannamalai02@gmail.com", // your Gmail address
    pass: "txznrpwnpgvgcohg"        // Gmail app password (not Gmail password)
  }
});

// REGISTER - allows role (default 0 = user)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role === 1 ? 1 : 0;

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: userRole,
    });

    // Send welcome email to user
    await transporter.sendMail({
      from: "tannamalai02@gmail.com",
      to: email,
      subject: "Welcome to Our App",
      text: `Hello ${name},\n\nThank you for registering!`
    });

    // Send notification email to admin
    await transporter.sendMail({
      from: "tannamalai02@gmail.com",
      to: "tannamalai02@gmail.com", // Admin email
      subject: "New User Registered",
      text: `A new user has registered: ${name} (${email})`
    });

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: error.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    // Create JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
