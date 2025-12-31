import React, { useState, useEffect } from 'react';
import { Trash2, ShoppingCart, Heart } from 'lucide-react';
import { getWishlist, removeFromWishlist, addToCart } from '../utils/cartUtils';
import { useNavigate } from 'react-router-dom';

const Wishlist = () => {
    const navigate = useNavigate();
    const [wishlistItems, setWishlistItems] = useState([]);

    useEffect(() => {
        loadWishlist();
    }, []);

    const loadWishlist = () => {
        const items = getWishlist();
        setWishlistItems(items);
    };

    const removeFromWishlistHandler = (id) => {
        removeFromWishlist(id);
        loadWishlist();
    };

    const moveToCart = (item) => {
        if (addToCart(item, 1)) {
            removeFromWishlist(item.id);
            loadWishlist();
            setTimeout(() => navigate('/cart'), 500);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-gold-50 py-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <Heart className="w-10 h-10 text-purple-600 fill-purple-600" />
                        <h1 className="font-heading text-4xl font-bold text-gray-900">My Wishlist</h1>
                    </div>
                    <p className="text-gray-600 text-lg">
                        {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
                    </p>
                </div>

                {/* Wishlist Items */}
                {wishlistItems.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
                        <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                        <h2 className="font-heading text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
                        <p className="text-gray-600 mb-8">Start adding items you love to your wishlist!</p>
                        <a
                            href="/"
                            className="inline-block bg-gradient-to-r from-purple-600 to-gold-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                        >
                            Continue Shopping
                        </a>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {wishlistItems.map((item) => (
                            <div key={item.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                <div className="flex flex-col md:flex-row">
                                    {/* Image */}
                                    <div className="md:w-64 h-64 md:h-auto">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 p-6 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-heading text-2xl font-bold text-gray-900 mb-2">
                                                {item.name}
                                            </h3>
                                            <p className="text-3xl font-bold text-purple-600 mb-4">
                                                ₹{item.price.toLocaleString()}
                                            </p>
                                            <div className="flex items-center gap-2 mb-4">
                                                {item.inStock ? (
                                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                                        In Stock
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                                                        Out of Stock
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <button
                                                onClick={() => moveToCart(item)}
                                                disabled={!item.inStock}
                                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all ${item.inStock
                                                        ? 'bg-gradient-to-r from-purple-600 to-gold-500 text-white hover:shadow-lg'
                                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                    }`}
                                            >
                                                <ShoppingCart className="w-5 h-5" />
                                                {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                                            </button>
                                            <button
                                                onClick={() => removeFromWishlistHandler(item.id)}
                                                className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-red-500 text-red-500 rounded-lg font-semibold hover:bg-red-50 transition-all"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Continue Shopping */}
                {wishlistItems.length > 0 && (
                    <div className="mt-8 text-center">
                        <a
                            href="/"
                            className="inline-block bg-white text-purple-600 border-2 border-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-all"
                        >
                            Continue Shopping
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
