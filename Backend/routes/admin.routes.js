const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const authorize = require("../middleware/authorization.middleware");
const{ getAllTickets, getAllAgents, updateTicket}=require("../controllers/admin.ticket.controller");

router.get("/", authMiddleware, authorize("admin"), (req, res) => {
    res.status(200).json({
        message: "Welcome to admin dashboard",
        user: req.user
    });
}
);

// get all ticket
router.get("/tickets", authMiddleware, authorize("admin") , getAllTickets);
router.get("/agents", authMiddleware, authorize("admin") , getAllAgents);
router.patch("/tickets/:id", authMiddleware, authorize("admin") , updateTicket);


module.exports= router;
