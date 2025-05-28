import Post from "../models/post.model.js"; // Import the Post model
import User from "../models/user.model.js"; // Import the User model
import {v2 as cloudinary} from "cloudinary"; // Import the Cloudinary library for image upload
import Notification from "../models/notification.model.js"; // Import the Notification model

export const createPost = async (req, res) => {
    try {
        const {text} = req.body; // Destructure the text from the request body
        let { img } = req.body; // Destructure the img from the request body
        const userId = req.user._id.toString(); // Get the user ID from the request object. This is the user who is creating the post.
        
        const user = await User.findById(userId); // Find the user in the database using the user ID
        if (!user) {
            return res.status(404).json({ message: "User not found" }); // If the user is not found, return a 404 error
        }
        if (!text && !img) {
            return res.status(400).json({ message: "Text or image is required" }); // If neither text nor image is provided, return a 400 error
        }

        if (img) {
            const uploadResponse = await cloudinary.uploader.upload(img) // Upload the image to Cloudinary
            img = uploadResponse.secure_url; // Upload the image to Cloudinary and get the secure URL
        }
        
        const newPost = new Post ({
            user: userId, // Set the user ID for the new post
            text: text || "", // Set the text for the new post, defaulting to an empty string if not provided
            img: img || "", // Set the image for the new post, defaulting to an empty string if not provided
        })

        await newPost.save(); // Save the new post to the database
        res.status(201).json(newPost); // Return the new post with a 201 status code
    } catch (error) {
        console.error("Error in Createpost controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const deletePost =  async (req, res) => {
    try {
        const post = await Post.findById(req.params.id); // Find the post to be deleted by its ID from the request parameters
        if (!post) {
            return res.status(404).json({ error: "Post not found" }); // If the post is not found, return a 404 error
        }
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "You are not authorized to delete this post" }); // If the user is not authorized to delete the post, return a 403 error
        }

        if (post.img){
            const imgId = post.img.split("/").pop().split(".")[0]; // Extract the public ID of the image from the URL
            await cloudinary.uploader.destroy(imgId); // Delete the image from Cloudinary using its public ID
        }
        await Post.findByIdAndDelete(req.params.id); // Delete the post from the database by its ID
        res.status(200).json({ message: "Post deleted successfully" }); // Return a success message with a 200 status code

    } catch (error) {
        console.error("Error in deletePost controller:", error);
        res.status(500).json({ message: "Internal server error" });
        
    }
}

export const commentOnPost = async (req, res) => {
    try {
        const { text } = req.body; // Destructure the text from the request body
        const postId = req.params.id; // Get the post ID from the request parameters
        const userId = req.user._id.toString(); // Get the user ID from the request object

        if (!text) {
            return res.status(400).json({ message: "Comment text is required" }); // If no comment text is provided, return a 400 error
        }

        const post = await Post.findById(postId); // Find the post by its ID
        if (!post) {
            return res.status(404).json({ message: "Post not found" });} // If the post is not found, return a 404 error
        else {
            const comment = {user: userId, text}; // Create a new comment object with the user ID and text
        post.comments.push(comment); // Add the comment to the post's comments array
        await post.save(); // Save the updated post to the database
        const notification = new Notification({
            from: userId, // Set the user ID of the user who commented
            to: post.user.toString(), // Set the user ID of the post owner
            type: "comment", // Set the type of notification to "comment"
        })
        await notification.save(); // Save the notification to the database
        res.status(200).json(comment); // Return the new comment with a 200 status code 
        }

    } catch (error) {
        console.error("Error in commentOnPost controller:", error);
        res.status(500).json({ message: "Internal server error" });
        
    }
}

