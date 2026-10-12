
const token = localStorage.getItem("token");

// If there is no token, go to login
if (!token) {
    window.location.href = "login.html";
}


// Hide all role-specific buttons initially

document.getElementById("customerButtons").style.display = "none";

document.getElementById("agentButtons").style.display = "none";

document.getElementById("adminButtons").style.display = "none";


// Load logged-in user

async function loadUser() {

    try {

        const response = await fetch(
            "http://localhost:4000/auth/me",
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        const data = await response.json();

        console.log(data);


        // Token is invalid / expired

        if (!response.ok) {

            localStorage.removeItem("token");

            window.location.href = "login.html";

            return;
        }


        // Display user information

        document.getElementById("welcomeUser").innerText =
            `Welcome, ${data.user.name}`;


        document.getElementById("userEmail").innerText =
            `Email: ${data.user.email}`;


        document.getElementById("userRole").innerText =
            `Role: ${data.user.role}`;


        // Get user's role

        const role = data.user.role;


        // =========================
        // CUSTOMER
        // =========================

        if (role === "customer") {

            document.getElementById("customerButtons")
                .style.display = "block";

        }


        // =========================
        // AGENT
        // =========================

        else if (role === "agent") {

            document.getElementById("agentButtons")
                .style.display = "block";

        }


        // =========================
        // ADMIN
        // =========================

        else if (role === "admin") {

            document.getElementById("adminButtons")
                .style.display = "block";

        }

    }

    catch (error) {

        console.log(error);

        document.getElementById("welcomeUser").innerText =
            "Unable to load user information";

    }
}


// =========================
// CUSTOMER NAVIGATION
// =========================

document
    .getElementById("ticketsBtn")
    .addEventListener("click", function () {

        window.location.href = "ticket.html";

    });


document
    .getElementById("viewTicketsBtn")
    .addEventListener("click", function () {

        window.location.href = "userview.html";

    });


// =========================
// AGENT NAVIGATION
// =========================

document
    .getElementById("agentBtn")
    .addEventListener("click", function () {

        window.location.href = "agent.html";

    });


// =========================
// ADMIN NAVIGATION
// =========================

document
    .getElementById("adminBtn")
    .addEventListener("click", function () {

        window.location.href = "admin.html";

    });


// =========================
// LOGOUT
// =========================

document
    .getElementById("logoutBtn")
    .addEventListener("click", function () {

        localStorage.removeItem("token");

        window.location.href = "login.html";

    });


// Load user

loadUser();



