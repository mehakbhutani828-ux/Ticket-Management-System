

const token = localStorage.getItem("token");

const API_URL = "http://localhost:4000";

let currentPage = 1;
const ticketsPerPage = 5;
let totalPages = 0;

// Check whether token exists
if (!token) {
    window.location.href = "login.html";
}


// Store agents fetched from backend
let agents = [];


// Common headers for protected APIs
function getHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}


// Load all tickets and agents
async function loadAdminDashboard() {

    try {

        const [ticketResponse, agentResponse] =
            await Promise.all([

                fetch(`${API_URL}/admin/tickets?page=${currentPage}`, {
                    method: "GET",
                    headers: getHeaders()
                }),

                fetch(`${API_URL}/admin/agents`, {
                    method: "GET",
                    headers: getHeaders()
                })

            ]);


        // Handle expired or invalid token
        if (
            ticketResponse.status === 401 ||
            agentResponse.status === 401
        ) {

            localStorage.removeItem("token");


            window.location.href = "login.html";

            return;
        }


        // Handle insufficient permissions
        if (
            ticketResponse.status === 403 ||
            agentResponse.status === 403
        ) {

            document.getElementById("adminMessage")
                .innerText =
                "You are not authorized to access this page.";

            document.getElementById(
                "adminTicketsContainer"
            ).innerText = "";

            return;
        }


        const ticketData = await ticketResponse.json();

        const agentData = await agentResponse.json();


        if (!ticketResponse.ok) {
            throw new Error(ticketData.message);
        }

        if (!agentResponse.ok) {
            throw new Error(agentData.message);
        }


        agents = agentData.agents;

        const pagination = ticketData.pagination;

        currentPage = pagination.currentPage;
        totalPages = pagination.totalPages;

        // document.getElementById("adminMessage")
        //     .innerText = "Welcome to Admin Dashboard";


        displayTickets(ticketData.tickets);
        displayPagination(pagination);
            document.getElementById("ticketCount")
        .innerText = `Total Tickets: ${pagination.totalTickets}`;

    } catch (error) {

        console.log(error);

        // document.getElementById("adminMessage")
        //     .innerText =
        //     error.message || "Unable to load admin dashboard.";

    }

}



