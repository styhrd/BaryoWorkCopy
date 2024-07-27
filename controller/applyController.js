import mongoose from "mongoose";
import Applicant from "../models/applicants.js";
import AppliedJobs from "../models/appliedJobs.js";
import Job from "../models/jobsModel.js";
import User from "../models/userModel.js";

export const applyJobController = async (req, res, next) => {
    try {
        // Extract data from the request body
        const { jobId } = req.body;

        // Validate required fields
        if (!jobId) {
            return res.status(400).json({ message: "Please provide the job ID" });
        }

        // Find the job by ID
        const job = await Job.findById(jobId);

        // Check if the job exists
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // Fetch the user document
        const user = await User.findById(req.user.userId);

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Get the profileId from the user's profile attribute
        const profileId = user.profile;

        // Create a new applied job document
        const appliedJob = await AppliedJobs.create({
            jobId,
            status: 'pending',
            userId: user._id
        });

        // Create a new applicant document with the retrieved profileId and jobId
        const applicant = await Applicant.create({
            userId: req.user.userId,
            profileId: profileId,
            jobId: jobId
        });

        // Update the user document
        const updatedUser = await User.findOneAndUpdate(
            { _id: req.user.userId },
            { $push: { appliedjobs: appliedJob._id } },
            { new: true } // To return the updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update the job document
        await Job.findOneAndUpdate(
            { _id: jobId },
            { $push: { applications: applicant._id } },
            { new: true } // To return the updated document
        );

        // Send a success response
        res.status(201).json({ appliedJob, applicant });
    } catch (error) {
        // Log the error for troubleshooting
        console.error("Error applying job:", error);
        // Handle errors
        next(error);
    }
};

// Import the Job model

export const acceptApplicantController = async (req, res, next) => {
    try {
        // Extract data from the request body
        const { applicantId } = req.body;

        // Validate required fields
        if (!applicantId) {
            return res.status(400).json({ message: "Please provide the applicant ID" });
        }

        // Find the applicant by ID
        const applicant = await Applicant.findById(applicantId);

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

        // Get the applied jobs of the user
        const appliedJobs = user.appliedjobs;

        // Array to store updated applied jobs
        const updatedAppliedJobs = [];

        // Iterate over each applied job
        for (const appliedJobId of appliedJobs) {
            // Find the applied job by ID
            const appliedJob = await AppliedJobs.findById(appliedJobId);

            // Check if the applied job exists
            if (!appliedJob) {
                // Log the error and continue with the next applied job
                console.error(`Applied job with ID ${appliedJobId} not found`);
                continue;
            }

            // Compare the job ID of the applied job with the job ID of the applicant
            if (appliedJob.jobId.toString() === applicant.jobId.toString()) {
                // Update the status of the matched applied job to 'accepted'
                const updatedAppliedJob = await AppliedJobs.findByIdAndUpdate(
                    appliedJob._id,
                    { status: 'accepted' },
                    { new: true }
                );

                // Push the updated applied job to the array
                updatedAppliedJobs.push(updatedAppliedJob);

                // Update the job document
                const job = await Job.findOneAndUpdate(
                    { _id: appliedJob.jobId },
                    {
                        $pull: { applications: applicantId }, // Remove applicantId from applications array
                        $addToSet: { acceptedapplicants: applicantId } // Add applicantId to acceptedapplicants array
                    },
                    { new: true }
                );
            }
        }

        // Send a success response
        res.status(200).json({ message: "Applicants accepted successfully", updatedAppliedJobs });
    } catch (error) {
        // Log the error for troubleshooting
        console.error("Error accepting applicants:", error);
        // Handle errors
        next(error);
    }
};

export const rejectApplicantController = async (req, res, next) => {
    try {
        // Extract data from the request body
        const { applicantId } = req.body;

        // Validate required fields
        if (!applicantId) {
            return res.status(400).json({ message: "Please provide the applicant ID" });
        }

        // Find the applicant by ID
        const applicant = await Applicant.findById(applicantId);

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

        // Get the applied jobs of the user
        const appliedJobs = user.appliedjobs;

        // Array to store updated applied jobs
        const updatedAppliedJobs = [];

        // Iterate over each applied job
        for (const appliedJobId of appliedJobs) {
            // Find the applied job by ID
            const appliedJob = await AppliedJobs.findById(appliedJobId);

            // Check if the applied job exists
            if (!appliedJob) {
                // Log the error and continue with the next applied job
                console.error(`Applied job with ID ${appliedJobId} not found`);
                continue;
            }

            // Compare the job ID of the applied job with the job ID of the applicant
            if (appliedJob.jobId.toString() === applicant.jobId.toString()) {
                // Update the status of the matched applied job to 'rejected'
                const updatedAppliedJob = await AppliedJobs.findByIdAndUpdate(
                    appliedJob._id,
                    { status: 'rejected' },
                    { new: true }
                );

                // Push the updated applied job to the array
                updatedAppliedJobs.push(updatedAppliedJob);

                // Remove the applicant from the applications array of the job schema
                await Job.findByIdAndUpdate(
                    applicant.jobId,
                    { $pull: { applications: applicantId } }
                );
                await Applicant.findByIdAndDelete(applicantId);
            }
        }

        // Send a success response
        res.status(200).json({ message: "Applicants rejected successfully", updatedAppliedJobs });
    } catch (error) {
        // Log the error for troubleshooting
        console.error("Error rejecting applicants:", error);
        // Handle errors
        next(error);
    }
};








