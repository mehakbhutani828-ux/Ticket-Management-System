const mongoose= require("mongoose");

const ticketSchema=new mongoose.Schema(
    {
        title:{
            type:String,
            required: [true, "Ticket title is required"],
            trim:true,
            minlength: [3, "Title must be atleast 3 characters"],
            maxlength: [100,"Title cannot exceed 100 characters"]

        },
        description:{
            type: String,
            required: [true, "Ticket description is required"],
            trim: true,
            minlength:[10, "Description must be atleast 10 characters"]
        },
        status:{
            type: String,
            enum: ["open","in_progress", "resolved", "closed"],
            default: "open"
        },
        priority:{
            type: String,
            enum:["low", "medium", "high"],
            default: "medium"
        },
        createdBy:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"User",
            required: true
        },
        assignedTo:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"User",
            default: null
        }
       
    },
    {
        timestamps: true
    }
);
const Ticket= mongoose.model("Ticket", ticketSchema);
module.exports= Ticket;