export const likeUnlikePost = async (req, res) => {
    try {
        const userId = req.user._id.toString(); // Get the user ID from the request object
    const {id: postId} = req.params; // Get the post ID from the request parameters

    const post = await Post.findById (postId); // Find the post by its ID
    if (!post) {
        return res.status(404).json({ message: "Post not found" });} // If the post is not found, return a 404 error
    
    const userLikedPost = post.likes.includes(userId); // Check if the user has already liked the post

    if (userLikedPost) {
        await Post.updateOne({ _id: postId }, { $pull: { likes: userId }}); // If the user has already liked the post, remove their ID from the likes array, thus unliking the post.
        await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId }}); // Also remove the post ID from the user's likedPosts array
        res.status(200).json({ message: "Post unliked successfully" }); // Return a success message with a 200 status code
    } else {
       post.likes.push(userId); // If the user has not liked the post, add their ID to the likes array
        await User.updateOne({ _id: userId }, { $push: { likedPosts: postId }}); // Add the post ID to the user's likedPosts array
        await post.save(); // Save the updated post to the database

        const notification = new Notification({
            from: userId, // Set the user ID of the user who liked the post
            to: post.user.toString(), // Set the user ID of the post owner
            type: "like", // Set the type of notification to "like"
        })
        await notification.save(); // Save the notification to the database
        res.status(200).json({ message: "Post liked successfully" }); // Return a success message with a 200 status code
    }
        
    } catch (error) {
         console.error("Error in likeUnlikePost controller:", error);
          res.status(500).json({ message: "Internal server error" });    
    }
}

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }).populate({
            path: "user",
            select: "-password",
        })
        .populate({
            path: "comments.user",
            select: "-password",
        }) // Populate the user field in the post document with the user's details, excluding their password

        if (!posts || posts.length === 0) {
            return res.status(200).json([]); // If no posts are found, return an empty array with a 200 status code
        }
        res.status(200).json(posts); // Return the posts with a 200 status code
    } catch (error) {
        console.error("Error in getAllPosts controller:", error);
        res.status(500).json({ message: "Internal server error" });
        
    }
}

export const getLikedPosts = async (req, res) => {
    const userId = req.user._id.toString(); // Get the user ID from the request object
    try {
        const user = await User.findById(userId);
        if (!user) {return res.status(404).json({ message: "User not found" });} // If the user is not found, return a 404 error
        const likedPosts = await Post.find({ _id: { $in: user.likedPosts }})
        .populate({ // Populate the user field in the post document with the user's details, excluding their password
            path: "user",
            select: "-password",
        }).populate({ // Populate the comments field in the post document with the user's details, excluding their password
            path: "comments.user",
            select: "-password",
        });

         if (! likedPosts || likedPosts.length === 0) {
            return res.status(200).json([]); // If no liked posts are found, return an empty array with a 200 status code
        }

        res.status(200).json(likedPosts); // Return the liked posts with a 200 status code

    } catch (error) {
        console.error("Error in getLikedPosts controller:", error);
        res.status(500).json({ message: "Internal server error" });
        
    }
}     

export const getFollowingPosts = async (req, res) => {
    try { 
        const userId = req.user._id.toString(); // Get the user ID from the request object
        const  user = await User.findById(userId); // Find the user in the database using the user ID
        if (!user) {return res.status(404).json({ message: "User not found" });} // If the user is not found, return a 404 error

        const following = user.following; // Get the list of users that the current user is following
        const feedPosts = await Post.find({ user: { $in: following }}) // Find posts from users that the current user is following
        .sort({ createdAt: -1 }) // Sort the posts by creation date in descending order
        .populate({
            path: "user",
            select: "-password", // Populate the user field in the post document with the user's details, excluding their password
        })
        .populate({
            path: "comments.user",
            select: "-password", // Populate the comments field in the post document with the user's details, excluding their password
        });

        if (!feedPosts || feedPosts.length === 0) {
            return res.status(200).json([]); // If no posts are found, return an empty array with a 200 status code
        }

        res.status(200).json(feedPosts); // Return the feed posts with a 200 status code

    } catch (error) {
        console.error("Error in getFollowingPosts controller:", error);
        res.status(500).json({ message: "Internal server error" });
        
    }
}

export const getUserPosts =  async (req, res) => {
    try {
    const {username} = req.params; // Get the username from the request parameters
       
        const user = await User.findOne({ username }); 
        if (!user) {
            return res.status(404).json({ message: "User not found" })}; // If the user is not found, return a 404 error
        const posts = await Post.find({ user: user._id }) // Find posts by the user's ID
        .sort({ createdAt: -1 }) // Sort the posts by creation date in descending order
        .populate({
            path: "user",
            select: "-password", // Populate the user field in the post document with the user's details, excluding their password
        })
        .populate({
            path: "comments.user",
            select: "-password", // Populate the comments field in the post document with the user's details, excluding their password
        });
        if (!posts || posts.length === 0) {
            return res.status(200).json([]); // If no posts are found, return an empty array with a 200 status code
        }
        res.status(200).json(posts); // Return the user's posts with a 200 status code
    } catch (error) {
    console.error("Error in getUserPosts controller:", error);
        
    }
}