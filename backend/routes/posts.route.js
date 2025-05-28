import express from 'express'; // Import express for creating the router
import { protectRoute } from '../middleware/protectRoute.js'; // Import the middleware to protect routes
import { commentOnPost, createPost, deletePost, getAllPosts, getFollowingPosts, getLikedPosts, getUserPosts, likeUnlikePost } from '../controllers/post.controller.js';

const router = express.Router();

router.get("/all", protectRoute, getAllPosts); // Route to get all posts, protected by the protectRoute middleware
router.get("/following", protectRoute, getFollowingPosts); // Route to get posts from users that the current user is following, protected by the protectRoute middleware
router.get("/likes/:id", protectRoute, getLikedPosts); // Route to get liked posts by user ID, protected by the protectRoute middleware
router.get("/user/:username", protectRoute, getUserPosts); // Route to get all posts by a specific user, protected by the protectRoute middleware
router.post("/create", protectRoute, createPost); // Route to create a new post, protected by the protectRoute middleware
router.post("/like/:id", protectRoute, likeUnlikePost); // Route to like or unlike a post by ID, protected by the protectRoute middleware
router.post("/comment/:id", protectRoute, commentOnPost); // Route to comment on a post by ID, protected by the protectRoute middleware
router.delete("/:id", protectRoute, deletePost); // Route to delete a post, protected by the protectRoute middleware 

export default router;