import express from "express";
import {
  login,
  register,
  verifyEmail,
  resendVerificationEmail,
} from "../controllers/authController.js";
const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/resend-verification-email", resendVerificationEmail);
router.get("/verify-email", verifyEmail);

export default router;

