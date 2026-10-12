const express= require("express");
const router= express.Router();

const{register, login, getMe, forgotPassword, verifyOtp, resetPassword}= require("../controllers/auth.controller");

const authMiddleware = require("../middleware/auth.middleware");

router.post("/register", register);
router.post("/login", login);

router.get("/me", authMiddleware, getMe);

// forgot password

router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
module.exports= router;