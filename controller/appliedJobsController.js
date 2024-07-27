import AppliedJobs from "../models/appliedJobs.js";

// Controller to get all applied jobs
export const getAllAppliedJobsController = async (req, res, next) => {
    try {
        // Extract page and limit parameters from the query string
        const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
        const limit = parseInt(req.query.limit) || 10; // Default to limit of 10 if not provided

        // Calculate the index of the first document to return
        const startIndex = (page - 1) * limit;

        // Fetch all applied jobs from the database with pagination
        const appliedJobs = await AppliedJobs.find()
            .skip(startIndex)
            .limit(limit);

        // Count the total number of documents in the collection
        const totalDocuments = await AppliedJobs.countDocuments();

        // Calculate the total number of pages
        const totalPages = Math.ceil(totalDocuments / limit);

        // Check if there are any applied jobs
        if (!appliedJobs || appliedJobs.length === 0) {
            // If no applied jobs found, return a 404 Not Found status
            return res.status(404).json({ message: 'No applied jobs found' });
        }

        // If applied jobs found, return them along with pagination info in the response
        res.status(200).json({ appliedJobs, totalPages });
    } catch (error) {
        // If an error occurs, pass it to the error handling middleware
        next(error);
    }
};
// Controller to get an applied job by ID
export const getAppliedJobByIdController = async (req, res, next) => {
    try {
        // Extract the applied job ID from the request parameters
        const { id } = req.params;

        // Find the applied job by ID
        const appliedJob = await AppliedJobs.findById(id);

        // Check if the applied job exists
        if (!appliedJob) {
            return res.status(404).json({ message: "Applied job not found" });
        }

        // If applied job found, return it in the response
        res.status(200).json({ appliedJob });
    } catch (error) {
        // If an error occurs, pass it to the error handling middleware
        next(error);
    }
};


import User from "../models/userModel.js";

// Controller to delete an applied job by ID and update the appliedjobs array of the user
export const deleteAppliedJobByIdController = async (req, res, next) => {
    try {
        // Extract the applied job ID from the request parameters
        const { id } = req.params;

        // Delete the applied job by ID
        const deletedAppliedJob = await AppliedJobs.findByIdAndDelete(id);

        // Check if the applied job was found and deleted successfully
        if (!deletedAppliedJob) {
            return res.status(404).json({ message: "Applied job not found" });
        }

        // Update the appliedjobs array of the user
        const updatedUser = await User.findOneAndUpdate(
            { _id: req.user.userId },
            { $pull: { appliedjobs: id } }, // Remove the deleted applied job ID from the appliedjobs array
            { new: true }
        );

        // Send a success response
        res.status(200).json({ message: "Applied job deleted successfully", updatedUser });
    } catch (error) {
        // If an error occurs, pass it to the error handling middleware
        next(error);
    }
};
