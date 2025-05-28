import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true, 
    }, 
    fullName: { 
        type: String, 
        required: true,
     },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
    }, 
    password: { 
        type: String, 
        required: true, 
        minLength: 6,
    }, 
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId, // Reference to another document in the database
            ref: "User", // Reference to the User model meaning 
            default: [], // Default value is an empty array, meaning no followers initially
        }
    ],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId, // Reference to another document in the database
            ref: "User", // Reference to the User model meaning 
            default: [], // Default value is an empty array, meaning not following anyone initially
        }
    ],
    profileImg: { 
        type: String, 
        default: "", // Default value is an empty string, meaning no profile picture initially
    },
    coverImg: { 
        type: String, 
        default: "", // Default value is an empty string, meaning no cover image initially
    },
    bio: { 
        type: String, 
        default: "", // Default value is an empty string, meaning no bio initially
    },
    link: { 
        type: String, 
        default: "", // Default value is an empty string, meaning no links initially
    },
    likedPosts: [
        {
            type: mongoose.Schema.Types.ObjectId, // Reference to another document in the database
            ref: "Post", // Reference to the Post model meaning 
            default: [], // Default value is an empty array, meaning no liked posts initially
        }
    ],
}, { timestamps: true }); // Define a schema for the User model with timestamps

const User = mongoose.model("User", userSchema); // Create a User model based on the userSchema
export default User; // Export the User model to be used in other parts of the application