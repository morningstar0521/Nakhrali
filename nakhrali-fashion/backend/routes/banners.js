const express = require('express');
const router = express.Router();
const {
    getBanners,
    getAllBanners,
    getBanner,
    createBanner,
    updateBanner,
    deleteBanner
} = require('../controllers/bannerController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

router.get('/', getBanners);
router.get('/all', protect, admin, getAllBanners);
router.post('/', protect, admin, createBanner);

router.route('/:id')
    .get(getBanner)
    .put(protect, admin, updateBanner)
    .delete(protect, admin, deleteBanner);

module.exports = router;
