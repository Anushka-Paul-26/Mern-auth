import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from "../config/emailTemplates.js";

// ------------------- COOKIE OPTIONS -------------------
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // HTTPS in prod (Render)
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", // cross-site cookies in prod
  maxAge: 7 * 24 * 60 * 60 * 1000,
  // domain: process.env.NODE_ENV === "production" ? ".onrender.com" : undefined, // optional
};

// ------------------- REGISTER -------------------
export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.json({ success: false, message: "Missing Details" });

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) return res.json({ success: false, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userModel({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, cookieOptions);

    // Send Welcome Email
    const welcomeMail = {
      from: `"My App" <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: "🎉 Welcome to My App!",
      html: `<p>Hi <b>${name}</b> 👋,<br>Your account has been created successfully! ✅</p>`,
    };
    try { await transporter.sendMail(welcomeMail); } catch (err) { console.error("Welcome mail error:", err); }

    await sendOtpAfterRegistration(user);

    return res.json({ success: true, message: "User registered successfully. OTP sent to email." });
  } catch (error) {
    console.error("Registration error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// ------------------- HELPER: Send OTP -------------------
const sendOtpAfterRegistration = async (user) => {
  try {
    // optional verify - good for debug but can be removed in prod
    await transporter.verify();

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 5 * 60 * 1000;
    await user.save();

    const otpMail = {
      from: `"My App" <${process.env.SENDER_EMAIL}>`,
      to: user.email,
      subject: "Account Verification OTP",
      html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email),
    };
    await transporter.sendMail(otpMail);
  } catch (error) {
    console.error("sendOtpAfterRegistration error:", error);
  }
};

// ------------------- LOGIN -------------------
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.json({ success: false, message: "Email and password are required" });

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: "Invalid email" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ success: false, message: "Invalid password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, cookieOptions);

    return res.json({ success: true, message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// ------------------- LOGOUT -------------------
export const logout = async (req, res) => {
  try {
    // Clear cookie with same options so browser removes correctly
    res.clearCookie("token", cookieOptions);
    return res.json({ success: true, message: "Logged out" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// ------------------- SEND VERIFY OTP -------------------
// Protected route (userAuth middleware). Use req.user.id (not req.body.userId).
export const sendVerifyOtp = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Not Authorized" });

    const user = await userModel.findById(userId);
    if (!user) return res.json({ success: false, message: "User not found" });
    if (user.isAccountVerified) return res.json({ success: false, message: "Account already verified" });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 5 * 60 * 1000;
    await user.save();

    const otpMail = {
      from: `"My App" <${process.env.SENDER_EMAIL}>`,
      to: user.email,
      subject: "Account Verification OTP",
      html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email),
    };
    await transporter.sendMail(otpMail);

    return res.json({ success: true, message: "Verification OTP sent to email" });
  } catch (error) {
    console.error("sendVerifyOtp error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// ------------------- VERIFY EMAIL -------------------
// Protected route (userAuth). Use req.user.id to identify user.
export const verifyEmail = async (req, res) => {
  const { otp } = req.body;
  if (!otp) return res.json({ success: false, message: "OTP is required" });

  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Not Authorized" });

    const user = await userModel.findById(userId);
    if (!user) return res.json({ success: false, message: "User not found" });

    if (user.verifyOtp === "" || user.verifyOtp !== otp) return res.json({ success: false, message: "Invalid OTP" });
    if (user.verifyOtpExpireAt < Date.now()) return res.json({ success: false, message: "OTP Expired" });

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();

    return res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("verifyEmail error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// ------------------- IS AUTHENTICATED -------------------
// Protected by userAuth — return a bit more info for frontend convenience
export const isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true, userId: req.user?.id || null });
  } catch (error) {
    console.error("isAuthenticated error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// ------------------- PASSWORD RESET -------------------
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ success: false, message: "Email is required" });

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetMail = {
      from: `"My App" <${process.env.SENDER_EMAIL}>`,
      to: user.email,
      subject: "Password Reset OTP",
      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email),
    };
    await transporter.sendMail(resetMail);

    return res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    console.error("sendResetOtp error:", error);
    return res.json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) return res.json({ success: false, message: "Email, OTP, and new password are required" });

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    if (user.resetOtp === "" || user.resetOtp !== otp) return res.json({ success: false, message: "Invalid OTP" });
    if (user.resetOtpExpireAt < Date.now()) return res.json({ success: false, message: "OTP Expired" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;
    await user.save();

    return res.json({ success: true, message: "Password has been reset successfully" });
  } catch (error) {
    console.error("resetPassword error:", error);
    return res.json({ success: false, message: error.message });
  }
};
