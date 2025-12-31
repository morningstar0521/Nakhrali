const express = require('express');
const router = express.Router();
const hamperController = require('../controllers/hamperController');
const { protect, admin } = require('../middleware/auth');

// Public routes
router.get('/', hamperController.getActiveHampers);
router.get('/all', hamperController.getAllHampers);
router.get('/occasion/:occasionId', hamperController.getHampersByOccasion);
router.get('/:id', hamperController.getHamperById);

// Admin routes
router.post('/', protect, admin, hamperController.createHamper);
router.put('/:id', protect, admin, hamperController.updateHamper);
router.delete('/:id', protect, admin, hamperController.deleteHamper);

module.exports = router;
