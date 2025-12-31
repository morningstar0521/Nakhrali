const path = require('path');
const fs = require('fs');

// @desc    Upload user profile picture
// @route   POST /api/user/upload-profile-picture
// @access  Private (any authenticated user)
exports.uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image'
            });
        }

        // Generate URL for uploaded file
        const imageUrl = `/uploads/profiles/${req.file.filename}`;

        res.status(200).json({
            success: true,
            image: imageUrl,
            message: 'Profile picture uploaded successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete user profile picture
// @route   DELETE /api/user/profile-picture/:filename
// @access  Private (any authenticated user)
exports.deleteProfilePicture = async (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(__dirname, '../uploads/profiles', filename);

        // Check if file exists
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.status(200).json({
                success: true,
                message: 'Profile picture deleted successfully'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
