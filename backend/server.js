import express from "express";
import dotenv from "dotenv";
import connectMongoDB from "./db/connectMongoDB.js";
import cookieParser from "cookie-parser"; // Import cookie-parser middleware

import authRoutes from "./routes/auth.routes.js"; // Import the auth routes

dotenv.config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 5000; // Set the port to the value in .env or default to 5000

app.use(express.json()); // Middleware to parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded request bodies
app.use(cookieParser()); // Use cookie-parser middleware to parse cookies

app.use("/api/auth", authRoutes); // Use the auth routes for the /api/auth endpoint

app.listen (PORT, () => {
    console.log(`Server is running on port ${PORT}`); // Log the server port to the console
    connectMongoDB(); // Call the function to connect to MongoDB
});
