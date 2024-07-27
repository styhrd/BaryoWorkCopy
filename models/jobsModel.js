import mongoose from "mongoose";
import applicantSchema from "./applicants.js";
import User from '../models/userModel.js'

const jobSchema = new mongoose.Schema({

    company: {
        type: String,
        required: [true, 'Company name is required']
    },

    jobtitle: {
        type: String,
        required: [true, 'Job Position is Required']
    },

    location: {
        type: String,
        required: [true, 'Location is Required']
    },

    skillsreq: {
        type: Array,
        required: [true, 'Skills are Required']
    },

    cnum: {
        type: Number,
        required: [true, 'Contact Number is Required']

    },

    cper: {
        type: String,
        required: [true, 'Contact Person is Required']
    },

    details: {
        type: String,
        required: [true, 'Contact Person is Required']
    },

    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },

    applications: [{
        type: mongoose.Types.ObjectId,
        ref: 'Applicant',
        default: []
    }],
    acceptedapplicants: [{
        type: mongoose.Types.ObjectId,
        ref: 'Applicant',
        default: []
    }]


}, { timestamps: true })

export default mongoose.model('Job', jobSchema)