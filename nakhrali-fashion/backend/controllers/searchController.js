const { pool } = require('../config/db');

// Search products
const searchProducts = async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.trim().length < 2) {
            return res.json({
                products: [],
                categories: [],
                suggestions: []
            });
        }

        const searchTerm = `%${q.toLowerCase()}%`;

        // Search products by name, description, category, tags
        const productQuery = `
            SELECT 
                id,
                name,
                description,
                price,
                sale_price,
                category,
                images,
                tags,
                stock,
                featured
            FROM products
            WHERE 
                LOWER(name) LIKE $1 
                OR LOWER(description) LIKE $1 
                OR LOWER(category) LIKE $1
                OR EXISTS (
                    SELECT 1 FROM jsonb_array_elements_text(tags) tag 
                    WHERE LOWER(tag) LIKE $1
                )
            ORDER BY 
                CASE 
                    WHEN LOWER(name) LIKE $2 THEN 1
                    WHEN LOWER(name) LIKE $1 THEN 2
                    ELSE 3
                END,
                featured DESC,
                created_at DESC
            LIMIT 10
        `;

        const exactMatch = `${q.toLowerCase()}%`;
        const products = await pool.query(productQuery, [searchTerm, exactMatch]);

        // Get unique categories from results
        const categories = [...new Set(products.rows.map(p => p.category))];

        // Generate search suggestions based on popular tags and categories
        const suggestionsQuery = `
            SELECT DISTINCT tag
            FROM products, jsonb_array_elements_text(tags) tag
            WHERE LOWER(tag) LIKE $1
            LIMIT 5
        `;
        const suggestions = await pool.query(suggestionsQuery, [searchTerm]);

        res.json({
            products: products.rows,
            categories: categories,
            suggestions: suggestions.rows.map(s => s.tag),
            count: products.rows.length
        });
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({ message: 'Server error while searching' });
    }
};

// Get popular search terms (most common tags)
const getPopularSearches = async (req, res) => {
    try {
        const query = `
            SELECT tag, COUNT(*) as count
            FROM products, jsonb_array_elements_text(tags) tag
            GROUP BY tag
            ORDER BY count DESC
            LIMIT 10
        `;
        const result = await pool.query(query);
        
        res.json({
            popular: result.rows.map(r => r.tag)
        });
    } catch (error) {
        console.error('Error fetching popular searches:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    searchProducts,
    getPopularSearches
};
