
const API_URL = "http://localhost:4000";

const token = localStorage.getItem("token");

// let allTickets = [];

let currentPage = 1;

let totalPages = 1;

const limit = 5;

let currentTicketId = null;


// Protect the page from unauthenticated users

if (!token) {
    window.location.href = "login.html";
}



// Fetch the logged-in agent's tickets

async function loadAgentDashboard() {

    const loadingMessage =
        document.getElementById("loadingMessage");

    const errorMessage =
        document.getElementById("errorMessage");


    loadingMessage.style.display = "block";

    errorMessage.innerText = "";


    try {

        const search =
            document.getElementById("searchInput")
                .value.trim();

        const status =
            document.getElementById("statusFilter")
                .value;

        const priority =
            document.getElementById("priorityFilter")
                .value;


        const params = new URLSearchParams({

            page: currentPage,

            limit: limit

        });


        if (search) {

            params.append(
                "search",
                search
            );

        }


        if (status) {

            params.append(
                "status",
                status
            );

        }


        if (priority) {

            params.append(
                "priority",
                priority
            );

        }


        const response = await fetch(
            `${API_URL}/agent/tickets?${params.toString()}`,
            {
                method: "GET",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to fetch tickets"
            );

        }


        displayTickets(data.tickets);

        displayStats(data.tickets);

        displayPagination(
            data.pagination
        );

    }

    catch (error) {

        console.log(error);

        errorMessage.innerText =
            error.message;

    }

    finally {

        loadingMessage.style.display =
            "none";

    }

}
// display pagination


function displayPagination(pagination) {

    const {
        currentPage: serverPage,
        totalPages: serverTotalPages,
        totalTickets,
        limit,
        hasPreviousPage,
        hasNextPage
    } = pagination;


    currentPage = serverPage;
    totalPages = serverTotalPages;




    const start =
        totalTickets === 0
            ? 0
            : (currentPage - 1) * limit + 1;


    const end =
        Math.min(
            currentPage * limit,
            totalTickets
        );


    document.getElementById(
        "paginationInfo"
    ).innerText =
        `Showing ${start}-${end} of ${totalTickets} tickets`;


    document.getElementById(
        "prevPageBtn"
    ).disabled =
        !hasPreviousPage;


    document.getElementById(
        "nextPageBtn"
    ).disabled =
        !hasNextPage;


    const pageNumbers =
        document.getElementById(
            "pageNumbers"
        );


    pageNumbers.innerHTML = "";


    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        const button =
            document.createElement("button");


        button.type = "button";

        button.innerText = page;

        button.className =
            "page-number";

        button.dataset.page =
            page;


        if (page === currentPage) {

            button.classList.add("active");

        }


        pageNumbers.appendChild(button);

    }

}
// prev button

document
    .getElementById("prevPageBtn")
    .addEventListener("click", async function () {

        if (currentPage <= 1) {
            return;
        }

        currentPage--;

        await loadAgentDashboard();

    });
// next button

document
    .getElementById("nextPageBtn")
    .addEventListener("click", async function () {

        if (currentPage >= totalPages) {
            return;
        }

        currentPage++;

        await loadAgentDashboard();

    });




// search
document
    .getElementById("searchInput")
    .addEventListener("keydown", async function (event) {

        if (event.key !== "Enter") {
            return;
        }


        currentPage = 1;

        await loadAgentDashboard();

    });

document
    .getElementById("pageNumbers")
    .addEventListener("click", async function (event) {

        const button =
            event.target.closest(
                "button[data-page]"
            );


        if (!button) {
            return;
        }


        const selectedPage =
            Number(button.dataset.page);


        if (
            !Number.isInteger(selectedPage) ||
            selectedPage < 1 ||
            selectedPage > totalPages ||
            selectedPage === currentPage
        ) {

            return;

        }


        currentPage =
            selectedPage;


        await loadAgentDashboard();

    });


// Display tickets in table

