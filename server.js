const express = require("express");
const colors = require("colors");
const stripe = require('stripe')
// const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const paymentRoutes = require("./routes/paymentRoutes")
const path = require("path");

//dotenv config
dotenv.config();
 
//mongodb connection
connectDB();


//rest object
const app=express();

//middlewares
app.use(express.json());
// app.use(morgan("dev"));

const cors = require('cors'); // Import cors
app.use(cors()); // Use cors middleware
app.use(
  cors({
    origin: "http://localhost:3000", // Allow only this origin
  })
);

//routes
app.use('/api/v1/user',require("./routes/userRoutes"));
app.use("/api/v1/admin",require("./routes/adminRoutes"));
app.use("/api/v1/doctor", require("./routes/doctorRoutes"));
app.use("/api", paymentRoutes);


//static files
app.use(express.static(path.join(__dirname,"./client/build")))

app.get("*",function(req,res){
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
})

//listen port
const port = process.env.PORT || 5000;
app.listen(port,()=>{
    console.log(`Server Running in ${process.env.NODE_MODE} Mode on port ${process.env.PORT}`.bgCyan.white);
})