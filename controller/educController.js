import Education from "../models/educationModel.js";
import Profile from "../models/profileModel.js";
import User from '../models/userModel.js'

export const createEducationController = async (req, res, next) => {
    try {
        // Extract data from the request body
        const { school, course, startDate, endDate } = req.body;

        // Validate required fields
        if (!school || !course || !startDate || !endDate) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        // Create a new education document
        const education = await Education.create({
            school,
            course,
            startDate,
            endDate,
            createdBy: req.user.userId // Set createdBy field to the authenticated user's ID
        });

        // Retrieve the profile document by user ID
        let profile = await Profile.findOne({ createdBy: req.user.userId });

        // If profile not found, return an error
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        // Push the ID of the newly created education to the profile's education array
        profile.education.push(education._id);

        // Save the updated profile
        profile = await profile.save();

        // Send a success response
        res.status(201).json({ education });
    } catch (error) {
        // Handle errors
        next(error);
    }
};

export const deleteEducationController = async (req, res, next) => {
    try {
        // Extract education ID from the request parameters
        const { userId } = req.params;

        // Find the education document by ID
        const education = await Education.findById(userId);

        // Check if the education document exists
        if (!education) {
            return res.status(404).json({ message: "Education not found" });
        }

        // Get the createdBy field from the education document
        const createdByUserId = education.createdBy.toString();

        // Get the user document from the login token
        const user = await User.findById(req.user.userId);

        // Check if the user document exists
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Extract the user ID from the user document
        const userIdFromToken = user._id.toString();

        // Check if the user ID from the token matches the createdBy user ID
        if (createdByUserId !== userIdFromToken) {
            return res.status(403).json({ message: "Unauthorized access" });
        }
        // If the user is authorized, proceed with deleting the education document
        await Education.findByIdAndDelete(userId);

        // Remove the education ID from the education array of the profile
        await Profile.updateOne(
            { createdBy: userIdFromToken },
            { $pull: { education: userId } }
        );

        // Send a success response
        res.status(200).json({ message: "Education deleted successfully" });
    } catch (error) {
        // Handle errors
        next(error);
    }
};

export const UpdateEducationController = async (req, res) => {


    try {
        const { id } = req.params; // Get the education ID from the request parameters
        const { school, course, startDate, endDate } = req.body; // Get updated education details from request body
        // Find the education by ID
        const education = await Education.findById(id);
        // Check if education exists
        if (!education) {
            return res.status(404).json({ error: 'Education not found' });
        }

        // Update education details
        if (school) education.school = school;
        if (course) education.course = course;
        if (startDate) education.startDate = startDate;
        if (endDate) education.endDate = endDate;

        // Save the updated education
        await education.save();

        // Send success response
        return res.status(200).json({ message: 'Education updated successfully', education });
    } catch (error) {
        // Handle errors
        console.error('Error updating education:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


export const getEducationByIdController = async (req, res, next) => {
    try {
        // Extract the education ID from the request parameters
        const { id } = req.params;

        // Find the education by ID
        const education = await Education.findById(id);

        // Check if the education exists
        if (!education) {
            return res.status(404).json({ message: "Education not found" });
        }

        // If education found, return it in the response
        res.status(200).json({ education });
    } catch (error) {
        // If an error occurs, pass it to the error handling middleware
        next(error);
    }
};

