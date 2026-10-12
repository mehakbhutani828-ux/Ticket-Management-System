const Ticket= require("../models/ticket.model");

const createTicket = async(req, res)=> {
    try{
        const { title, description, priority}= req.body;
        const ticket= await Ticket.create({
            title,
            description,
            priority,
            createdBy: req.user.userId
        });
        res.status(201).json({
            message:"Ticket created sucessfully", ticket
        });
    }
    catch(error){
        console.log(error);
        res.status(500).json({
            message:"Server error"
        });
    }
};

// get ticket

const getMyTickets = async(req, res)=>{
    try{
        const tickets= await Ticket.find({
            createdBy: req.user.userId
        })
        .populate("createdBy", "name email")
        .populate("assignedTo", "name email")
        .sort({
            createdAt: -1
        });
        res.status(200).json({
            message:"Tickets fetched sucessfully", tickets
        });
    }
    catch(error){
        console.log(error);
        res.status(500).json({
            message:"Server error"
        });
      }
};
module.exports= {
    createTicket,
    getMyTickets
};