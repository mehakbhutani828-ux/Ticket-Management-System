const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must be atleast 2 characters"]
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            validate: {
                validator: validator.isEmail,
                message: "please enter a valid email"
            }
        },
        password: {
            type: String,
            required: [true, "password is required"],
            minlength: [6, "password must be atleast 6 characters"]
        },
        role: {
            type: String,
            enum: ["customer", "agent", "admin"],
            default: "customer"
        },
        resetOtp: {
            type: String,
            default: null
        },

        resetOtpExpires: {
            type: Date,
            default: null
        },
        resetOtpAttempts:{
            type: Number,
            default:0
        },
        resetOtpVerified:{
            type: Boolean,
            default: false
        }
    },

    {
        timestamps: true
    }

);


const User = mongoose.model("User", userSchema);
module.exports = User;
