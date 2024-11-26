import express from "express";
import { register, login, forgotPassword, resetPassword } from "../controllers/authController"

const router = express.Router();

// register a new user
router.post("/register", register);
//login a user
router.post("/login", login);
// forgot password
router.post("/forgot-password", forgotPassword);
// reset password
router.put("/reset-password/:token", resetPassword);

export default router;