// Display tickets
function displayTickets(tickets) {

    const container = document.getElementById(
        "adminTicketsContainer"
    );

    // document.getElementById("ticketCount")
    //     .innerText = `Total Tickets: ${tickets.length}`;

    // This is the total count from the backend, not current page length



    if (tickets.length === 0) {

        container.innerHTML = "<p>No tickets found.</p>";

        return;
    }


    container.innerHTML = "";


    tickets.forEach(ticket => {

        const ticketCard = document.createElement("div");

        ticketCard.className = "ticket";


        const customerName =
            ticket.createdBy?.name || "Unknown Customer";

        const customerEmail =
            ticket.createdBy?.email || "N/A";


        const assignedAgent =
            ticket.assignedTo?._id || "";


        const agentOptions = agents.map(agent => {

            const selected =
                String(agent._id) === String(assignedAgent)
                    ? "selected"
                    : "";

            return `
                <option value="${agent._id}" ${selected}>
                    ${agent.name} (${agent.email})
                </option>
            `;

        }).join("");


        ticketCard.innerHTML = `
            <h3>${ticket.title}</h3>

            <p>${ticket.description}</p>

            <p>
                <strong>Customer:</strong>
                ${customerName} (${customerEmail})
            </p>

            <p>
                <strong>Created:</strong>
                ${new Date(ticket.createdAt).toLocaleString()}
            </p>

            <label>Status</label>

            <select class="statusSelect">
                <option value="open"
                    ${ticket.status === "open" ? "selected" : ""}>
                    Open
                </option>

                <option value="in_progress"
                    ${ticket.status === "in_progress" ? "selected" : ""}>
                    In Progress
                </option>

                <option value="resolved"
                    ${ticket.status === "resolved" ? "selected" : ""}>
                    Resolved
                </option>

                <option value="closed"
                    ${ticket.status === "closed" ? "selected" : ""}>
                    Closed
                </option>
            </select>


            <label>Priority</label>

            <select class="prioritySelect">
                <option value="low"
                    ${ticket.priority === "low" ? "selected" : ""}>
                    Low
                </option>

                <option value="medium"
                    ${ticket.priority === "medium" ? "selected" : ""}>
                    Medium
                </option>

                <option value="high"
                    ${ticket.priority === "high" ? "selected" : ""}>
                    High
                </option>
            </select>


            <label>Assign Agent</label>

            <select class="agentSelect">

                <option value="">
                    Unassigned
                </option>

                ${agentOptions}

            </select>


            <button class="updateBtn">
                Save Changes
            </button>

            <p class="updateMessage"></p>
        `;


        const statusSelect =
            ticketCard.querySelector(".statusSelect");

        const prioritySelect =
            ticketCard.querySelector(".prioritySelect");

        const agentSelect =
            ticketCard.querySelector(".agentSelect");

        const updateBtn =
            ticketCard.querySelector(".updateBtn");

        const updateMessage =
            ticketCard.querySelector(".updateMessage");


        updateBtn.addEventListener("click", async function () {

            const updates = {
                status: statusSelect.value,
                priority: prioritySelect.value,
                assignedTo: agentSelect.value || null
            };


            try {

                updateBtn.disabled = true;

                updateBtn.innerText = "Saving...";


                const response = await fetch(
                    `${API_URL}/admin/tickets/${ticket._id}`,
                    {
                        method: "PATCH",
                        headers: getHeaders(),
                        body: JSON.stringify(updates)
                    }
                );


                const data = await response.json();


                if (response.status === 401) {

                    localStorage.removeItem("token");


                    window.location.href = "login.html";

                    return;
                }


                if (!response.ok) {

                    updateMessage.innerText = data.message;

                    return;
                }


                updateMessage.innerText =
                    "Ticket updated successfully!";


                // Refresh list with updated data
                await loadAdminDashboard();


            } catch (error) {

                console.log(error);

                updateMessage.innerText =
                    "Unable to update ticket.";

            } finally {

                updateBtn.disabled = false;

                updateBtn.innerText = "Save Changes";

            }

        });
        container.appendChild(ticketCard);
    });

}


function displayPagination(pagination) {

    const {
        totalPages,
        totalTickets,
        limit,
        hasPreviousPage,
        hasNextPage
    } = pagination;

    // Use the global currentPage variable
    const start = totalTickets === 0
        ? 0
        : (currentPage - 1) * limit + 1;

    const end = Math.min(
        currentPage * limit,
        totalTickets
    );

    document.getElementById("paginationInfo").innerText =
        `Showing ${start}-${end} of ${totalTickets} tickets`;


    // Previous button
    document.getElementById("prevPageBtn").disabled =
        !hasPreviousPage;

    // Next button
    document.getElementById("nextPageBtn").disabled =
        !hasNextPage;


    // Render page number buttons
    const pageNumbers =
        document.getElementById("pageNumbers");

    pageNumbers.innerHTML = "";


    for (let page = 1; page <= totalPages; page++) {

        const button = document.createElement("button");

        button.type = "button";

        button.innerText = page;

        button.className = "page-number";

        // THIS WAS MISSING
        button.dataset.page = page;


        if (page === currentPage) {
            button.classList.add("active");
        }

        pageNumbers.appendChild(button);
    }
}

document
    .getElementById("pageNumbers")
    .addEventListener("click", async function (event) {

        const button = event.target.closest(
            "button[data-page]"
        );

        if (!button) {
            return;
        }

        const selectedPage = Number(button.dataset.page);

        console.log("Page clicked:", selectedPage);


        // Correct validation
        if (
            !Number.isInteger(selectedPage) ||
            selectedPage < 1 ||
            selectedPage > totalPages ||
            selectedPage === currentPage
        ) {
            return;
        }


        currentPage = selectedPage;

        console.log("Calling API for page:", currentPage);

        await loadAdminDashboard();

});


// Logout
document
    .getElementById("logoutBtn")
    .addEventListener("click", function () {

        localStorage.removeItem("token");

        window.location.href = "login.html";

    });


// Load data when page opens
loadAdminDashboard();