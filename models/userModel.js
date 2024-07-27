import mongoose from "mongoose";
import validator from "validator";
import bcrypt from 'bcryptjs'
import JWT from 'jsonwebtoken'

//schema

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: [true, 'Name is Required']
    },
    email: {
        type: String,
        required: [true, 'Email is Required'],
        unique: true,
        validate: validator.isEmail
    },
    password: {
        type: String,
        required: [true, 'Password is Required'],
        minlength: [6, "Password should be greater than 6 characters"],
        select: true,
    },
    profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        default: null,
    },
    appliedjobs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AppliedJobs',
        default: [],
    }]
}, { timestamps: true })

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});


//compare password
userSchema.methods.comparePassword = async function (userPassword) {
    const isMatch = await bcrypt.compare(userPassword, this.password)
    return isMatch;
}

//JSON WEBTOKEN
userSchema.methods.createJWT = function () {
    return JWT.sign({ userId: this._id }, process.env.JWT_SECRET, { expiresIn: '1d' })
}

export default mongoose.model('User', userSchema)