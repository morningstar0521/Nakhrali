import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productsAPI } from '../utils/api';
import { addToCart, addToWishlist } from '../utils/cartUtils';
import { Heart, ShoppingCart, Star, ChevronLeft, ChevronRight, Minus, Plus, Share2, Package, Truck, Shield } from 'lucide-react';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);
    const [addedToWishlist, setAddedToWishlist] = useState(false);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const data = await productsAPI.getById(id);
            setProduct(data.product);
        } catch (error) {
            console.error('Error fetching product:', error);
            alert('Failed to load product details');
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return '';
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }
        return `http://localhost:5001${imageUrl}`;
    };

    const handlePrevImage = () => {
        setSelectedImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setSelectedImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
    };

    const handleQuantityChange = (change) => {
        const newQuantity = quantity + change;
        if (newQuantity >= 1 && newQuantity <= product.stock) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = () => {
        if (addToCart(product, quantity)) {
            setAddedToCart(true);
            setTimeout(() => {
                setAddedToCart(false);
                navigate('/cart');
            }, 1000);
        } else {
            alert('Failed to add to cart');
        }
    };

    const handleAddToWishlist = () => {
        if (addToWishlist(product)) {
            setAddedToWishlist(true);
            setTimeout(() => {
                setAddedToWishlist(false);
                navigate('/wishlist');
            }, 1000);
        } else {
            alert('Failed to add to wishlist');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading product details...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
                    <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
                    <Link to="/" className="px-6 py-3 bg-gradient-to-r from-purple-600 to-gold-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                        Go to Homepage
                    </Link>
                </div>
            </div>
        );
    }

    const currentPrice = product.salePrice || product.price;
    const hasDiscount = product.salePrice && product.salePrice < product.price;
    const discountPercentage = hasDiscount ? Math.round((1 - product.salePrice / product.price) * 100) : 0;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Link to="/" className="hover:text-purple-600">Home</Link>
                        <span>/</span>
                        <Link to={`/products?category=${product.category}`} className="hover:text-purple-600">{product.category}</Link>
                        <span>/</span>
                        <span className="text-gray-900 font-semibold">{product.name}</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="relative bg-white rounded-xl shadow-lg overflow-hidden group">
                            <div className="aspect-square">
                                {product.images && product.images.length > 0 ? (
                                    <img
                                        src={getImageUrl(product.images[selectedImage])}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                                        No Image Available
                                    </div>
                                )}
                            </div>

                            {/* Navigation Arrows */}
                            {product.images && product.images.length > 1 && (
                                <>
                                    <button
                                        onClick={handlePrevImage}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                                    >
                                        <ChevronLeft className="w-6 h-6 text-gray-800" />
                                    </button>
                                    <button
                                        onClick={handleNextImage}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                                    >
                                        <ChevronRight className="w-6 h-6 text-gray-800" />
                                    </button>
                                </>
                            )}

                            {/* Badges */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                {hasDiscount && (
                                    <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                        {discountPercentage}% OFF
                                    </div>
                                )}
                                {product.featured && (
                                    <div className="bg-gold-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                                        <Star className="w-4 h-4 fill-current" />
                                        Featured
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Thumbnail Gallery */}
                        {product.images && product.images.length > 1 && (
                            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                                {product.images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index
                                                ? 'border-purple-600 ring-2 ring-purple-200'
                                                : 'border-gray-200 hover:border-purple-300'
                                            }`}
                                    >
                                        <img
                                            src={getImageUrl(image)}
                                            alt={`${product.name} ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Information */}
                    <div className="space-y-6">
                        {/* Category Badge */}
                        <div>
                            <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                                {product.category}
                            </span>
                        </div>

                        {/* Product Name */}
                        <h1 className="font-heading text-3xl md:text-4xl font-bold text-gray-900">
                            {product.name}
                        </h1>

                        {/* Rating (Placeholder) */}
                        <div className="flex items-center gap-2">
                            <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} className="w-5 h-5 fill-gold-500 text-gold-500" />
                                ))}
                            </div>
                            <span className="text-sm text-gray-600">(4.8 - 124 reviews)</span>
                        </div>

                        {/* Price */}
                        <div className="bg-gray-100 rounded-xl p-6">
                            <div className="flex items-baseline gap-3">
                                <span className="text-4xl font-bold text-gray-900">
                                    ₹{currentPrice.toLocaleString()}
                                </span>
                                {hasDiscount && (
                                    <>
                                        <span className="text-xl text-gray-500 line-through">
                                            ₹{product.price.toLocaleString()}
                                        </span>
                                        <span className="text-lg text-green-600 font-semibold">
                                            Save ₹{(product.price - product.salePrice).toLocaleString()}
                                        </span>
                                    </>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 mt-2">Inclusive of all taxes</p>
                        </div>

                        {/* Stock Status */}
                        <div className="flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            <span className={`font-semibold ${product.stock > 10 ? 'text-green-600' :
                                    product.stock > 0 ? 'text-yellow-600' :
                                        'text-red-600'
                                }`}>
                                {product.stock > 10 ? 'In Stock' :
                                    product.stock > 0 ? `Only ${product.stock} left in stock` :
                                        'Out of Stock'}
                            </span>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="font-semibold text-lg text-gray-900 mb-2">Description</h3>
                            <p className="text-gray-700 leading-relaxed">{product.description}</p>
                        </div>

                        {/* Product Details */}
                        <div className="border-t border-gray-200 pt-6 space-y-3">
                            <h3 className="font-semibold text-lg text-gray-900 mb-4">Product Details</h3>

                            {product.material && (
                                <div className="flex items-start gap-3">
                                    <span className="text-gray-600 font-medium w-32">Material:</span>
                                    <span className="text-gray-900">{product.material}</span>
                                </div>
                            )}

                            {product.dimensions && (
                                <div className="flex items-start gap-3">
                                    <span className="text-gray-600 font-medium w-32">Dimensions:</span>
                                    <span className="text-gray-900">{product.dimensions}</span>
                                </div>
                            )}

                            {product.colors && product.colors.length > 0 && (
                                <div className="flex items-start gap-3">
                                    <span className="text-gray-600 font-medium w-32">Colors:</span>
                                    <div className="flex flex-wrap gap-2">
                                        {product.colors.map((color, index) => (
                                            <span key={index} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                                                {color}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {product.tags && product.tags.length > 0 && (
                                <div className="flex items-start gap-3">
                                    <span className="text-gray-600 font-medium w-32">Tags:</span>
                                    <div className="flex flex-wrap gap-2">
                                        {product.tags.map((tag, index) => (
                                            <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Custom Fields */}
                            {product.customFields && Object.keys(product.customFields).length > 0 && (
                                Object.entries(product.customFields).map(([key, value]) => (
                                    <div key={key} className="flex items-start gap-3">
                                        <span className="text-gray-600 font-medium w-32 capitalize">{key}:</span>
                                        <span className="text-gray-900">{value}</span>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Quantity Selector */}
                        {product.stock > 0 && (
                            <div className="flex items-center gap-4">
                                <span className="font-semibold text-gray-900">Quantity:</span>
                                <div className="flex items-center border-2 border-gray-300 rounded-lg">
                                    <button
                                        onClick={() => handleQuantityChange(-1)}
                                        disabled={quantity <= 1}
                                        className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="px-6 py-2 font-semibold text-lg">{quantity}</span>
                                    <button
                                        onClick={() => handleQuantityChange(1)}
                                        disabled={quantity >= product.stock}
                                        className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-lg font-semibold text-lg transition-all ${product.stock === 0
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : addedToCart
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gradient-to-r from-purple-600 to-gold-500 text-white hover:shadow-lg'
                                    }`}
                            >
                                <ShoppingCart className="w-6 h-6" />
                                {product.stock === 0 ? 'Out of Stock' : addedToCart ? 'Added to Cart!' : 'Add to Cart'}
                            </button>

                            <button
                                onClick={handleAddToWishlist}
                                className={`p-4 border-2 rounded-lg transition-all ${addedToWishlist
                                        ? 'border-red-500 bg-red-50'
                                        : 'border-gray-300 hover:border-purple-600 hover:bg-purple-50'
                                    }`}
                            >
                                <Heart className={`w-6 h-6 ${addedToWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                            </button>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                            <div className="flex items-center gap-3">
                                <Truck className="w-6 h-6 text-purple-600" />
                                <div>
                                    <p className="font-semibold text-sm">Free Delivery</p>
                                    <p className="text-xs text-gray-600">On orders above ₹999</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Shield className="w-6 h-6 text-purple-600" />
                                <div>
                                    <p className="font-semibold text-sm">Secure Payment</p>
                                    <p className="text-xs text-gray-600">100% secure transactions</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Package className="w-6 h-6 text-purple-600" />
                                <div>
                                    <p className="font-semibold text-sm">Easy Returns</p>
                                    <p className="text-xs text-gray-600">7-day return policy</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