function displayTickets(tickets) {

    const tableBody =
        document.getElementById(
            "ticketsTableBody"
        );


    const noTicketsMessage =
        document.getElementById(
            "noTicketsMessage"
        );


    tableBody.innerHTML = "";


    if (tickets.length === 0) {

        noTicketsMessage.style.display =
            "block";

        return;

    }


    noTicketsMessage.style.display =
        "none";



    tickets.forEach(ticket => {

        const row =
            document.createElement("tr");


        row.dataset.ticketId =
            ticket._id;


        row.style.cursor =
            "pointer";



        const titleCell =
            document.createElement("td");

        titleCell.innerText =
            ticket.title;



        const customerCell =
            document.createElement("td");

        customerCell.innerText =
            ticket.createdBy?.name ||
            "Unknown";



        const priorityCell =
            document.createElement("td");

        priorityCell.innerText =
            ticket.priority;



        const statusCell =
            document.createElement("td");

        statusCell.innerText =
            ticket.status.replace(
                "_",
                " "
            );



        const createdCell =
            document.createElement("td");

        createdCell.innerText =
            new Date(
                ticket.createdAt
            ).toLocaleDateString();



        row.append(
            titleCell,
            customerCell,
            priorityCell,
            statusCell,
            createdCell
        );



        // Ticket row click

        row.addEventListener(
            "click",
            function () {

                openTicketModal(ticket);

            }
        );



        tableBody.appendChild(row);

    });

}



// Open ticket modal

function openTicketModal(ticket) {

    document.getElementById(
        "modalTicketTitle"
    ).innerText =
        ticket.title;


    document.getElementById(
        "modalCustomer"
    ).innerText =
        ticket.createdBy?.name ||
        "Unknown";


    document.getElementById(
        "modalCustomerEmail"
    ).innerText =
        ticket.createdBy?.email ||
        "Unknown";


    document.getElementById(
        "modalDescription"
    ).innerText =
        ticket.description;


    document.getElementById(
        "modalPriority"
    ).innerText =
        ticket.priority;


    document.getElementById(
        "modalStatus"
    ).value =
        ticket.status;


    document.getElementById(
        "modalCreatedAt"
    ).innerText =
        new Date(
            ticket.createdAt
        ).toLocaleString();



    // Store ticket ID on update button

    document.getElementById(
        "updateStatusBtn"
    ).dataset.ticketId =
        ticket._id;

// Store current ticket ID
currentTicketId = ticket._id;
    // Clear old message

    document.getElementById(
        "modalMessage"
    ).innerText = "";

loadAgentComments(ticket._id);

    // Show modal

    document.getElementById(
        "ticketModal"
    ).style.display =
        "flex";

}



// Close ticket modal

document
    .getElementById("closeModalBtn")
    .addEventListener("click", function () {

        document.getElementById("ticketModal")
            .style.display = "none";

    });
document
    .getElementById("ticketModal")
    .addEventListener("click", function (event) {

        if (event.target === this) {

            this.style.display = "none";

        }

    });


// Calculate dashboard statistics

function displayStats(tickets) {

    //   document.getElementById("totalAssigned").innerText =
    //     data.pagination.totalTickets;
    document.getElementById("totalAssigned").innerText =
        tickets.length;


    document.getElementById(
        "openTickets"
    ).innerText =
        tickets.filter(
            ticket =>
                ticket.status === "open"
        ).length;


    document.getElementById(
        "inProgressTickets"
    ).innerText =
        tickets.filter(
            ticket =>
                ticket.status === "in_progress"
        ).length;


    document.getElementById(
        "resolvedTickets"
    ).innerText =
        tickets.filter(
            ticket =>
                ticket.status === "resolved"
        ).length;

}



// Apply status and priority filters

// function applyFilters() {

// const selectedStatus =
//     document.getElementById(
//         "statusFilter"
//     ).value;


// const selectedPriority =
//     document.getElementById(
//         "priorityFilter"
//     ).value;



