import mongoose from "mongoose";

const applicantSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    profileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Applicant = mongoose.model('Applicant', applicantSchema);

export default Applicant;
