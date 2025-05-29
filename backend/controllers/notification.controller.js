import Notification  from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
    try {

        const userId = req.user._id; // Get the user ID from the request object, assuming the user is authenticated and their ID is stored in req.user._id

        const notifications = await Notification.find({ to: userId }).populate({
            path: 'from',
            select: "username profilePicture" 
        }); // Find all notifications for the user, and populate the 'from' field with the user's details

        if (!notifications || notifications.length === 0) {
            return res.status(404).json({ message: "No notifications found" }); // If no notifications are found, return a 404 status with a message
        }

        await Notification.updateMany ({to: userId }, { read:true}); // Mark all notifications for the user as read

        return res.status(200).json(notifications); // Return the notifications with a 200 status code
        
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return res.status(500).json({ message: "Internal server error" });
        
    }
}

export const deleteNotifications = async (req, res) => {
    try {
        const userId = req.user._id; // Get the user ID from the request object

        await Notification.deleteMany({ to: userId }); // Delete all notifications for the user
        return res.status(200).json({ message: "Notifications deleted successfully" }); // Return a success message with a 200 status code
        
    } catch (error) {
        console.error("Error deleting notifications:", error);
        return res.status(500).json({ message: "Internal server error" });
        
    }
}

