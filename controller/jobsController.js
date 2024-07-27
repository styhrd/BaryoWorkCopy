import jobsModel from "../models/jobsModel.js"
import User from '../models/userModel.js'

export const createJobController = async (req, res, next) => {
    const { company, jobtitle, skillsreq, location, cnum, cper, details } = req.body;

    if (!company || !jobtitle || !skillsreq || !location || !cnum || !cper || !details) {
        return res.status(400).json({ message: "Please provide all required fields" });
    }

    try {
        req.body.createdBy = req.user.userId;
        const job = await jobsModel.create(req.body);

        // Add createdBy field to the job object before sending the response
        job.createdBy = req.user.userId;

        return res.status(201).json(job);
    } catch (error) {
        next(error);
    }
};


//get jobs
export const getAllJobsController = async (req, res, next) => {
    try {
        // Pagination parameters
        const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
        const limit = parseInt(req.query.limit) || 10; // Default to limit 10 if not provided

        // Calculate skip value
        const skip = (page - 1) * limit;

        // Fetch the user's applied jobs
        const user = await User.findById(req.user.userId).populate('appliedjobs');
        const userAppliedJobIds = user.appliedjobs.map(appliedJob => appliedJob.jobId.toString());

        // Fetch jobs from the database excluding those created by the current user and already applied by the user
        const jobs = await jobsModel
            .find({
                $and: [
                    { createdBy: { $ne: req.user.userId } }, // Exclude jobs created by the current user
                    { _id: { $nin: userAppliedJobIds } } // Exclude jobs already applied by the user
                ]
            })
            .skip(skip)
            .limit(limit);

        // Count total number of jobs
        const totalCount = await jobsModel.countDocuments({
            $and: [
                { createdBy: { $ne: req.user.userId } },
                { _id: { $nin: userAppliedJobIds } }
            ]
        });

        // Calculate total number of pages
        const totalPages = Math.ceil(totalCount / limit);

        // Check if there are any jobs
        if (!jobs || jobs.length === 0) {
            // If no jobs found, return a 404 Not Found status
            return res.status(404).json({ message: 'No jobs found' });
        }

        // If jobs found, return them along with pagination metadata in the response
        res.status(200).json({ jobs, totalPages });
    } catch (error) {
        // If an error occurs, pass it to the error handling middleware
        next(error);
    }
};

