import Experience from "../models/expModel.js";
import Profile from "../models/profileModel.js";
import User from '../models/userModel.js'

export const createExpController = async (req, res, next) => {
    try {
        // Extract data from the request body
        const { company, startDate, endDate, details } = req.body;

        // Validate required fields
        if (!company || !startDate || !endDate || !details) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        // Create a new experience document
        const experience = await Experience.create({
            company,
            startDate,
            endDate,
            details,
            createdBy: req.user.userId // Set createdBy field to the authenticated user's ID
        });

        // Retrieve the profile document by user ID
        let profile = await Profile.findOne({ createdBy: req.user.userId });

        // If profile not found, return an error
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        // Add the newly created experience to the profile
        profile.experience.push(experience);

        // Save the updated profile
        profile = await profile.save();

        // Send a success response
        res.status(201).json({ experience });
    } catch (error) {
        // Handle errors
        next(error);
    }
};


export const deleteExpController = async (req, res, next) => {
    try {
        // Extract experience ID from the request parameters
        const { id } = req.params;

        // Find the experience document by ID
        const exp = await Experience.findById(id);

        // Check if the experience document exists
        if (!exp) {
            return res.status(404).json({ message: "Experience not found" });
        }

        // Get the createdBy field from the experience document
        const createdByUserId = exp.createdBy.toString();

        // Get the user ID from the login token
        const userIdFromToken = req.user.userId;

        // Check if the user ID from the token matches the createdBy user ID
        if (createdByUserId !== userIdFromToken) {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        // If the user is authorized, proceed with deleting the experience document
        await Experience.findByIdAndDelete(id);

        // Remove the experience ID from the experience array of the profile
        await Profile.updateOne(
            { createdBy: userIdFromToken },
            { $pull: { experience: id } }
        );

        // Send a success response
        res.status(200).json({ message: "Experience deleted successfully" });
    } catch (error) {
        // Handle errors
        next(error);
    }
};

export const UpdateExperienceController = async (req, res) => {
    const { id } = req.params; // Get the experience ID from the request parameters
    const { company, startDate, endDate, details } = req.body; // Get updated experience details from request body

    try {
        // Find the experience by ID
        const experience = await Experience.findById(id);

        // Check if experience exists
        if (!experience) {
            return res.status(404).json({ error: 'Experience not found' });
        }

        // Update experience details
        if (company) experience.company = company;
        if (startDate) experience.startDate = startDate;
        if (endDate) experience.endDate = endDate;
        if (details) experience.details = details;

        // Save the updated experience
        await experience.save();

        // Send success response
        return res.status(200).json({ message: 'Experience updated successfully', experience });
    } catch (error) {
        // Handle errors
        console.error('Error updating Experience:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


export const getExpByIdController = async (req, res, next) => {
    try {
        // Retrieve the user ID from the request parameters
        const { id } = req.params;

        // Retrieve the experience data from your database based on the user ID
        const experienceData = await Experience.findById(id);

        // Check if an experience is found for the user
        if (!experienceData) {
            return res.status(404).json({ message: "No experience found for the user" });
        }

        // Return the experience data
        res.status(200).json({ experience: experienceData });
    } catch (error) {
        // Handle errors
        console.error("Error in getExpController:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};