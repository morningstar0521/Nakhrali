const express = require('express');
const router = express.Router();
const {
    getOccasions,
    getAllOccasions,
    createOccasion,
    updateOccasion,
    deleteOccasion
} = require('../controllers/occasionController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
    .get(getOccasions)
    .post(protect, admin, createOccasion);

router.route('/all')
    .get(protect, admin, getAllOccasions);

router.route('/:id')
    .put(protect, admin, updateOccasion)
    .delete(protect, admin, deleteOccasion);

module.exports = router;
