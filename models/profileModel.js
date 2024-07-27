import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
    image: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Image' // Reference to the Image model
    },
    description: {
        type: String
    },
    location: {
        type: String
    },
    experience: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Experience'
    }],
    skills: {
        type: [String]
    },
    education: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Education'
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

const Profile = mongoose.model('Profile', profileSchema);

export default Profile;
