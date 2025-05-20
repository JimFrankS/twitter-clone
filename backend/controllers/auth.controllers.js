import { generateTokenAndSetCookie } from "../lib/generateToken.js";
import User from "../models/user.model.js"; // Import the User model to interact with the database
import bcrypt from "bcryptjs"; // Import bcryptjs for password hashing

export const signup = async (req, res) => {
    try {
        const { fullName, username, email, password } = req.body; // Destructure the request body to get username, email, and password // Perform validation on the input data
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regular expression to validate email format
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" }); // Return a 400 error if the email format is invalid
        }

        const existingUser = await User.findOne({ username }); // Check if a user with the same username already exists in the database
        if (existingUser) {
            return res.status(400).json({ message: "Username is already taken" }); // Return a 400 error if the username already exists
        }

        const existingEmail = await User.findOne({ email }); // Check if a user with the same email already exists in the database
        if (existingEmail) {
            return res.status(400).json({ message: "Email is already taken" }); // Return a 400 error if the email already exists
        }

        const salt = await bcrypt.genSalt(10); // Generate a salt for hashing the password
        const hashedPassword = await bcrypt.hash(password, salt); // Hash the password using the generated salt

        if (!fullName || !username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }; // Check if all required fields are provided

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" }); // Return a 400 error if the password is too short
        };

        const newUser = new User({ // Create a new user object with the provided data
            fullName,
            username,
            email,
            password: hashedPassword, // Store the hashed password in the database
        });

        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res); // Generate a JWT token and set it in a cookie for the new user
            await newUser.save(); // Save the new user to the    database

            return res.status(201).json({ 
                _id: newUser._id, 
                fullName: newUser.fullName,
                username: newUser.username,
                email: newUser.email,
                following: newUser.following,
                followers: newUser.followers,
                profilePicture: newUser.profilePicture,
                coverImage: newUser.coverImage,
            }); // Return a 201 status code if the user is created successfully
            
        } else {
            res.status(400).json({ message: "Invalid user data" }); // Return a 400 error if the user data is invalid
        }
       
    } catch (error) {
        console.error("Error during signup:", error); // Log the error to the console
       
        res.status(500).json({ error: " Internal Server Error" }); // Return a 500 error if there is a server error
    }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body; // Destructure the request body to get username and password
    const user = await User.findOne({ username }); // Find the user in the database by username
    const isPasswordCorrect = await bcrypt.compare(password, user?.password || ''); // Compare the provided password with the hashed password in the database and handle the case where user is not found. If user is not found, return a 401 error, rather than comparing undefined with the password, making sure it doesn't crash the server.

    if (!user || !isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid username or password" }); // Return a 401 error if the username or password is incorrect
    };

    generateTokenAndSetCookie(user._id, res); // Generate a JWT token and set it in a cookie for the user
    return res.status(200).json({ // Return a 200 status code if the login is successful
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      following: user.following,
      followers: user.followers,
      profilePicture: user.profilePicture,
      coverImage: user.coverImage,
    });

    
  } catch (error) {
    console.error("Error in login controller:", error); // Log the error to the console
        res.status(500).json({ error: " Internal Server Error" }); // Return a 500 error if there is a server error
  }
};

export const logout = async (req, res) => {
    try {
        res.cookie("jwt", "",{maxAge: 0}); // Clear the JWT cookie by setting its max age to 0
        return res.status(200).json({ message: "Logged out successfully" }); // Return a 200 status code if the logout is successful
        
    } catch (error) {
        console.error("Error in logout controller:", error); // Log the error to the console
        res.status(500).json({ error: " Internal Server Error" }); // Return a 500 error if there is a server error
        
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password"); // Find the user in the database by ID, excluding the password field from the result
        if (!user) {
            return res.status(404).json({ message: "User not found" }); // Return a 404 error if the user is not found
        }
        else{
            return res.status(200).json(user); // Return a 200 status code with the user data if the user is found
        }
    } catch (error) {
        console.error("Error in getMe controller:", error); // Log the error to the console
        res.status(500).json({ error: " Internal Server Error" }); // Return a 500 error if there is a server error
    }
}
