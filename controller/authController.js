import userModel from "../models/userModel.js"

export const registerController = async (req, res, next) => {
    const { fullname, email, password } = req.body;

    // Validate input fields
    if (!fullname || !email || !password || password.length < 6) {
        return res.status(400).json({ success: false, message: "Please provide a valid fullname, email, and password (at least 6 characters)." });
    }

    try {
        // Check if the email is already registered
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email is already registered." });
        }

        // Create a new user
        const user = await userModel.create({ fullname, email, password });

        // Generate JWT token
        const token = user.createJWT();

        // Send success response
        res.status(201).json({
            success: true,
            message: "User created successfully.",
            user: {
                fullname: user.fullname,
                email: user.email
            },
            token
        });
    } catch (error) {
        // Handle any errors
        next(error);
    }
};



export const loginController = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        // Validation
        if (!email || !password) {
            return next('Please Provide All Fields');
        }

        // Find user by email
        const user = await userModel.findOne({ email }).select("+password");

        // Check if user exists
        if (!user) {
            return next('Invalid Username or Password');
        }

        // Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return next('Invalid Username or Password');
        }

        // Remove password from user object
        user.password = undefined;

        // Generate JWT token
        const token = user.createJWT();

        // Send success response
        res.status(200).json({
            success: true,
            message: "Login Success",
            user,
            token
        });
    } catch (error) {
        // Handle errors
        console.error("Login error:", error);
        next(error); // Pass error to error handling middleware
    }
};