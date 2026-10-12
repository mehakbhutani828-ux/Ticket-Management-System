const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

const {
  getTicketComments,
  addTicketComment
} = require("../controllers/comment.controller");

router.get(
  "/tickets/:ticketId/comments",
  authMiddleware,
  getTicketComments
);

router.post(
  "/tickets/:ticketId/comments",
  authMiddleware,
  addTicketComment
);

module.exports = router;