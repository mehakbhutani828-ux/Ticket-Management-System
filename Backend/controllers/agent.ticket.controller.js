const Ticket = require("../models/ticket.model");

const getMyTickets = async (req, res) => {

    try {

        const page = Math.max(
            1,
            parseInt(req.query.page, 10) || 1
        );

        const limit = 5;

        const skip = (page - 1) * limit;


        const search =
            req.query.search?.trim() || "";

        const status =
            req.query.status || "";

        const priority =
            req.query.priority || "";


        // Base condition:
        // Only tickets assigned to this agent

        const query = {
            assignedTo: req.user.userId
        };


        // Search

        if (search) {

            query.$or = [
                {
                    title: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    description: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ];

        }


        // Status filter

        if (status) {

            query.status = status;

        }


        // Priority filter

        if (priority) {

            query.priority = priority;

        }


        // Count matching tickets

        const totalTickets =
            await Ticket.countDocuments(query);


        const totalPages =
            Math.ceil(totalTickets / limit);


        // Fetch tickets

        const tickets =
            await Ticket.find(query)
                .populate(
                    "createdBy",
                    "name email"
                )
                .populate(
                    "assignedTo",
                    "name email"
                )
                .sort({
                    createdAt: -1,
                    _id: -1
                })
                .skip(skip)
                .limit(limit);


        res.status(200).json({

            message:
                "Assigned tickets fetched successfully",

            tickets,

            pagination: {

                currentPage: page,

                totalPages,

                totalTickets,

                limit,

                hasPreviousPage:
                    page > 1,

                hasNextPage:
                    page < totalPages

            }

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            message:
                "Failed to fetch assigned tickets",

            error: error.message

        });

    }

};
const updateMyTicket = async (req, res) => {

    try {

        const ticket = await Ticket.findOne({
            _id: req.params.id,
            assignedTo: req.user.userId
        });

        if (!ticket) {

            return res.status(404).json({
                message: "Ticket not found or not assigned to you"
            });

        }


        const { status } = req.body;


        const allowedStatuses = [
            "open",
            "in_progress",
            "resolved",
            "closed"
        ];


        if (!allowedStatuses.includes(status)) {

            return res.status(400).json({
                message: "Invalid ticket status"
            });

        }


        ticket.status = status;

        await ticket.save();


        res.status(200).json({
            message: "Ticket status updated successfully",
            ticket
        });

    }

    catch (error) {

        res.status(500).json({
            message: "Failed to update ticket",
            error: error.message
        });

    }
};

module.exports = {
    getMyTickets,
    updateMyTicket
};