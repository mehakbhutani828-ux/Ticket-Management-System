
const Comment = require("../models/comment.model");
const Ticket = require("../models/ticket.model");

const getTicketComments = async (req, res) => {
    try {
        const { ticketId } = req.params;

        const ticket = await Ticket.findById(ticketId);

        if (!ticket) {
            return res.status(404).json({
                message: "Ticket not found"
            });
        }

        // Customer can access only their own ticket
        if (
            req.user.role === "customer" &&
            ticket.createdBy.toString() !== req.user.userId
        ) {
            return res.status(403).json({
                message: "You are not allowed to view this conversation"
            });
        }

        // Agent can access only tickets assigned to them
        if (
            req.user.role === "agent" &&
            (
                !ticket.assignedTo ||
                ticket.assignedTo.toString() !== req.user.userId
            )
        ) {
            return res.status(403).json({
                message: "You are not allowed to view this conversation"
            });
        }

        const comments = await Comment.find({
            ticket: ticketId
        })
            .populate("user", "name email role")
            .sort({ createdAt: 1 });

        res.status(200).json({
            message: "Conversation fetched successfully",
            comments
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Failed to fetch conversation",
            error: error.message
        });
    }
};


const addTicketComment = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                message: "Message is required"
            });
        }

        const ticket = await Ticket.findById(ticketId);

        if (!ticket) {
            return res.status(404).json({
                message: "Ticket not found"
            });
        }

        // Customer only their own tickets
        if (
            req.user.role === "customer" &&
            ticket.createdBy.toString() !== req.user.userId
        ) {
            return res.status(403).json({
                message: "You cannot comment on this ticket"
            });
        }

        // Agent only assigned tickets
        if (
            req.user.role === "agent" &&
            (
                !ticket.assignedTo ||
                ticket.assignedTo.toString() !== req.user.userId
            )
        ) {
            return res.status(403).json({
                message: "You cannot comment on this ticket"
            });
        }

        const comment = await Comment.create({
            ticket: ticketId,
            user: req.user.userId,
            message: message.trim()
        });

        const populatedComment = await comment.populate(
            "user",
            "name email role"
        );

        res.status(201).json({
            message: "Comment added successfully",
            comment: populatedComment
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Failed to add comment",
            error: error.message
        });
    }
};


module.exports = {
    getTicketComments,
    addTicketComment
};