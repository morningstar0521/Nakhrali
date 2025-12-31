const express = require('express');
const router = express.Router();
const {
    getProducts,
    getFeaturedProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadImages,
    deleteImage
} = require('../controllers/productController');
const { extractProductFromUrl } = require('../controllers/scraperController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const upload = require('../config/uploadConfig');

// Featured products route (must come before /:id)
router.get('/featured', getFeaturedProducts);

router.route('/')
    .get(getProducts)
    .post(protect, admin, createProduct);

router.route('/:id')
    .get(getProduct)
    .put(protect, admin, updateProduct)
    .delete(protect, admin, deleteProduct);

// Image upload route
router.post('/upload', protect, admin, upload.array('images', 10), uploadImages);

// Image deletion route
router.delete('/images/:filename', protect, admin, deleteImage);

// Product extraction from URL
router.post('/extract', protect, admin, extractProductFromUrl);

module.exports = router;
