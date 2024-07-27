import Profile from "../models/profileModel.js";
import User from "../models/userModel.js"
import multer from "multer";
import upload from "../middlewares/multerMiddleware.js";

export const createProfileController = async (req, res, next) => {
    try {
        // Extract data from the request body
        const { image, description, location, experience, skills, education } = req.body;

        // Validate required fields
        if (!description || !skills) {
            return res.status(400).json({ message: "Please provide description and skills" });
        }

        // Create a new profile document with createdBy field
        const profile = await Profile.create({
            image,
            description,
            location,
            experience,
            skills,
            education,
            createdBy: req.user.userId // Set createdBy field to the authenticated user's ID
        });

        // Retrieve the user document by ID
        let user = await User.findById(req.user.userId);

        // If user not found, return an error
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update the profile attribute of the user document
        user.profile = profile._id;

        // Save the updated user document
        user = await user.save();

        // Send a success response
        res.status(201).json({ profile });
    } catch (error) {
        // Handle errors
        next(error);
    }
};




export const updateProfileController = async (req, res, next) => {
    try {
        const { description, experience, skills, education, location } = req.body;

        // Check if the request contains any fields to update
        if (!description && !experience && !skills && !education && !location) {
            return res.status(400).json({ message: "No fields provided for update" });
        }

        // Get the profile ID from the request
        const profileId = req.params.profileId;

        // Find the profile by ID
        let profile = await Profile.findById(profileId);

        // If no profile found with the provided ID, return an error
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        // Check if the user updating the profile is the owner of the profile
        if (profile.createdBy.toString() !== req.user.userId) {
            return res.status(403).json({ message: "You are not authorized to update this profile" });
        }

        // Update the profile fields if provided
        if (description) {
            profile.description = description;
        }
        if (experience) {
            profile.experience = experience;
        }
        if (skills) {
            profile.skills = skills;
        }
        if (location) {
            profile.location = location;
        }
        if (education) {
            profile.education = education;
        }

        // Save the updated profile
        profile = await profile.save();

        // Return the updated profile
        res.status(200).json({ profile });
    } catch (error) {
        // Handle errors
        console.error("Error updating profile:", error);
        next(error);
    }
};


export const getProfileController = async (req, res, next) => {
    try {
        // Retrieve the user ID of the currently logged-in user
        const userId = req.user.userId;

        // Find the profile document associated with the user ID
        const profile = await Profile.findOne({ createdBy: userId });

        // If no profile found, return an error
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        // Return the profile document in the response
        res.status(200).json({ profile });
    } catch (error) {
        // Handle errors
        next(error);
    }
};
