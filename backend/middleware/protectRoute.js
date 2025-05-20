import User from "../models/user.model.js";
import jwt from "jsonwebtoken"; // Import the jsonwebtoken library to handle JWTs

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt; // Get the JWT token from the cookies
        if (!token) {
            return res.status(401).json({ error: "Unauthorized: No token Provided" }); // Return a 401 error if the token is not present
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token using the secret key so that if someone to temper with the token, it will be invalidated
        if (!decoded) {
            return res.status(401).json({ error: "Unauthorized: Invalid token" }); // If the token is invalid, return a 401 error
        }

const user = await User.findById(decoded.userID).select("-password"); // Find the user in the database using the decoded user ID and exclude the password field from the result
        if (!user) {
            return res.status(401).json({ error: "Unauthorized: User not found" }); // If the user is not found, return a 401 error, this is to prevent someone from using the token of another user
        } 

        req.user = user; // Attach the user to the request object for use in the next middleware or route handler
        next(); // Call the next middleware or route handler or return the user data
     } catch (error) {
        console.error("Error in protectRoute middleware:", error); // Log the error to the console
        return res.status(500).json({ error: "Internal Server Error" }); // Return a 500 error if there is a server error
    }

};