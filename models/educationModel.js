import mongoose from "mongoose";

const educationSchema = new mongoose.Schema({
    school: {
        type: String,
    },
    course: {
        type: String,
    },
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
    }
});

const Education = mongoose.model('Education', educationSchema);

export default Education;
