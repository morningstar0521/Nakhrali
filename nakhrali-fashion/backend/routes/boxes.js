const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
    getBoxes,
    getAllBoxes,
    createBox,
    updateBox,
    deleteBox
} = require('../controllers/boxController');

// Public routes
router.route('/')
    .get(getBoxes)
    .post(protect, admin, createBox);

// Admin routes
router.route('/all')
    .get(protect, admin, getAllBoxes);

router.route('/:id')
    .put(protect, admin, updateBox)
    .delete(protect, admin, deleteBox);

module.exports = router;
