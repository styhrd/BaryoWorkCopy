import multer from 'multer';
import path from 'path';

// Set up multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Specify the destination folder
    },
    filename: function (req, file, cb) {
        // Generate the filename using the user ID and original filename
        const userId = req.user.userId; // Assuming userId is available in req.user
        const fileName = userId + file.originalname;
        cb(null, fileName);
    }
});

// Initialize multer upload with the storage configuration
const upload = multer({ storage: storage }).single('testImage');

export default upload;
