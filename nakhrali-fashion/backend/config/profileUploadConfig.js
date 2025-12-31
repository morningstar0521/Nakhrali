const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists for profile pictures
const profileUploadDir = 'uploads/profiles';
if (!fs.existsSync(profileUploadDir)) {
    fs.mkdirSync(profileUploadDir, { recursive: true });
}

// Configure storage for profile pictures
const profileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, profileUploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with user ID and timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `profile-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// File filter - only allow images with strict validation
const imageFileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, webp)'));
    }
};

// Create multer upload instance for profile pictures
const profileUpload = multer({
    storage: profileStorage,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB limit for profile pictures
    },
    fileFilter: imageFileFilter
});

module.exports = profileUpload;
