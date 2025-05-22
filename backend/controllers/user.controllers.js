import Notification from "../models/notification.model.js";
import User from "../models/user.model.js"; // Import the User model to interact with the database.
import bcrypt from "bcryptjs"; // Import bcrypt for password hashing and comparison.
import cloudinary from "cloudinary"; // Import cloudinary for image uploading.

export const getUserProfile = async (req, res) => {
    const { username } = req.params; // Get the username from the request parameters. We usse req.params because we are using a dynamic route in the route file.

    try {
        const user = await User.findOne({username}).select("-password"); // Find the user by username and exclude the password.
        if (!user) {
            return res.status(404).json({ message: "User not found" }); // If the user is not found, return a 404 error.
        }
        return res.status(200).json(user); // If the user is found, return the user data with a 200 status code.
    } catch (error) {
        console.log("Error in getUserProfile:", error.message); // Log any errors that occur during the process.
        return res.status(500).json({error: error.message}); // Return a 500 error with the error message.
    }
}

export const followUnfollowUser = async (req, res) => {
    try {
        const { id } = req.params; // Get the user ID from the request parameters. 
        const userToModify = await User.findById(id); // Find the profile of user we want to follow or unfollow by ID. 
        const currentUser = await User.findById(req.user._id); // Find the current user by their ID, which is stored in req.user._id, as this is set in the protectRoute middleware.

        if (id === req.user._id.toString()) {
            return res.status(400).json({ error: "You cannot follow/unfollow yourself" }); // If the user tries to follow/unfollow themselves, return a 400 error.
        }

        if (!userToModify || !currentUser) {
            return res.status(404).json({ error: "User not found" }); // If either the user to modify or the current user is not found, return a 404 error.
        }

        const isFollowing = currentUser.following.includes(id); // Check if the current user is already following the user to modify.

        if (isFollowing) {
            // If the current user is already following, unfollow the user.
            await User.findByIdAndUpdate(id, {$pull: { followers: req.user._id }}); // Remove the current user's ID from the followers array of the user to modify.
            await User.findByIdAndUpdate(req.user._id, {$pull: { following: id }}); // Remove the user to modify's ID from the following array of the current user.
            res.status(200).json({ message: "Unfollowed successfully" }); // Return a success message.
        } else {
            // follow user
            await User.findByIdAndUpdate(id, {$push: { followers: req.user._id }}); // Add the current user's ID to the followers array of the user to modify.
            await User.findByIdAndUpdate(req.user._id, {$push: { following: id }}); // Add the user to modify's ID to the following array of the current user.

            const newNotification = new Notification ({
                type: "follow", // Set the type of notification to "follow".
                from: req.user._id, // The user who triggered the notification (the current user).
                to: userToModify._id, // The user who will receive the notification (the user to modify).
            });

            await newNotification.save(); // Save the notification to the database.

            // Todo: return the id of the user who followed the user to modify as a response.

            res.status(200).json({ message: "Followed successfully" }); // Return a success message.
        }
        
    } catch (error) {
        console.log("Error in followUnfollowUser:", error.message); // Log any errors that occur during the process.
        return res.status(500).json({error: error.message}); // Return a 500 error with the error message.
        
    }
}

export const getSugesstedUsers = async (req, res) => {
    try {
        const userID = req.user._id; // Get the current user's ID from the request object.

        const usersFollowedByMe = await User.findById(userID).select("following"); // Find the current user and get the list of users they are following.

        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: userID }, // Exclude the current user from the results.
                }
            },
             {$sample: { size: 10 }}, // Randomly select 10 users from the database.
        ])

        const filteredUsers = users.filter(user => !usersFollowedByMe.following.includes(user._id.toString())); // Filter out users that the current user is already following.
        const suggestedUsers = filteredUsers.slice(0,4); // Limit the suggested users to 4.

        suggestedUsers.forEach(user => user.password = null); // Set the password of each suggested user to null to avoid exposing sensitive information.

        return res.status(200).json(suggestedUsers); // Return the suggested users with a 200 status code.
        
    } catch (error) {
        console.log("Error in getSugesstedUsers:", error.message); // Log any errors that occur during the process.
        return res.status(500).json({error: error.message}); // Return a 500 error with the error message.
    }
}

export const updateUser = async (req, res) => {
    // Destructure the request body to get the user data
    let { fullName, email, username, currentPassword, newPassword, bio, link } = req.body || {};
    // Destructure the request body to get the profile and cover pictures
    let { profileImg, coverImg } = req.body || {};

    const userID = req.user._id; // Get the current user's ID from the request object

    try {
        const user = await User.findById(userID); // Find the current user by their ID
        if (!user) {
            return res.status(404).json({ message: "User not found" }); // If the user is not found, return a 404 error
        }

        // Validate password change inputs
        if ((!newPassword && currentPassword) || (newPassword && !currentPassword)) {
            return res.status(400).json({ message: "Please provide both current and new password" }); // If only one password field is provided, return a 400 error
        }

        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password); // Compare the provided current password with the stored password
            if (!isMatch) {
                return res.status(400).json({ message: "Current password is incorrect" }); // If the passwords do not match, return a 400 error
            }
            if (newPassword.length < 6) {
                return res.status(400).json({ message: "New password must be at least 6 characters long" }); // If the new password is too short, return a 400 error
            }
            const salt = await bcrypt.genSalt(10); // Generate a salt for hashing the new password
            user.password = await bcrypt.hash(newPassword, salt); // Hash the new password and update the user's password
        }

        // The following image update logic is excluded from testing as per user request
        if (profileImg) {
            if (user.profileImg) {
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]); // Delete the old profile image from Cloudinary
                // The split and pop methods are used to extract the public ID of the image from the URL
            }
            const uploadedResponse = await cloudinary.uploader.upload(profileImg);
            profileImg = uploadedResponse.secure_url; // Upload the new profile image to Cloudinary and get the secure URL
        }

        if (coverImg) {
            if (user.coverImg) {
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]); // Delete the old cover image from Cloudinary
                // The split and pop methods are used to extract the public ID of the image from the URL
            }
            const uploadedResponse = await cloudinary.uploader.upload(coverImg);
            coverImg = uploadedResponse.secure_url; // Upload the new profile image to Cloudinary and get the secure URL
        }

        // Update user fields if provided, otherwise keep existing values
        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;

        await user.save(); // Save the updated user data to the database

        user.password = null; // Set the password to null to avoid exposing sensitive information

        return res.status(200).json(user); // Return the updated user data with a 200 status code
    } catch (error) {
        console.log("Error in updateUserProfile:", error.message); // Log any errors that occur during the process
        return res.status(500).json({ error: error.message }); // Return a 500 error with the error message
    }
}
