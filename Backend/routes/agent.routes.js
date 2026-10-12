const express = require("express");

const router = express.Router();

const {
    getMyTickets,
    updateMyTicket
} = require("../controllers/agent.ticket.controller");

const authMiddleware =
    require("../middleware/auth.middleware");

const authorize =
    require("../middleware/authorization.middleware");


router.get(
    "/tickets",
    authMiddleware,
    authorize("agent"),
    getMyTickets
);


router.patch(
    "/tickets/:id",
    authMiddleware,
    authorize("agent"),
    updateMyTicket
);


module.exports = router;