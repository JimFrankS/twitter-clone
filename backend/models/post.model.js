import mongoose from "mongoose"; // Import mongoose library to interact with MongoDB database. 

const postSchema = new mongoose.Schema({ // Define a new schema for the Post model.
    user: {
        type: mongoose.Schema.Types.ObjectId, // Define the user field as an ObjectId type. This will reference the user document in the users collection. 
        ref: "User", // Reference the User model.
        required: true // Make this field required.
    },
    text:{
        type:String, // Define the text field as a String type.
    },
    image: {
        type: String, // Define the image field as a String type.
    },
    likes: [{ // Define the likes field as an array of ObjectId types. This will store the IDs of the users who liked the post.
        type: mongoose.Schema.Types.ObjectId, // Define the likes field as an array of ObjectId types. 
        ref: "User" // Reference the User model.
    }],
    comments: [ // Define the comments field as an array of objects. Each object will represent a comment on the post. 
        {
            text: { 
                type: String, // Define the text field of comments as a String type.
                required: true // Make this field required.
            },
            user: { // Define the user field of comments as an ObjectId type. This will reference the user document in the users collection. 
                type: mongoose.Schema.Types.ObjectId, // Define the user field of comments as an ObjectId type.
                ref: "User", // Reference the User model.
                required: true // Make this field required.
            },
        },
      ],
    },
    { timestamps: true }
); // Define a schema for the Post model with timestamps for createdAt and updatedAt fields.

const Post = mongoose.model("Post", postSchema); // Create a model named Post using the defined schema.
export default Post; // Export the Post model for use in other parts of the application.