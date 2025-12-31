import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { productsAPI, occasionsAPI } from '../utils/api';
import { addToCart, addToWishlist } from '../utils/cartUtils';
import { Heart, ShoppingCart, Star, ChevronDown, ChevronUp, X } from 'lucide-react';

const CategoryPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const category = searchParams.get('category') || 'All Products';
    const searchQuery = searchParams.get('search') || '';
    const [products, setProducts] = useState([]);
    const [occasions, setOccasions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredProducts, setFilteredProducts] = useState([]);

    // Filter states - temporary (before apply)
    const [tempFilters, setTempFilters] = useState({
        subCategory: [],
        style: [],
        priceRange: [0, 50000],
        occasion: [],
        color: [],
        plating: []
    });

    // Applied filters (after clicking apply)
    const [filters, setFilters] = useState({
        subCategory: [],
        style: [],
        priceRange: [0, 50000],
        occasion: [],
        color: [],
        plating: []
    });

    const [expandedFilters, setExpandedFilters] = useState({
        subCategory: true,
        style: true,
        price: true,
        occasion: true,
        color: true,
        plating: true
    });

    // Category-specific filter options - recalculates when category changes
    const filterOptions = useMemo(() => {
        switch (category) {
            case 'Rings':
                return {
                    subCategory: ['AD', 'CZ (Zircon)', 'Rajwada'],
                    style: [],
                    occasion: ['Bridal', 'Engagement', 'Couple', 'Party Wear', 'Everyday', 'Festive', 'Exclusive'],
                    color: ['Red', 'Blue', 'Sky Blue', 'Teal', 'Black', 'Pink', 'Lavender', 'Emerald', 'Baby Pink', 'Silver'],
                    plating: ['Silver', 'Gold', 'Rose Gold', 'Rajwada']
                };
            case 'Necklace':
                return {
                    subCategory: ['AD', 'CZ (Zircon)'],
                    style: ['Choker', 'Longer', 'Layered'],
                    occasion: ['Bridal Wear', 'Casual', 'Traditional', 'Everyday', 'Exclusive'],
                    color: ['Red', 'Blue', 'Sky Blue', 'Teal', 'Black', 'Pink', 'Lavender', 'Emerald', 'Baby Pink', 'Silver'],
                    plating: ['Silver', 'Gold', 'Rose Gold']
                };
            case 'Earrings':
                return {
                    subCategory: ['AD', 'CZ (Zircon)', 'Rajwada'],
                    style: ['Drop and Danglers', 'Hoops and Huggies', 'Studs and Tops', 'Jhumkas'],
                    occasion: ['Bridal Wear', 'Casual', 'Traditional', 'Everyday', 'Exclusive'],
                    color: ['Red', 'Blue', 'Sky Blue', 'Teal', 'Black', 'Pink', 'Lavender', 'Emerald', 'Baby Pink', 'Silver'],
                    plating: ['Silver', 'Gold', 'Rose Gold']
                };
            case 'Bracelets':
                return {
                    subCategory: ['AD', 'CZ (Zircon)', 'Rajwada', 'Style Statement'],
                    style: ['Pattern', 'Fit All'],
                    occasion: ['Wedding', 'Everyday', 'Festive', 'Buzz Collection'],
                    color: ['Red', 'Blue', 'Sky Blue', 'Teal', 'Black', 'Pink', 'Lavender', 'Emerald', 'Baby Pink', 'Silver'],
                    plating: ['Silver', 'Gold', 'Rose']
                };
            case 'Mangalsutra':
                return {
                    subCategory: ['CZ (Zircon)', 'Rajwada'],
                    style: ['Long', 'Short'],
                    occasion: ['Bridal Wear', 'Casual', 'Traditional', 'Everyday'],
                    color: ['Red', 'Blue', 'Sky Blue', 'Teal', 'Black', 'Pink', 'Lavender', 'Emerald', 'Baby Pink', 'Silver'],
                    plating: ['Silver', 'Gold', 'Rose Gold']
                };
            case 'Pendant Sets':
                return {
                    subCategory: ['AD', 'CZ (Zircon)', 'Shiny-Wear'],
                    style: ['Pendant Sets', 'Pendant Without Earring'],
                    occasion: ['Bridal', 'Everyday', 'Engagement', 'Buzz Collection', 'Casual Wear'],
                    color: ['Red', 'Blue', 'Sky Blue', 'Teal', 'Black', 'Pink', 'Lavender', 'Emerald', 'Baby Pink', 'Silver'],
                    plating: ['Silver', 'Gold', 'Rose Gold']
                };
            case 'Hair Accessories':
            case 'Hair Accessories & Pins':
            case 'Hair Accessories & Magnetic Saree Pins':
            case 'Magnetic Saree Pins':
                return {
                    subCategory: ['Clutcher', 'Hair Back Clips', 'Magnetic Saree Pins', 'Indo Western Pins'],
                    style: [],
                    occasion: [],
                    color: [],
                    plating: []
                };
            case 'Bangles':
            case 'Bangles & Kada':
                return {
                    subCategory: ['AD', 'CZ (Zircon)', 'Rajwada'],
                    style: ['Kada', 'Bangles'],
                    occasion: ['Bridal', 'Everyday', 'Festive', 'Shubh Collection', 'Style on Budget'],
                    color: ['Red', 'Blue', 'Sky Blue', 'Teal', 'Black', 'Pink', 'Lavender', 'Emerald', 'Baby Pink', 'Silver'],
                    plating: ['Silver', 'Gold', 'Rajwada']
                };
            default:
                return {
                    subCategory: [],
                    style: [],
                    occasion: [],
                    color: [],
                    plating: []
                };
        }
    }, [category]);

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [category, products, filters]);

    // Reset filters when category changes
    useEffect(() => {
        const defaultFilters = {
            subCategory: [],
            style: [],
            priceRange: [0, 50000],
            occasion: [],
            color: [],
            plating: []
        };
        setTempFilters(defaultFilters);
        setFilters(defaultFilters);
    }, [category]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const [productsData, occasionsData] = await Promise.all([
                productsAPI.getAll(),
                occasionsAPI.getActive()
            ]);
            setProducts(productsData.products || []);
            setOccasions(occasionsData.occasions || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...products];

        // Filter by search query if present
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(query) ||
                p.description?.toLowerCase().includes(query) ||
                p.category?.toLowerCase().includes(query) ||
                p.tags?.some(tag => tag.toLowerCase().includes(query))
            );
        }

        // Filter by category
        if (category !== 'All Products' && category && !searchQuery) {
            filtered = filtered.filter(p => p.category === category);
        }

        // Filter by price range
        filtered = filtered.filter(p => {
            const price = p.salePrice || p.price;
            return price >= filters.priceRange[0] && price <= filters.priceRange[1];
        });

        // Filter by sub-category (tags)
        if (filters.subCategory.length > 0) {
            filtered = filtered.filter(p =>
                p.tags && filters.subCategory.some(sc => p.tags.includes(sc))
            );
        }

        // Filter by style (tags)
        if (filters.style.length > 0) {
            filtered = filtered.filter(p =>
                p.tags && filters.style.some(s => p.tags.includes(s))
            );
        }

        // Filter by occasion (tags)
        if (filters.occasion.length > 0) {
            filtered = filtered.filter(p =>
                p.tags && filters.occasion.some(o => p.tags.includes(o))
            );
        }

        // Filter by color
        if (filters.color.length > 0) {
            filtered = filtered.filter(p =>
                p.colors && filters.color.some(c => p.colors.includes(c))
            );
        }

        // Filter by plating (material)
        if (filters.plating.length > 0) {
            filtered = filtered.filter(p =>
                p.material && filters.plating.some(pl => p.material.includes(pl))
            );
        }

        setFilteredProducts(filtered);
    };

    const handleFilterChange = (filterType, value) => {
        setTempFilters(prev => {
            const currentValues = prev[filterType];
            const newValues = currentValues.includes(value)
                ? currentValues.filter(v => v !== value)
                : [...currentValues, value];

            return { ...prev, [filterType]: newValues };
        });
    };

    const handlePriceChange = (index, value) => {
        setTempFilters(prev => {
            const newRange = [...prev.priceRange];
            newRange[index] = parseInt(value);
            return { ...prev, priceRange: newRange };
        });
    };

    const applyFiltersClick = () => {
        setFilters(tempFilters);
    };

    const clearFilters = () => {
        const defaultFilters = {
            subCategory: [],
            style: [],
            priceRange: [0, 50000],
            occasion: [],
            color: [],
            plating: []
        };
        setTempFilters(defaultFilters);
        setFilters(defaultFilters);
    };

    const toggleFilterSection = (section) => {
        setExpandedFilters(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return '';
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }
        return `http://localhost:5001${imageUrl}`;
    };

    const getCategoryTitle = () => {
        if (searchQuery) return `Search Results for "${searchQuery}"`;
        if (category === 'Sales') return 'Sale Items';
        return category || 'All Products';
    };

    const getCategoryDescription = () => {
        if (searchQuery) {
            return `Found ${filteredProducts.length} ${filteredProducts.length === 1 ? 'product' : 'products'} matching your search`;
        }
        const descriptions = {
            'Necklace': 'Discover our exquisite collection of necklaces, from delicate chains to statement pieces',
            'Rings': 'Find the perfect ring for every occasion, from elegant bands to dazzling statement rings',
            'Earrings': 'Explore our stunning earring collection featuring studs, hoops, and chandelier designs',
            'Bracelets': 'Adorn your wrists with our beautiful bracelets and bangles',
            'Mangalsutra': 'Traditional and contemporary mangalsutra designs for your special moments',
            'Pendant Sets': 'Complete your look with our coordinated pendant and earring sets',
            'Hair Accessories': 'Elegant hair accessories to complement your style',
            'Hair Accessories & Pins': 'Elegant hair accessories to complement your style',
            'Hair Accessories & Magnetic Saree Pins': 'Elegant hair accessories to complement your style',
            'Bangles': 'Classic and modern bangles and kadas for every taste',
            'Bangles & Kada': 'Classic and modern bangles and kadas for every taste',
            'Gift Hampers': 'Curated gift collections perfect for any celebration',
            'Sales': 'Exclusive deals and discounts on selected items'
        };
        return descriptions[category] || 'Browse our complete collection of handcrafted jewelry';
    };

    const FilterSection = ({ title, filterKey, options }) => {
        // Don't render if no options
        if (!options || options.length === 0) return null;

        return (
            <div className="border-b border-gray-200 pb-4">
                <button
                    onClick={() => toggleFilterSection(filterKey)}
                    className="w-full flex items-center justify-between py-2 text-left font-semibold text-gray-900 hover:text-purple-600 transition-colors"
                >
                    <span>{title}</span>
                    {expandedFilters[filterKey] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {expandedFilters[filterKey] && (
                    <div className="mt-3 space-y-2">
                        {options.map((option) => (
                            <label key={option} className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={tempFilters[filterKey].includes(option)}
                                    onChange={() => handleFilterChange(filterKey, option)}
                                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                />
                                <span className="text-sm text-gray-700 group-hover:text-purple-600 transition-colors">{option}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-purple-600 to-gold-500 text-white py-16">
                <div className="container mx-auto px-4">
                    <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">{getCategoryTitle()}</h1>
                    <p className="text-lg md:text-xl opacity-90 max-w-2xl">{getCategoryDescription()}</p>
                    <div className="mt-6 flex items-center gap-4 text-sm">
                        <span className="bg-white/20 px-4 py-2 rounded-full">
                            {category === 'Gift Hampers'
                                ? `${occasions.length} ${occasions.length === 1 ? 'Occasion' : 'Occasions'}`
                                : `${filteredProducts.length} ${filteredProducts.length === 1 ? 'Product' : 'Products'}`
                            }
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Content with Filters */}
            <div className="container mx-auto px-4 py-8">
                {/* Shop by Occasion Section (Only for Gift Hampers) */}
                {category === 'Gift Hampers' && occasions.length > 0 && (
                    <div className="mb-12">
                        <div className="text-center mb-8">
                            <h2 className="font-heading text-3xl font-bold text-gray-900 mb-2">Shop by Occasion</h2>
                            <p className="text-gray-600">Find the perfect gift for every celebration.</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {occasions.map((occasion) => (
                                <button
                                    key={occasion.id}
                                    onClick={() => {
                                        // Navigate to hamper options page with the occasion ID
                                        navigate(`/hamper-options/${occasion.id}`);
                                    }}
                                    className="group relative h-48 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all text-left"
                                >
                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors z-10" />
                                    <img
                                        src={getImageUrl(occasion.image)}
                                        alt={occasion.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white p-4">
                                        <h3 className="font-heading text-xl font-bold mb-1 text-center">{occasion.title}</h3>
                                        <p className="text-xs opacity-90 text-center">{occasion.description}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filter Sidebar (Hide for Gift Hampers) */}
                    {category !== 'Gift Hampers' && (
                        <aside className="lg:w-64 flex-shrink-0">
                            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="font-heading text-xl font-bold text-gray-900">Filters</h2>
                                    <button
                                        onClick={clearFilters}
                                        className="text-sm text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1"
                                    >
                                        <X className="w-4 h-4" />
                                        Clear All
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {/* Category Filter */}
                                    <FilterSection title="Category" filterKey="subCategory" options={filterOptions.subCategory} />

                                    {/* Style Filter */}
                                    <FilterSection title="Style" filterKey="style" options={filterOptions.style} />

                                    {/* Price Range Filter */}
                                    <div className="border-b border-gray-200 pb-4">
                                        <button
                                            onClick={() => toggleFilterSection('price')}
                                            className="w-full flex items-center justify-between py-2 text-left font-semibold text-gray-900 hover:text-purple-600 transition-colors"
                                        >
                                            <span>Price Range</span>
                                            {expandedFilters.price ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                        </button>
                                        {expandedFilters.price && (
                                            <div className="mt-4 space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1">
                                                        <label className="text-xs text-gray-600 mb-1 block">Min</label>
                                                        <input
                                                            type="number"
                                                            value={tempFilters.priceRange[0]}
                                                            onChange={(e) => handlePriceChange(0, e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                        />
                                                    </div>
                                                    <span className="text-gray-400 mt-5">-</span>
                                                    <div className="flex-1">
                                                        <label className="text-xs text-gray-600 mb-1 block">Max</label>
                                                        <input
                                                            type="number"
                                                            value={tempFilters.priceRange[1]}
                                                            onChange={(e) => handlePriceChange(1, e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                        />
                                                    </div>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="50000"
                                                    step="500"
                                                    value={tempFilters.priceRange[1]}
                                                    onChange={(e) => handlePriceChange(1, e.target.value)}
                                                    className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                                />
                                                <div className="flex justify-between text-xs text-gray-600">
                                                    <span>₹{tempFilters.priceRange[0].toLocaleString()}</span>
                                                    <span>₹{tempFilters.priceRange[1].toLocaleString()}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Occasion Filter */}
                                    <FilterSection title="Occasion" filterKey="occasion" options={filterOptions.occasion} />

                                    {/* Color Filter */}
                                    <FilterSection title="Color" filterKey="color" options={filterOptions.color} />

                                    {/* Plating Filter */}
                                    <FilterSection title="Plating" filterKey="plating" options={filterOptions.plating} />
                                </div>

                                {/* Apply Filters Button */}
                                <button
                                    onClick={applyFiltersClick}
                                    className="w-full mt-6 bg-gradient-to-r from-purple-600 to-gold-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </aside>
                    )}

                    {/* Products Grid */}
                    <div className="flex-1" id="products-grid">
                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProducts.map((product) => (
                                    <Link
                                        key={product.id}
                                        to={`/product/${product.id}`}
                                        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group block"
                                    >
                                        {/* Product Image */}
                                        <div className="relative h-64 bg-gray-200 overflow-hidden">
                                            {product.images && product.images.length > 0 ? (
                                                <img
                                                    src={getImageUrl(product.images[0])}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    No Image
                                                </div>
                                            )}

                                            {/* Sale Badge */}
                                            {product.salePrice && (
                                                <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                                    Sale
                                                </div>
                                            )}

                                            {/* Featured Badge */}
                                            {product.featured && (
                                                <div className="absolute top-3 right-3 bg-gold-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                                                    <Star className="w-4 h-4 fill-current" />
                                                    Featured
                                                </div>
                                            )}

                                            {/* Quick Actions */}
                                            <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (addToWishlist(product)) {
                                                            // Show brief feedback
                                                            e.currentTarget.classList.add('scale-125');
                                                            setTimeout(() => {
                                                                e.currentTarget.classList.remove('scale-125');
                                                                navigate('/wishlist');
                                                            }, 300);
                                                        }
                                                    }}
                                                    className="bg-white p-2 rounded-full shadow-lg hover:bg-purple-50 transition-all"
                                                >
                                                    <Heart className="w-5 h-5 text-purple-600" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (addToCart(product, 1)) {
                                                            // Show brief feedback
                                                            e.currentTarget.classList.add('scale-125');
                                                            setTimeout(() => {
                                                                e.currentTarget.classList.remove('scale-125');
                                                                navigate('/cart');
                                                            }, 300);
                                                        }
                                                    }}
                                                    className="bg-white p-2 rounded-full shadow-lg hover:bg-purple-50 transition-all"
                                                >
                                                    <ShoppingCart className="w-5 h-5 text-purple-600" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Product Info */}
                                        <div className="p-4">
                                            <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

                                            {/* Price */}
                                            <div className="flex items-center gap-2 mb-3">
                                                {product.salePrice ? (
                                                    <>
                                                        <span className="text-xl font-bold text-green-600">₹{product.salePrice.toLocaleString()}</span>
                                                        <span className="text-sm text-gray-500 line-through">₹{product.price.toLocaleString()}</span>
                                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                                                            {Math.round((1 - product.salePrice / product.price) * 100)}% OFF
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                                                )}
                                            </div>

                                            {/* Stock Status */}
                                            <div className="flex items-center justify-between">
                                                <span className={`text-sm font-semibold ${product.stock > 10 ? 'text-green-600' :
                                                    product.stock > 0 ? 'text-yellow-600' :
                                                        'text-red-600'
                                                    }`}>
                                                    {product.stock > 10 ? 'In Stock' :
                                                        product.stock > 0 ? `Only ${product.stock} left` :
                                                            'Out of Stock'}
                                                </span>

                                                {/* Category Badge */}
                                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                                    {product.category}
                                                </span>
                                            </div>

                                            {/* View Details Button */}
                                            <div
                                                className="w-full mt-4 bg-gradient-to-r from-purple-600 to-gold-500 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition-all text-center"
                                            >
                                                View Details
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryPage;
