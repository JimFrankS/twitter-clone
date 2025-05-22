import express from "express";
import dotenv from "dotenv";
import connectMongoDB from "./db/connectMongoDB.js";
import cookieParser from "cookie-parser"; // Import cookie-parser middleware
import { v2 as cloudinary } from "cloudinary"; // Import cloudinary for image uploading

import authRoutes from "./routes/auth.routes.js"; // Import the auth routes
import userRoutes from "./routes/user.routes.js"; // Import the user routes

dotenv.config(); // Load environment variables from .env file

cloudinary.config({ // Configure cloudinary with environment variables so we can use it to upload images
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Cloudinary cloud name
    api_key: process.env.CLOUDINARY_API_KEY, // Cloudinary API key
    api_secret: process.env.CLOUDINARY_API_SECRET, // Cloudinary API secret
});


const app = express();
const PORT = process.env.PORT || 5000; // Set the port to the value in .env or default to 5000

app.use(express.json()); // Middleware to parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded request bodies
app.use(cookieParser()); // Use cookie-parser middleware to parse cookies

app.use("/api/auth", authRoutes); // Use the auth routes for the /api/auth endpoint
app.use("/api/user", userRoutes);

app.listen (PORT, () => {
    console.log(`Server is running on port ${PORT}`); // Log the server port to the console
    connectMongoDB(); // Call the function to connect to MongoDB
});
