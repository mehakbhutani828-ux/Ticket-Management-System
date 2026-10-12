const token = localStorage.getItem("token");


// If user is not logged in
if (!token) {
    window.location.href = "login.html";
}


// Create ticket
document
    .getElementById("ticketForm")
    .addEventListener("submit", async function (event) {

        event.preventDefault();


        const title =
            document.getElementById("ticketTitle").value;

        const description =
            document.getElementById("ticketDescription").value;

        const priority =
            document.getElementById("ticketPriority").value;


        try {

            const response = await fetch(
                "http://localhost:4000/tickets",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        title,
                        description,
                        priority
                    })
                }
            );


            const data = await response.json();


            document.getElementById("ticketMessage").innerText =
                data.message;


            if (response.ok) {

                document
                    .getElementById("ticketForm")
                    .reset();


                
            }

        } catch (error) {

            console.log(error);

            document.getElementById("ticketMessage").innerText =
                "Unable to connect to server.";

        }

    });



// // Get user's tickets
async function loadMyTickets() {

    try {

        const response = await fetch(
            "http://localhost:4000/tickets/my",
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        const data = await response.json();


        if (!response.ok) {

            document.getElementById(
                "ticketsContainer"
            ).innerText = data.message;

            return;
        }


        const ticketsContainer =
            document.getElementById("ticketsContainer");


        if (data.tickets.length === 0) {

            ticketsContainer.innerHTML =
                "<p>No tickets found.</p>";

            return;
        }


        ticketsContainer.innerHTML = "";


        data.tickets.forEach(ticket => {

            const ticketElement =
                document.createElement("div");


            ticketElement.className = "ticket";


            ticketElement.innerHTML = `
                <h3>${ticket.title}</h3>

                <p>${ticket.description}</p>

                <p>
                    <strong>Priority:</strong>
                    ${ticket.priority}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${ticket.status}
                </p>

                <p>
                    <strong>Created:</strong>
                    ${new Date(ticket.createdAt).toLocaleString()}
                </p>
            `;


            ticketsContainer.appendChild(
                ticketElement
            );

        });


    } catch (error) {

        console.log(error);

        document.getElementById(
            "ticketsContainer"
        ).innerText =
            "Unable to load tickets.";

    }

}



// Back to dashboard
document
    .getElementById("backBtn")
    .addEventListener("click", function () {

        window.location.href = "dashboard.html";

    });



// Logout
document
    .getElementById("logoutBtn")
    .addEventListener("click", function () {

        localStorage.removeItem("token");
       
        window.location.href = "login.html";

    });



// Load tickets when page opens
loadMyTickets();