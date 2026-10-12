const bcrypt= require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto= require("crypto");
const {sendOtpEmail}= require("../services/email.service");

const User= require("../models/user.model");
// 1  register

const register = async(req, res)=> {
    try{
        const {name, email, password}= req.body;

        const existingUser= await User.findOne({email});

        if(existingUser){
            return res.status(409).json({
                message: "Email already registered"
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

       const user = await User.create({
    name,
    email,
    password: hashedPassword,
    // role: "agent"
});
        console.log(user);
        res.status(201).json({
            message: "Registration successful",
            user:{
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    }
    catch(error){
        console.log(error);
        res.status(500).json({
            message: "Server error"
        });
    }
};

// 2 login

const login= async(req, res)=>{
    try{
        const{email, password }= req.body;
        const user= await User.findOne({email});

        if(!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isPasswordCorrect= await bcrypt.compare(password, user.password);

        if(!isPasswordCorrect){
            return res.status(401).json({
                message:"Invalid email or password"
            });
        }
        const token= jwt.sign(
            {
                userId: user._id,
                email:user.email,
                role:user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );
        res.status(200).json({
            message: "Login Successful",
            token: token,
            user:{
                id: user._id,
                name: user.name,    
                email: user.email,
                role: user.role
            }
        });
    }
    catch(error){
        console.log(error);
        res.status(500).json({
            message: "server error"
        });
    }
}

// 3 getMe
const getMe= async(req, res)=> {
    try{
        const user= await User.findById(req.user.userId)
        .select("-password");
        if(!user){
            return res.status(404).json({
                message: "User not found"
            });
        }
        res.status(200).json({
            message: "User details fetched successfully",
            user:user
        });
    }
    catch(error){
        console.log(error);
        res.status(500).json({
            message: "Server error"
        });
    }
};

// 4 forgot password

const forgotPassword = async(req, res)=>{
    try{
        const email = req.body.email?.trim().toLowerCase();

        if(!email){
            return res.status(400).json({
                message:"Email is required"
            });
        }
        const user= await User.findOne({email});

        if(!user){
            return res.status(409).json({
                message:"Email doesn't exist"
            });
        }
        // generate 6-digit otp

        const otp = crypto.randomInt(100000, 1000000).toString();

        // otp expires after 10 minutes

        const otpExpires = new Date(Date.now()+ 10 * 60 * 1000);
        user.resetOtp= otp;
        user.resetOtpExpires= otpExpires;
        user.resetOtpAttempts= 0;
        user.resetOtpVerified= false;
        await user.save();
        try{
            await sendOtpEmail(user.email, otp);
        }
        catch(emailError){
            console.log("OTP email failed:", emailError);

            // clear otp if email could not be send       

            user.resetOtp= null;
            user.resetOtpExpires= null;
            user.resetOtpAttempts=0;
            user.resetOtpVerified= false;
            await user.save();
            return res.status(500).json({
                message:"Unable to send otp email"
            });
        }
        return res.status(200).json({
            message:"OTP sent successfully"
        });
    
    }
    catch(error){
        console.log("Forgot password error:", error);
        return res.status(500).json({
            message:"Server error"
        });
    }
};

// 5 verify otp

const verifyOtp = async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();
        const otp = req.body.otp?.trim();

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid OTP request"
            });
        }

        // Check whether OTP exists
        if (!user.resetOtp) {
            return res.status(400).json({
                message: "OTP not found. Please request a new OTP"
            });
        }

        // Check expiry
        if (
            !user.resetOtpExpires ||
            user.resetOtpExpires.getTime() < Date.now()
        ) {
            user.resetOtp = null;
            user.resetOtpExpires = null;
            user.resetOtpAttempts = 0;
            user.resetOtpVerified = false;

            await user.save();

            return res.status(400).json({
                message: "OTP has expired. Please request a new OTP"
            });
        }

        // Maximum 5 attempts
        if (user.resetOtpAttempts >= 5) {
            user.resetOtp = null;
            user.resetOtpExpires = null;
            user.resetOtpAttempts = 0;
            user.resetOtpVerified = false;

            await user.save();

            return res.status(429).json({
                message:
                    "Too many incorrect attempts. Please request a new OTP"
            });
        }

        // Check OTP
        if (user.resetOtp !== otp) {
            user.resetOtpAttempts += 1;

            await user.save();

            const remainingAttempts =
                5 - user.resetOtpAttempts;

            return res.status(400).json({
                message: "Incorrect OTP",
                remainingAttempts
            });
        }

        // OTP correct
        user.resetOtpVerified = true;

        await user.save();

        return res.status(200).json({
            message: "OTP verified successfully"
        });

    } catch (error) {
        console.log("Verify OTP error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

// 6 reset password

const resetPassword= async(req, res)=>{
    try{
        const email= req.body.email?.trim().toLowerCase();
        const newPassword= req.body.newPassword;
        if(!email || !newPassword){
            return res.status(400).json({
                message:"Email and new password are required"
            });
        }
        if(newPassword.length<6){
            return res.status(400).json({
                message:"Password must be atleast 6 characters"
            });
        }
        const user= await User.findOne({email});
        if(!user){
            return res.status(400).json({
                message:"Invalid password reset request"
            });
        }

        // OTP must have been verified first 
        
        if(!user.resetOtpVerified){
            return res.status(400).json({
                message:"OTP verification is required"
            });
        }

        // Make sure OTP has not expired

        if(!user.resetOtpExpires || user.resetOtpExpires.getTime()< Date.now()){
            user.resetOtp= null;
            user.resetOtpExpires= null;
            user.resetOtpAttempts= 0;
            user.resetOtpVerified= false;
            await user.save();
            return res.status(400).json({
                message:"Password reset session has expired. Please request a new OTP"
            });
        }
        // Hash new password
        const hashedPassword= await bcrypt.hash(newPassword, 10);
        user.password= hashedPassword;

        // clear OTP info
        user.resetOtp= null;
        user.resetOtpExpires= null;
        user.resetOtpAttempts=0;
        user.resetOtpVerified= false;
        await user.save();
        return res.status(200).json({
            message:"Password reset successfully"
        });
    }
    catch(error){
        console.log("Reset password error:", error);
        return res.status(500).json({
            message:"Server error"
        });
    }

};


module.exports= {register, login, getMe, forgotPassword, verifyOtp, resetPassword};