const express = require("express");
const cors = require("cors");

require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

app.use(express.json());
app.use(cors());

connectDB();

app.get("/", (req, res) => {
    res.json({
        message: "Ticket Management System"
    });
});

app.use("/auth", require("./routes/auth.routes"));
app.use("/admin", require("./routes/admin.routes"));
app.use("/tickets", require("./routes/ticket.routes"));
app.use("/agent", require("./routes/agent.routes"));
app.use("/comments",require("./routes/comment.routes"));

app.listen(process.env.PORT, () => {
    console.log(
        `server running on port ${process.env.PORT}`
    );
});