const express = require('express');
const router = express.Router();
const { searchProducts, getPopularSearches } = require('../controllers/searchController');

// Search products
router.get('/', searchProducts);

// Get popular searches
router.get('/popular', getPopularSearches);

module.exports = router;
