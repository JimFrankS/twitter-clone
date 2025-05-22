import mongoose from "mongoose"; // Import mongoose to interact with MongoDB.

const notificationSchema = new mongoose.Schema({ // Define the schema for notifications
    from: { // The user who triggered the notification
        type: mongoose.Schema.Types.ObjectId, // Use ObjectId to reference the User model
        ref: "User",
        required: true
    },
    to: { // The user who will receive the notification
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    type: { // The type of notification (follow, like, comment)
        type: String,
        enum: ["follow", "like", "comment"],
        required: true
    },
    read: { // Whether the notification has been read or not
        type: Boolean,
        default: false
    },
}, {timestamps: true});  // Add timestamps to the schema to track when notifications are created and updated.

const Notification = mongoose.model("Notification", notificationSchema); // Create a model for the notification schema.
export default Notification; // Export the Notification model to use it in other parts of the application.