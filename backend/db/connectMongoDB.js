import mongoose from "mongoose";

const connectMongoDB = async () => { // Function to connect to MongoDB /**This function uses async/await syntax to handle asynchronous operations
try {
    const conn = await mongoose.connect(process.env.MONGODB_URI)
    console.log(`MongoDB connected: ${conn.connection.host}`); // Log the MongoDB connection host
    
} catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`); // Log the error message
    process.exit(1); // Exit the process with failure
}
};

export default connectMongoDB; 