const mongoose = require("mongoose");
const Ticket = require("../models/ticket.model");
const User = require("../models/user.model");

// Get all ticket

const getAllTickets = async (req, res) => {
    try {

        const page = Math.max(
            1,
            parseInt(req.query.page, 10) || 1
        );
        const limit = 5;

        const skip = (page - 1) * limit;

        const totalTickets = await Ticket.countDocuments();

        const totalPages = Math.ceil(
            totalTickets / limit
        );

        const tickets = await Ticket.find()
            .populate("createdBy", "name email")
            .populate("assignedTo", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            message: "All tickets fetched successfully",
            tickets,
            pagination: {
                currentPage: page,
                totalPages,
                totalTickets,
                limit,

                hasPreviousPage: page > 1,
                hasNextPage: page < totalPages
            }
        });

    }
    catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};
// Get all agents

const getAllAgents = async (req, res) => {
    try {
        const agents = await User.find({
            role: "agent"
        }).select("name email");
        res.status(200).json({
            message: "Agents fetched successfully", agents
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Server error"
        });
    }
};

// update ticket

const updateTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, priority, assignedTo } = req.body;

        //    validate mongodb ticket ID

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid ticket ID"
            });
        }

        // Build update object only from allowed fields

        const updates = {};
        if (status != undefined) {
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
            updates.status = status;       

        }
        if (priority != undefined) {
            const allowedPriorities = [
                "low",
                "medium",
                "high"
            ];
            if (!allowedPriorities.includes(priority)) {
                return res.status(400).json({
                    message: "Invalid ticket priority"
                });
            }
            updates.priority = priority;
        }
        if (assignedTo != undefined) {
            if (assignedTo === null || assignedTo === "") {
                updates.assignedTo = null;
            }
            else {
                if (!mongoose.isValidObjectId(assignedTo)) { 
                    return res.status(400).json({
                        message: "Invalid agent ID"
                    });
                }

                const agent = await User.findOne({
                    _id: assignedTo,
                    role: "agent"
                });
                if (!agent) {
                    return res.status(400).json({
                        message: " Selected user is not an agent"
                    });
                }
                updates.assignedTo = agent._id;
            }
        }
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: "No valid fields provided for update"
            });
        }
        const ticket = await Ticket.findByIdAndUpdate(
            id, { $set: updates },
            {
                new: true,
                runValidators: true
            }
        )
            .populate("createdBy", "name email")
            .populate("assignedTo", "name email");
        if (!ticket) {
            return res.status(404).json({
                message: "Ticket not found"
            });
        }
        res.status(200).json({
            message: "Ticket updated sucesssfully", ticket
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Server error"
        });
    }
};
module.exports = { getAllTickets, getAllAgents, updateTicket };