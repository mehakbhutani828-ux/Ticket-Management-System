const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendOtpEmail = async (to, otp) => {

    await transporter.sendMail({

        from: `"Ticket Management System" <${process.env.EMAIL_USER}>`,

        to: to,

        subject: "Password Reset OTP",

        html: `
            <div style="
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: auto;
                padding: 30px;
                border: 3px solid #ddd;
                border-radius: 10px;
            ">

                <h2>Password Reset</h2>

                <p>
                    You requested to reset your password.
                </p>

                <p>
                    Your OTP is:
                </p>

                <div style="
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 8px;
                    margin: 20px 0;
                ">
                    ${otp}
                </div>

                <p>
                    This OTP will expire in 10 minutes.
                </p>

                <p>
                    If you did not request a password reset,
                    you can safely ignore this email.
                </p>

            </div>
        `
    });
};


module.exports = {
    sendOtpEmail
};

