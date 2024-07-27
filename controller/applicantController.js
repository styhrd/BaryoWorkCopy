import Applicant from "../models/applicants.js";

// Controller to get an applicant by ID
export const getApplicantByIdController = async (req, res, next) => {
    try {
        // Extract the applicant ID from the request parameters
        const { id } = req.params;

        // Find the applicant by ID
        const applicant = await Applicant.findById(id);

        // Check if the applicant exists
        if (!applicant) {
            return res.status(404).json({ message: "Applicant not found" });
        }

        // If applicant found, return it in the response
        res.status(200).json({ applicant });
    } catch (error) {
        // If an error occurs, pass it to the error handling middleware
        next(error);
    }
};

// Controller to get all applicants

import Job from "../models/jobsModel.js";

export const deleteApplicantByIdController = async (req, res, next) => {
    try {
        // Extract the applicant ID from the request parameters
        const { id } = req.params;

        // Delete the applicant by ID
        const deletedApplicant = await Applicant.findByIdAndDelete(id);

        // Check if the applicant was found and deleted successfully
        if (!deletedApplicant) {
            return res.status(404).json({ message: "Applicant not found" });
        }

        // Update the applications array in the jobs schema to remove the deleted applicant ID
        await Job.updateMany(
            { applications: id },
            { $pull: { applications: id } }
        );

        // Send a success response
        res.status(200).json({ message: "Applicant deleted successfully" });
    } catch (error) {
        // If an error occurs, pass it to the error handling middleware
        next(error);
    }
};

// Assuming the model for the user's profile


import User from '../models/userModel.js'
import Profile from "../models/profileModel.js";

export const getAllApplicantProfilesController = async (req, res, next) => {
    try {
        // Extract the applicant ID from the request parameters
        const { applicantId } = req.params;

        // Find the applicant by ID
        const applicant = await Applicant.findById(applicantId);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Check if the applicant exists
        if (!applicant) {
            return res.status(404).json({ message: `Applicant with ID ${applicantId} not found` });
        }

        // Get the user by user ID from the applicant
        const user = await User.findById(applicant.userId);

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ message: `User with ID ${applicant.userId} not found` });
        }

        // Get the profile by profile ID from the applicant
        const profile = await Profile.findById(applicant.profileId).select('description location skills');

        const totalProfiles = await Profile.countDocuments({ applicantId: applicant._id });
        //tryh

        // Check if the profile exists
        if (!profile) {
            return res.status(404).json({ message: `Profile with ID ${applicant.profileId} not found` });
        }

        // Extract the user's fullname and email from the user object
        const { fullname, email } = user;
        const { location, description, skills } = profile

        // Return the user's fullname, email, and profile details
        res.status(200).json({
            fullname, email, location, description, skills, applicantId, pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalProfiles / limit),
                totalProfiles
            }
        });
    } catch (error) {
        // If an error occurs, pass it to the error handling middleware
        next(error);
    }
};



