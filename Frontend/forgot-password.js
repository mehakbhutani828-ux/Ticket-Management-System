const API_URL = "http://localhost:4000";

let userEmail = "";


// ==========================================
// ELEMENTS
// ==========================================

const emailStep = document.getElementById("emailStep");
const otpStep = document.getElementById("otpStep");
const passwordStep = document.getElementById("passwordStep");

const emailForm = document.getElementById("emailForm");
const otpForm = document.getElementById("otpForm");
const passwordForm = document.getElementById("passwordForm");

const emailInput = document.getElementById("email");
const otpInput = document.getElementById("otp");
const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput =
    document.getElementById("confirmPassword");

const emailDisplay = document.getElementById("emailDisplay");

const emailMessage = document.getElementById("emailMessage");
const otpMessage = document.getElementById("otpMessage");
const passwordMessage =
    document.getElementById("passwordMessage");

const sendOtpBtn = document.getElementById("sendOtpBtn");
const verifyOtpBtn = document.getElementById("verifyOtpBtn");
const resetPasswordBtn =
    document.getElementById("resetPasswordBtn");

const resendOtpBtn =
    document.getElementById("resendOtpBtn");


// ==========================================
// HELPER FUNCTIONS
// ==========================================

function showStep(step) {

    emailStep.classList.add("hidden");
    otpStep.classList.add("hidden");
    passwordStep.classList.add("hidden");

    step.classList.remove("hidden");
}


function showMessage(element, message, type = "error") {

    element.textContent = message;

    element.className =
        `form-message ${type}`;
}


function clearMessages() {

    emailMessage.textContent = "";
    otpMessage.textContent = "";
    passwordMessage.textContent = "";

    emailMessage.className = "form-message";
    otpMessage.className = "form-message";
    passwordMessage.className = "form-message";
}


function setButtonLoading(button, loading, normalText) {

    button.disabled = loading;

    button.textContent =
        loading ? "Please wait..." : normalText;
}


// ==========================================
// SEND OTP
// ==========================================

emailForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    clearMessages();

    const email =
        emailInput.value.trim().toLowerCase();

    if (!email) {

        showMessage(
            emailMessage,
            "Please enter your email address."
        );

        return;
    }

    try {

        setButtonLoading(
            sendOtpBtn,
            true,
            "Send OTP"
        );

        const response = await fetch(
            `${API_URL}/auth/forgot-password`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to send OTP"
            );
        }

        userEmail = email;

        emailDisplay.textContent = email;

        showMessage(
            emailMessage,
            "OTP sent successfully. Check your email.",
            "success"
        );

        setTimeout(() => {

            showStep(otpStep);

        }, 700);

    } catch (error) {

        console.error(error);

        showMessage(
            emailMessage,
            error.message ||
            "Something went wrong."
        );

    } finally {

        setButtonLoading(
            sendOtpBtn,
            false,
            "Send OTP"
        );
    }
});


// ==========================================
// VERIFY OTP
// ==========================================

otpForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    clearMessages();

    const otp = otpInput.value.trim();

    if (!/^\d{6}$/.test(otp)) {

        showMessage(
            otpMessage,
            "Please enter a valid 6-digit OTP."
        );

        return;
    }

    try {

        setButtonLoading(
            verifyOtpBtn,
            true,
            "Verify OTP"
        );

        const response = await fetch(
            `${API_URL}/auth/verify-otp`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: userEmail,
                    otp
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            let message =
                data.message ||
                "OTP verification failed.";

            if (data.remainingAttempts !== undefined) {

                message +=
                    ` ${data.remainingAttempts} attempts remaining.`;
            }

            throw new Error(message);
        }

        showMessage(
            otpMessage,
            "OTP verified successfully.",
            "success"
        );

        setTimeout(() => {

            showStep(passwordStep);

        }, 500);

    } catch (error) {

        console.error(error);

        showMessage(
            otpMessage,
            error.message ||
            "Invalid OTP."
        );

    } finally {

        setButtonLoading(
            verifyOtpBtn,
            false,
            "Verify OTP"
        );
    }
});


// ==========================================
// RESEND OTP
// ==========================================

resendOtpBtn.addEventListener(
    "click",
    async () => {

        if (!userEmail) {

            showStep(emailStep);

            return;
        }

        try {

            resendOtpBtn.disabled = true;

            resendOtpBtn.textContent =
                "Sending...";

            const response = await fetch(
                `${API_URL}/auth/forgot-password`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: userEmail
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to resend OTP"
                );
            }

            otpInput.value = "";

            showMessage(
                otpMessage,
                "A new OTP has been sent to your email.",
                "success"
            );

        } catch (error) {

            console.error(error);

            showMessage(
                otpMessage,
                error.message ||
                "Failed to resend OTP."
            );

        } finally {

            resendOtpBtn.disabled = false;

            resendOtpBtn.textContent =
                "Resend OTP";
        }
    }
);


// ==========================================
// RESET PASSWORD
// ==========================================

passwordForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        clearMessages();

        const newPassword =
            newPasswordInput.value;

        const confirmPassword =
            confirmPasswordInput.value;


        if (newPassword.length < 6) {

            showMessage(
                passwordMessage,
                "Password must be at least 6 characters long."
            );

            return;
        }


        if (newPassword !== confirmPassword) {

            showMessage(
                passwordMessage,
                "Passwords do not match."
            );

            return;
        }


        try {

            setButtonLoading(
                resetPasswordBtn,
                true,
                "Reset Password"
            );

            const response = await fetch(
                `${API_URL}/auth/reset-password`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: userEmail,
                        newPassword
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Password reset failed."
                );
            }

            showMessage(
                passwordMessage,
                "Password reset successfully! Redirecting to login...",
                "success"
            );

            setTimeout(() => {

                window.location.href =
                    "login.html";

            }, 1500);

        } catch (error) {

            console.error(error);

            showMessage(
                passwordMessage,
                error.message ||
                "Failed to reset password."
            );

        } finally {

            setButtonLoading(
                resetPasswordBtn,
                false,
                "Reset Password"
            );
        }
    }
);


// ==========================================
// BACK TO LOGIN
// ==========================================

function goToLogin() {

    window.location.href = "login.html";
}