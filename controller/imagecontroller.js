import Image from '../models/imageModel.js';
import User from '../models/userModel.js';

export const uploadImageController = async (req, res) => {
    try {
        // Check if req.file is defined
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Generate the file name with userId + original filename
        const userId = req.user.userId; // Assuming userId is available in req.user
        const fileName = userId + req.file.originalname;

        // Create a new image document
        const newImage = new Image({
            image: fileName // Save the filename
        });

        // Save the image document
        const savedImage = await newImage.save();

        // Get the current user's profile
        const user = await User.findById(req.user.userId).populate('profile');
        if (!user || !user.profile) {
            return res.status(404).json({ message: 'User profile not found' });
        }

        // Update the image attribute of the profile with the new image id
        user.profile.image = savedImage._id;

        // Save the updated profile
        await user.profile.save();

        res.status(201).json({ message: 'Image uploaded successfully', image: savedImage });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to save image data', error: error.message });
    }
};

export const getImageByIdController = async (req, res) => {
    try {
        const imageId = req.params.imageId;

        // Query the database for the image with the specified ID
        const image = await Image.findById(imageId);

        // If the image is not found, return a 404 error
        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }

        // If the image is found, return it as a response
        res.status(200).json({ image });
    } catch (error) {
        // If an error occurs, return a 500 error with the error message
        return res.status(500).json({ message: 'Failed to retrieve image', error: error.message });
    }
};