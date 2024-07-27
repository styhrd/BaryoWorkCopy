import mongoose from "mongoose";

const appliedJobsSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'rejected', 'accepted'],
        default: 'pending'
    },
    appliedAt: {
        type: Date,
        default: Date.now
    }
});

const AppliedJobs = mongoose.model('AppliedJobs', appliedJobsSchema);

export default AppliedJobs;