export const jobSkillsController = async (req, res, next) => {
    try {
        const profile = await Profile.findOne({ createdBy: req.user.userId });

        if (!profile || !profile.skills || profile.skills.length === 0) {
            return res.status(404).json({ message: "User profile not found or does not have skills" });
        }

        let skillsArray;
        if (Array.isArray(profile.skills)) {
            skillsArray = profile.skills.join(',').split(',').map(skill => skill.trim());
        } else {
            skillsArray = profile.skills.split(',').map(skill => skill.trim());
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const user = await User.findById(req.user.userId).populate('appliedjobs');
        const userAppliedJobIds = user.appliedjobs.map(appliedJob => appliedJob.jobId);

        const jobs = await jobsModel.find({
            $and: [
                { skillsreq: { $in: skillsArray } },
                { createdBy: { $ne: req.user.userId } },
                { _id: { $nin: userAppliedJobIds } }
            ]
        }).skip(skip).limit(limit);

        const totalCount = await jobsModel.countDocuments({
            $and: [
                { skillsreq: { $in: skillsArray } },
                { createdBy: { $ne: req.user.userId } },
                { _id: { $nin: userAppliedJobIds } }
            ]
        });

        const totalPages = Math.ceil(totalCount / limit);

        res.status(200).json({ jobs, totalPages });
    } catch (error) {
        next(error);
    }
};


export const jobLocationController = async (req, res, next) => {
    try {
        const { page = 1, limit = 5 } = req.query; // Default page is 1, default limit is 5

        // Retrieve the user's profile based on the user ID
        const profile = await Profile.findOne({ createdBy: req.user.userId });

        // Check if the profile exists and has a location
        if (!profile || !profile.location) {
            return res.status(404).json({ message: "User profile not found or does not have a location" });
        }

        // Extract the location from the profile and normalize it
        const location = profile.location.toLowerCase();

        // Calculate skip value based on pagination parameters
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Retrieve user's applied job IDs
        const user = await User.findById(req.user.userId).populate('appliedjobs');
        const userAppliedJobIds = user.appliedjobs.map(appliedJob => appliedJob.jobId);

        // Find jobs based on normalized location with pagination
        const jobs = await jobsModel.find({
            $and: [
                {
                    location: { $regex: new RegExp(location, 'i') } // Find jobs with matching location
                },
                { createdBy: { $ne: req.user.userId } }, // Exclude jobs created by the same user
                { _id: { $nin: userAppliedJobIds } } // Exclude jobs the user has already applied for
            ]
        }).skip(skip).limit(parseInt(limit));

        // Count total documents to calculate total pages
        const totalCount = await jobsModel.countDocuments({
            $and: [
                {
                    location: { $regex: new RegExp(location, 'i') } // Find jobs with matching location
                },
                { createdBy: { $ne: req.user.userId } }, // Exclude jobs created by the same user
                { _id: { $nin: userAppliedJobIds } } // Exclude jobs the user has already applied for
            ]
        });

        // Calculate total pages based on total count and limit
        const totalPages = Math.ceil(totalCount / parseInt(limit));

        res.status(200).json({ jobs, totalPages });
    } catch (error) {
        next(error);
    }
};




//update jobs
export const updateJobController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { company, jobtitle, skillsreq, location, cnum, cper, details, applications } = req.body;

        // Validation: Check if all required fields are provided
        if (!company || !jobtitle || !skillsreq || !location || !cnum || !cper || !details || !applications) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        // Find the job listing by ID
        const job = await jobsModel.findById(id);

        // Check if the job exists
        if (!job) {
            return res.status(404).json({ message: "No job found with this ID" });
        }

        // Authorization: Check if the authenticated user is authorized to update the job
        if (!(req.user.userId === job.createdBy.toString())) {
            next("Not Authorized");
            return;
        }

        // Update the job listing
        const updateJob = await jobsModel.findByIdAndUpdate(id, req.body, {
            new: true, // Return the updated document
            runValidators: true // Run validators on update
        });

        // Respond with the updated job listing
        res.status(200).json({ updateJob });
    } catch (error) {
        // Handle database or server errors
        next(error);
    }
};

import AppliedJobs from "../models/appliedJobs.js";

export const deleteJobController = async (req, res, next) => {
    const { id } = req.params;

    try {
        const job = await jobsModel.findOne({ _id: id });

        // Validate if job exists
        if (!job) {
            return res.status(404).json({ message: "No Job Found With this ID" });
        }

        // Check if the user is authorized to delete the job
        if (!(req.user.userId === job.createdBy.toString())) {
            return res.status(403).json({ message: "Not Authorized" });
        }

        // Delete applied jobs associated with the deleted job
        await AppliedJobs.deleteMany({ jobId: job._id });

        // Delete the job
        await job.deleteOne();

        return res.status(200).json({ message: "Success, Deleted" });
    } catch (error) {
        next(error);
    }
};


//GET JOBS

import Profile from "../models/profileModel.js";





export const getJobByIdController = async (req, res, next) => {
    try {
        // Extract the job ID from the request parameters
        const { id } = req.params;

        // Find the job by ID
        const job = await jobsModel.findById(id);

        // Check if the job exists
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // If job found, return it in the response
        res.status(200).json({ job });
    } catch (error) {
        // If an error occurs, pass it to the error handling middleware
        next(error);
    }
};

export const createdJobController = async (req, res, next) => {
    try {
        // Pagination parameters
        const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
        const limit = parseInt(req.query.limit) || 10; // Default to limit 10 if not provided

        // Calculate skip value
        const skip = (page - 1) * limit;

        // Fetch jobs created by the current user with pagination
        const jobs = await jobsModel
            .find({ createdBy: req.user.userId })
            .skip(skip)
            .limit(limit);

        // Count total number of jobs created by the user
        const totalCount = await jobsModel.countDocuments({ createdBy: req.user.userId });

        // Calculate total number of pages
        const totalPages = Math.ceil(totalCount / limit);

        // Check if there are any jobs
        if (!jobs || jobs.length === 0) {
            // If no jobs found, return a 404 Not Found status
            return res.status(404).json({ message: 'No jobs found' });
        }

        // If jobs found, return them along with pagination metadata in the response
        res.status(200).json({ jobs, totalPages });
    } catch (error) {
        // If an error occurs, pass it to the error handling middleware
        next(error);
    }
};
