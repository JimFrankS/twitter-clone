import express from 'express';
import { getMe, login, logout, signup } from '../controllers/auth.controllers.js'; // Import the signup, login, and logout controllers
import { protectRoute } from '../middleware/protectRoute.js';

const router = express.Router(); // Create a new router instance
router.get("/me", protectRoute, getMe); 
router.post("/signup", signup); 
router.post("/login", login);
router.post("/logout", logout);

// Export the routers to be used in the server.js file // This allows the routes to be accessible in other parts of the application

export default router;