// const filteredTickets =
//     allTickets.filter(ticket => {


//         const statusMatches =
//             !selectedStatus ||
//             ticket.status ===
//                 selectedStatus;


//         const priorityMatches =
//             !selectedPriority ||
//             ticket.priority ===
//                 selectedPriority;


//         return (
//             statusMatches &&
//             priorityMatches
//         );

//     });



// displayTickets(
//     filteredTickets
// );





// // Status filter

document
    .getElementById("statusFilter")
    .addEventListener("change", async function () {

        currentPage = 1;

        await loadAgentDashboard();

    });




// // Priority filter
document
    .getElementById("priorityFilter")
    .addEventListener("change", async function () {

        currentPage = 1;

        await loadAgentDashboard();

    });





document
    .getElementById("updateStatusBtn")
    .addEventListener("click", async function () {

        const ticketId =
            this.dataset.ticketId;

        const newStatus =
            document.getElementById("modalStatus")
                .value;

        const modalMessage =
            document.getElementById("modalMessage");

        modalMessage.innerText =
            "Updating status...";


        try {

            const response = await fetch(
                `${API_URL}/agent/tickets/${ticketId}`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type": "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        status: newStatus
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to update status"
                );

            }


            modalMessage.innerText =
                "Status updated successfully.";


            // Reload dashboard

            await loadAgentDashboard();


            // Close modal

            setTimeout(function () {

                document.getElementById("ticketModal")
                    .style.display = "none";

            }, 500);

        }

        catch (error) {

            console.log(error);

            modalMessage.innerText =
                error.message;

        }

    });
    async function loadAgentComments(ticketId) {

    const container =
        document.getElementById("agentCommentsContainer");
if(!container){
    console.error("agent comment container not found");
    return;
}

container.innerHTML=`<p>Loading messages...</p>`;

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
                data.message || "Failed to load messages"
            );
        }

        displayAgentComments(data.comments);

    } catch (error) {

        console.log(error);

        container.innerHTML = `
            <p class="error-message">
                ${error.message}
            </p>
        `;
    }
}

function displayAgentComments(comments) {

    const container =
        document.getElementById("agentCommentsContainer");

    container.innerHTML = "";

    if (!comments || comments.length === 0) {

        container.innerHTML = `
            <p id="agentNoComments">
                No messages yet. Start the conversation.
            </p>
        `;

        return;
    }

    comments.forEach(comment => {

        const messageDiv =
            document.createElement("div");

        messageDiv.className = "comment-message";

        const header =
            document.createElement("div");

        header.className = "comment-header";

        const userName =
            document.createElement("strong");

        userName.innerText =
            comment.user?.name || "Unknown User";

        const userRole =
            document.createElement("span");

        userRole.innerText =
            comment.user?.role || "";

        const date =
            document.createElement("small");

        date.innerText =
            new Date(comment.createdAt)
                .toLocaleString();

        header.append(
            userName,
            userRole,
            date
        );

        const message =
            document.createElement("p");

        message.innerText = comment.message;

        messageDiv.append(
            header,
            message
        );

        container.appendChild(messageDiv);
    });
}
document
    .getElementById("agentSendCommentBtn")
    .addEventListener("click", async function () {

        const input =
            document.getElementById("agentCommentInput");

        const message =
            input.value.trim();

        const messageBox =
            document.getElementById("agentCommentMessage");

        if (!currentTicketId) {
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
                `${API_URL}/comments/tickets/${currentTicketId}/comments`,
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

            await loadAgentComments(currentTicketId);

        } catch (error) {

            console.log(error);

            messageBox.innerText =
                error.message;

        } finally {

            this.disabled = false;
        }
    });



// Logout

document
    .getElementById("logoutBtn")
    .addEventListener(
        "click",
        function (event) {

            event.preventDefault();


            localStorage.removeItem(
                "token"
            );


            window.location.href =
                "login.html";

        }
    );



// Load dashboard

loadAgentDashboard();

