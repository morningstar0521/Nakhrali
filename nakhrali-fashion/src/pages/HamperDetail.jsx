import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hampersAPI } from '../utils/api';
import { Package, IndianRupee, ShoppingCart, ArrowLeft } from 'lucide-react';

const HamperDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hamper, setHamper] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHamper();
    }, [id]);

    const fetchHamper = async () => {
        try {
            setLoading(true);
            const data = await hampersAPI.getById(id);
            setHamper(data.hamper);
        } catch (error) {
            console.error('Error fetching hamper:', error);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return 'https://via.placeholder.com/600';
        if (imagePath.startsWith('http')) return imagePath;
        return `http://localhost:5001${imagePath}`;
    };

    const handleAddToCart = () => {
        // TODO: Implement add to cart functionality
        alert('Add to cart functionality coming soon!');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-gold-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (!hamper) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-gold-50 flex items-center justify-center">
                <div className="text-center">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Hamper not found</p>
                    <button
                        onClick={() => navigate('/suggested-hampers')}
                        className="mt-4 text-purple-600 hover:text-purple-700"
                    >
                        Back to Hampers
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-gold-50 py-16">
            <div className="container mx-auto px-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-8"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back</span>
                </button>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Image */}
                        <div className="relative h-96 lg:h-full">
                            <img
                                src={getImageUrl(hamper.image)}
                                alt={hamper.name}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Details */}
                        <div className="p-8">
                            <h1 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                {hamper.name}
                            </h1>
                            
                            {hamper.occasion_name && (
                                <p className="text-purple-600 font-semibold mb-4">
                                    {hamper.occasion_name}
                                </p>
                            )}

                            {hamper.description && (
                                <p className="text-gray-600 mb-6">{hamper.description}</p>
                            )}

                            {hamper.box_name && (
                                <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Gift Box</p>
                                    <p className="font-semibold text-gray-900">{hamper.box_name}</p>
                                </div>
                            )}

                            {/* Products */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Package className="w-5 h-5" />
                                    Items Included ({hamper.products?.length || 0})
                                </h3>
                                <div className="space-y-2">
                                    {hamper.products?.map((product, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{product.name}</p>
                                                {product.quantity > 1 && (
                                                    <p className="text-sm text-gray-600">Qty: {product.quantity}</p>
                                                )}
                                            </div>
                                            <p className="text-gray-600 flex items-center">
                                                <IndianRupee className="w-4 h-4" />
                                                {parseFloat(product.price).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Price & Action */}
                            <div className="border-t pt-6">
                                <div className="flex items-center justify-between mb-6">
                                    <span className="text-gray-600">Total Price</span>
                                    <div className="flex items-center text-purple-600 font-bold text-3xl">
                                        <IndianRupee className="w-7 h-7" />
                                        <span>{parseFloat(hamper.total_price).toLocaleString()}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    className="w-full bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HamperDetail;
