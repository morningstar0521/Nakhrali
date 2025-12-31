import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { productsAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const FeaturedCollections = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Helper function to get correct image URL
    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400';
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }
        return `http://localhost:5001${imageUrl}`;
    };

    useEffect(() => {
        fetchFeaturedProducts();
    }, []);

    const fetchFeaturedProducts = async () => {
        try {
            setLoading(true);
            const response = await productsAPI.getFeatured();
            setProducts(response.products || []);
        } catch (error) {
            console.error('Error fetching featured products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    if (loading) {
        return (
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                    </div>
                </div>
            </section>
        );
    }

    if (products.length === 0) {
        return null; // Don't show section if no featured products
    }

    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Featured Collections
                    </h2>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Handpicked pieces that define elegance and sophistication
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.slice(0, 4).map((product) => (
                        <div 
                            key={product.id} 
                            className="card overflow-hidden group cursor-pointer"
                            onClick={() => handleProductClick(product.id)}
                        >
                            <div className="relative overflow-hidden">
                                <img
                                    src={getImageUrl(product.images?.[0])}
                                    alt={product.name}
                                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                {product.salePrice && (
                                    <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold bg-gold-500 text-gray-900">
                                        Sale
                                    </span>
                                )}
                                <button 
                                    className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-purple-50 transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Add to wishlist functionality
                                    }}
                                >
                                    <Heart className="w-5 h-5 text-purple-500" />
                                </button>
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button 
                                        className="w-full btn-primary py-2 text-sm flex items-center justify-center gap-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // Add to cart functionality
                                        }}
                                    >
                                        <ShoppingCart className="w-4 h-4" />
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-500 transition-colors">
                                    {product.name}
                                </h3>
                                <div className="flex items-center gap-2">
                                    {product.salePrice ? (
                                        <>
                                            <span className="text-gold-500 font-bold text-lg">₹{product.salePrice.toLocaleString()}</span>
                                            <span className="text-gray-400 line-through text-sm">₹{product.price.toLocaleString()}</span>
                                        </>
                                    ) : (
                                        <span className="text-gray-900 font-bold text-lg">₹{product.price.toLocaleString()}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <button className="btn-secondary">
                        View All Collections
                    </button>
                </div>
            </div>
        </section>
    );
};

export default FeaturedCollections;
