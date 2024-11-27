import express from "express";
import { register, verifyEmailOtp ,login, forgotPassword, resetPassword } from "../controllers/authController.js"

const router = express.Router();

// register a new user
router.post("/register", register);
// verify email otp
router.post("/verify-email-otp", verifyEmailOtp);
//login a user
router.post("/login", login);
// forgot password
router.post("/forgot-password", forgotPassword);
// reset password
router.put("/reset-password/:token", resetPassword);

export default router;

