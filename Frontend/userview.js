const API_URL = "http://localhost:4000";

const token = localStorage.getItem("token");


// Protect page

if (!token) {

    window.location.href = "login.html";

}


// Load user's tickets

async function loadMyTickets() {

    const loadingMessage =
        document.getElementById("loadingMessage");

    const errorMessage =
        document.getElementById("errorMessage");

    const noTicketsMessage =
        document.getElementById("noTicketsMessage");

    try {

        loadingMessage.style.display = "block";

        errorMessage.innerText = "";

        noTicketsMessage.style.display = "none";


        const response = await fetch(
            `${API_URL}/tickets/my`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        const data = await response.json();

        console.log(data);


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to fetch tickets"
            );

        }


        displayTickets(data.tickets);

    }

    catch (error) {

        console.log(error);

        errorMessage.innerText =
            error.message;

    }

    finally {

        loadingMessage.style.display = "none";

    }

}


// Display tickets

function displayTickets(tickets) {

    const tableBody =
        document.getElementById("ticketsTableBody");

    const noTicketsMessage =
        document.getElementById("noTicketsMessage");


    tableBody.innerHTML = "";


    if (!tickets || tickets.length === 0) {

        noTicketsMessage.style.display = "block";

        return;

    }


    noTicketsMessage.style.display = "none";


    tickets.forEach(ticket => {

        const row =
            document.createElement("tr");
            row.style.cursor = "pointer";

row.addEventListener("click", function () {
    openCustomerTicketModal(ticket);
});


        const titleCell =
            document.createElement("td");

        titleCell.innerText =
            ticket.title;


        const descriptionCell =
            document.createElement("td");

        descriptionCell.innerText =
            ticket.description;


        const priorityCell =
            document.createElement("td");

        priorityCell.innerText =
            ticket.priority;


        const statusCell =
            document.createElement("td");

        statusCell.innerText =
            ticket.status.replace("_", " ");


        const createdCell =
            document.createElement("td");

        createdCell.innerText =
            new Date(ticket.createdAt)
                .toLocaleDateString();


        row.append(
            titleCell,
            descriptionCell,
            priorityCell,
            statusCell,
            createdCell
        );


        tableBody.appendChild(row);

    });

}
let currentCustomerTicketId = null;

function openCustomerTicketModal(ticket) {

    currentCustomerTicketId = ticket._id;

    document.getElementById(
        "customerModalTitle"
    ).innerText = ticket.title;

    document.getElementById(
        "customerModalDescription"
    ).innerText = ticket.description;

    document.getElementById(
        "customerModalPriority"
    ).innerText = ticket.priority;

    document.getElementById(
        "customerModalStatus"
    ).innerText =
        ticket.status.replace("_", " ");

    document.getElementById(
        "customerModalAgent"
    ).innerText =
        ticket.assignedTo?.name ||
        "Not assigned yet";

    document.getElementById(
        "customerModalCreated"
    ).innerText =
        new Date(ticket.createdAt)
            .toLocaleString();

    document.getElementById(
        "customerCommentInput"
    ).value = "";

    document.getElementById(
        "customerCommentMessage"
    ).innerText = "";

    document.getElementById(
        "customerTicketModal"
    ).style.display = "flex";

    loadCustomerComments(ticket._id);
}
async function loadCustomerComments(ticketId) {

    const container =
        document.getElementById(
            "customerCommentsContainer"
        );

    container.innerHTML =
        "<p>Loading messages...</p>";

    try {

        const response = await fetch(
            `${API_URL}/comments/tickets/${ticketId}/comments`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load messages"
            );
        }

        displayCustomerComments(data.comments);

    } catch (error) {

        console.log(error);

        container.innerHTML = `
            <p class="error-message">
                ${error.message}
            </p>
        `;
    }
}
function displayCustomerComments(comments) {

    const container =
        document.getElementById(
            "customerCommentsContainer"
        );

    container.innerHTML = "";

    if (!comments || comments.length === 0) {

        container.innerHTML = `
            <p>
                No messages yet.
                Start the conversation with your agent.
            </p>
        `;

        return;
    }

    comments.forEach(comment => {

        const messageDiv =
            document.createElement("div");

        messageDiv.className =
            "comment-message";

        const header =
            document.createElement("div");

        header.className =
            "comment-header";

        const name =
            document.createElement("strong");

        name.innerText =
            comment.user?.name ||
            "Unknown User";

        const role =
            document.createElement("span");

        role.innerText =
            comment.user?.role ||
            "";

        const date =
            document.createElement("small");

        date.innerText =
            new Date(comment.createdAt)
                .toLocaleString();

        header.append(
            name,
            role,
            date
        );

        const message =
            document.createElement("p");

        message.innerText =
            comment.message;

        messageDiv.append(
            header,
            message
        );

        container.appendChild(messageDiv);
    });
}
document
    .getElementById("customerSendCommentBtn")
    .addEventListener("click", async function () {

        const input =
            document.getElementById(
                "customerCommentInput"
            );

        const message = 
            input.value.trim();

        const messageBox =
            document.getElementById(
                "customerCommentMessage"
            );

        if (!currentCustomerTicketId) {

            messageBox.innerText =
                "No ticket selected.";

            return;
        }

        if (!message) {

            messageBox.innerText =
                "Please enter a message.";

            return;
        }

        try {

            this.disabled = true;

            messageBox.innerText =
                "Sending...";

            const response = await fetch(
                `${API_URL}/comments/tickets/${currentCustomerTicketId}/comments`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        message: message
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to send message"
                );
            }

            input.value = "";

            messageBox.innerText =
                "Message sent.";

            await loadCustomerComments(
                currentCustomerTicketId
            );

        } catch (error) {

            console.log(error);

            messageBox.innerText =
                error.message;

        } finally {

            this.disabled = false;
        }
    });
    document
    .getElementById("closeCustomerModalBtn")
    .addEventListener("click", function () {

        document.getElementById(
            "customerTicketModal"
        ).style.display = "none";

        currentCustomerTicketId = null;
    });     
    document
    .getElementById("customerTicketModal")
    .addEventListener("click", function (event) {

        if (event.target === this) {

            this.style.display = "none";

            currentCustomerTicketId = null;
        }
    });


// Back to dashboard

document
    .getElementById("backBtn")
    .addEventListener("click", function () {

        window.location.href =
            "dashboard.html";

    });


loadMyTickets();