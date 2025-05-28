import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { followUnfollowUser, getSugesstedUsers, getUserProfile, updateUser } from '../controllers/user.controllers.js';

const router = express.Router();

router.get("/profile/:username", protectRoute, getUserProfile);
router.get("/sugessted", protectRoute, getSugesstedUsers);
router.post("/follow/:id", protectRoute, followUnfollowUser);
router.post("/update", protectRoute, updateUser);

export default router;