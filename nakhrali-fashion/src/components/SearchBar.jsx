import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, TrendingUp, Package } from 'lucide-react';

const SearchBar = ({ className = '' }) => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ products: [], categories: [], suggestions: [] });
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [popularSearches, setPopularSearches] = useState([]);
    const searchRef = useRef(null);
    const debounceTimer = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch popular searches on mount
    useEffect(() => {
        fetchPopularSearches();
    }, []);

    const fetchPopularSearches = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/search/popular');
            const data = await response.json();
            setPopularSearches(data.popular || []);
        } catch (error) {
            console.error('Error fetching popular searches:', error);
        }
    };

    const searchProducts = async (searchQuery) => {
        if (searchQuery.trim().length < 2) {
            setResults({ products: [], categories: [], suggestions: [] });
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch(
                `http://localhost:5001/api/search?q=${encodeURIComponent(searchQuery)}`
            );
            const data = await response.json();
            setResults(data);
        } catch (error) {
            console.error('Error searching:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        setIsOpen(true);

        // Debounce search
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            searchProducts(value);
        }, 300);
    };

    const handleSearch = (searchTerm = query) => {
        if (searchTerm.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
            setIsOpen(false);
            setQuery('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
        setIsOpen(false);
        setQuery('');
    };

    const handleCategoryClick = (category) => {
        navigate(`/products?category=${encodeURIComponent(category)}`);
        setIsOpen(false);
        setQuery('');
    };

    const handleSuggestionClick = (suggestion) => {
        setQuery(suggestion);
        handleSearch(suggestion);
    };

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return 'https://via.placeholder.com/100';
        if (imageUrl.startsWith('http')) return imageUrl;
        return `http://localhost:5001${imageUrl}`;
    };

    const showResults = isOpen && (query.length >= 2 || results.products.length > 0);
    const showPopular = isOpen && query.length === 0 && popularSearches.length > 0;

    return (
        <div ref={searchRef} className={`relative ${className}`}>
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Search for jewelry, collections..."
                    className="w-full px-4 py-3 pr-24 rounded-lg border-2 border-purple-300 focus:outline-none focus:border-gold-500 transition-colors"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {query && (
                        <button
                            onClick={() => {
                                setQuery('');
                                setResults({ products: [], categories: [], suggestions: [] });
                            }}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                    )}
                    <button
                        onClick={() => handleSearch()}
                        className="bg-gold-500 p-2 rounded-md hover:bg-gold-600 transition-colors"
                    >
                        <Search className="w-5 h-5 text-gray-900" />
                    </button>
                </div>
            </div>

            {/* Search Results Dropdown */}
            {(showResults || showPopular) && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-2xl border border-gray-200 max-h-[500px] overflow-y-auto z-50">
                    {/* Loading State */}
                    {isLoading && (
                        <div className="p-4 text-center text-gray-500">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                            <p className="mt-2 text-sm">Searching...</p>
                        </div>
                    )}

                    {/* Popular Searches */}
                    {showPopular && !isLoading && (
                        <div className="p-4">
                            <div className="flex items-center gap-2 text-gray-600 mb-3">
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-sm font-semibold">Popular Searches</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {popularSearches.slice(0, 8).map((term, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSuggestionClick(term)}
                                        className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm hover:bg-purple-100 transition-colors"
                                    >
                                        {term}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Search Results */}
                    {showResults && !isLoading && (
                        <>
                            {/* Suggestions */}
                            {results.suggestions && results.suggestions.length > 0 && (
                                <div className="border-b border-gray-100 p-3">
                                    <p className="text-xs font-semibold text-gray-500 mb-2">SUGGESTIONS</p>
                                    <div className="flex flex-wrap gap-2">
                                        {results.suggestions.map((suggestion, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                className="px-3 py-1 bg-gray-50 text-gray-700 rounded-md text-sm hover:bg-gray-100 transition-colors"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Categories */}
                            {results.categories && results.categories.length > 0 && (
                                <div className="border-b border-gray-100 p-3">
                                    <p className="text-xs font-semibold text-gray-500 mb-2">CATEGORIES</p>
                                    <div className="flex flex-wrap gap-2">
                                        {results.categories.map((category, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleCategoryClick(category)}
                                                className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-md text-sm font-medium hover:bg-purple-100 transition-colors"
                                            >
                                                {category}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Products */}
                            {results.products && results.products.length > 0 ? (
                                <div className="p-2">
                                    <p className="text-xs font-semibold text-gray-500 mb-2 px-2">PRODUCTS ({results.count})</p>
                                    <div className="space-y-1">
                                        {results.products.map((product) => (
                                            <button
                                                key={product.id}
                                                onClick={() => handleProductClick(product.id)}
                                                className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                                            >
                                                <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                                                    <img
                                                        src={getImageUrl(product.images?.[0])}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                                                        {product.name}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {product.category}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-sm font-bold text-purple-600">
                                                            ₹{product.sale_price || product.price}
                                                        </span>
                                                        {product.sale_price && (
                                                            <span className="text-xs text-gray-400 line-through">
                                                                ₹{product.price}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <Package className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => handleSearch()}
                                        className="w-full mt-2 py-2 text-sm text-purple-600 font-semibold hover:bg-purple-50 rounded-lg transition-colors"
                                    >
                                        View all results →
                                    </button>
                                </div>
                            ) : query.length >= 2 ? (
                                <div className="p-8 text-center">
                                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium">No products found</p>
                                    <p className="text-sm text-gray-400 mt-1">Try different keywords</p>
                                </div>
                            ) : null}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
