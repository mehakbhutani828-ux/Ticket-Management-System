const express= require("express");
const router= express.Router();
const authMiddleware = require("../middleware/auth.middleware");

const { createTicket, getMyTickets}= require("../controllers/ticket.controller");

// create ticket
router.post("/", authMiddleware, createTicket );

// get ticket
router.get("/my", authMiddleware,getMyTickets );

module.exports= router;
