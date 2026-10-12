document
    .getElementById("loginForm")
    .addEventListener("submit", async function (event) {

        event.preventDefault();

        const email =
            document.getElementById("loginEmail").value;

        const password =
            document.getElementById("loginPassword").value;

        try {

            const response = await fetch(
                "http://localhost:4000/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );

            const data = await response.json();

            document.getElementById("loginMessage").innerText =
                data.message;

            if (response.ok) {

                // Save JWT
                localStorage.setItem(
                    "token",
                    data.token
                );

                // Go to dashboard
                window.location.href =
                    "dashboard.html";
            }

        } catch (error) {

            document.getElementById("loginMessage").innerText =
                "Unable to connect to server";

        }

    });

