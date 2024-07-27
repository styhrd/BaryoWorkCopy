import userModel from "../models/userModel.js"
import JWT from 'jsonwebtoken';
import User from "../models/userModel.js";
import nodemailer from 'nodemailer'
import bcrypt from 'bcryptjs';

export const updateUserController = async (req, res, next) => {
    const { fullname, email, password } = req.body
    if (!fullname || !email || !password) {
        next('Please Provide All Fields')
    }

    const user = await userModel.findOne({ _id: req.user.userId })
    user.fullname = fullname
    user.email = email
    user.password = password

    await user.save()
    const token = user.createJWT()
    res.status(200).json({
        user, token,
    })
}


export const getUserController = async (req, res, next) => {
    try {
        // Get the user ID from the request parameters
        const userId = req.params.userId;

        // Retrieve the user document by ID
        const user = await User.findById(userId);

        // Check if user exists
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Send the user data in the response
        res.status(200).json({ user });
    } catch (error) {
        // Handle errors
        next(error);
    }
};

export const postUserController = async (req, res, next) => {
    try {
        const user = await userModel.findById({ _id: req.body.user.userId })
        user.password = undefined

        if (!user) {
            return res.status(200).send({
                message: "User not Found",
                success: false,
            })
        } else {
            res.status(200).send({
                success: true,
                data: user
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({
            message: "Auth Error",
            sucess: false,
            error: error.message
        })
    }
}

export const forgotpassController = async (req, res, next) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.send({ Status: "User Not Existed" });
        }
        const token = JWT.sign({ id: user._id }, "jwt_secret_key", { expiresIn: "1d" });

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'baryowork@gmail.com',
                pass: 'gsuy xpju ijoe lvuw',
            }
        });



        var mailOptions = {
            from: 'baryowork@gmail.com',
            to: email,
            subject: 'FORGOT PASSWORD',
            text: `Oops! Looks like you've forgotten your password. No worries, we've got you covered. Please enter your email address below and we'll send you instructions on how to reset your password. Stay secure

            To reset your password, please click the Link below. You'll receive further instructions via email. Thank you
            
            If you did not send this request to change your password, please disregard this message and ensure your account security by contacting our support team immediately.
            
            http://localhost:3000/reset-password/${user.id}/${token}`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                return res.status(500).send({ Status: "Error sending email" });
            } else {
                return res.send({ Status: "Success" });
            }
        });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).send({ Status: "An error occurred" });
    }
};

export const resetpassController = async (req, res, next) => {
    const { id, token } = req.params;
    const { password } = req.body;

    try {
        const decoded = await JWT.verify(token, "jwt_secret_key");
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.findByIdAndUpdate(id, { password: hashedPassword });
        res.send({ Status: "Success" });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).send({ Status: "An error occurred" });
    }
};
