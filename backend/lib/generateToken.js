import jwt from 'jsonwebtoken'; // Import the jsonwebtoken library for token generation so that we can use it to generate a token for the user 
export const generateTokenAndSetCookie = (userID, res) => { // Function to generate a JWT token and set it in a cookie for purposes of authentication or authorization
    const token = jwt.sign({ userID }, process.env.JWT_SECRET, { expiresIn: '15d' }); // Generate a JWT token with the user ID and a secret key, set to expire in 15 days
    res.cookie('jwt', token, { 
        maxAge: 15 * 24 * 60 * 60 * 1000, // Set the cookie to expire in 15 days (15 days * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds)
        httpOnly: true, // Set the cookie to be httpOnly to prevent client-side JavaScript from accessing it (helps mitigate XSS cross-site scripting attacks)
        sameSite: 'Strict', // Set the SameSite attribute to 'Strict' to prevent CSRF cross-site request forgery attacks
        // Set the Secure attribute to false in development to allow cookies over HTTP, true in production for HTTPS
        secure: process.env.NODE_ENV === 'production',
    });
};
