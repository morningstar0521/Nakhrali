const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const profileUpload = require('../config/profileUploadConfig');
const {
    getProfile,
    updateProfile,
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    getOrders,
    getOrderDetails,
    createOrder
} = require('../controllers/userController');
const {
    uploadProfilePicture,
    deleteProfilePicture
} = require('../controllers/uploadController');

// All routes require authentication
router.use(protect);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Profile picture upload routes
router.post('/upload-profile-picture', profileUpload.single('image'), uploadProfilePicture);
router.delete('/profile-picture/:filename', deleteProfilePicture);

// Address routes
router.get('/addresses', getAddresses);
router.post('/addresses', addAddress);
router.put('/addresses/:id', updateAddress);
router.delete('/addresses/:id', deleteAddress);

// Order routes
router.get('/orders', getOrders);
router.get('/orders/:id', getOrderDetails);
router.post('/orders', createOrder);

module.exports = router;
