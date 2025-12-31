import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { getCart, removeFromCart, updateCartQuantity, clearCart } from '../utils/cartUtils';
import { getCurrentUser } from '../utils/api';

const Cart = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = () => {
        const items = getCart();
        setCartItems(items);
    };

    const updateQuantity = (id, change) => {
        const item = cartItems.find(item => item.id === id);
        if (item) {
            const newQuantity = Math.max(1, item.quantity + change);
            updateCartQuantity(id, newQuantity);
            loadCart();
        }
    };

    const removeItem = (id) => {
        removeFromCart(id);
        loadCart();
    };

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 5000 ? 0 : 200;
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + shipping + tax;

    const handleCheckout = () => {
        const user = getCurrentUser();
        
        if (!user) {
            // Show warning message
            const proceed = window.confirm(
                '⚠️ Login Required!\n\n' +
                'You need to login to proceed with checkout.\n' +
                'Don\'t worry - your cart items will be saved!\n\n' +
                'Click OK to go to login page.'
            );
            
            if (proceed) {
                // Save pending checkout flag and redirect to login
                localStorage.setItem('pendingCheckout', 'true');
                navigate('/login', { state: { from: '/checkout' } });
            }
        } else {
            // User is logged in, proceed to checkout
            navigate('/checkout');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-gold-50 py-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <ShoppingBag className="w-10 h-10 text-purple-600" />
                        <h1 className="font-heading text-4xl font-bold text-gray-900">Shopping Cart</h1>
                    </div>
                    <p className="text-gray-600 text-lg">
                        {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
                    </p>
                </div>

                {cartItems.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
                        <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                        <h2 className="font-heading text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
                        <p className="text-gray-600 mb-8">Add some beautiful jewelry to your cart!</p>
                        <a
                            href="/"
                            className="inline-block bg-gradient-to-r from-purple-600 to-gold-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                        >
                            Start Shopping
                        </a>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item) => (
                                <div key={item.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                    <div className="flex flex-col sm:flex-row">
                                        {/* Image */}
                                        <div className="sm:w-48 h-48">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="font-heading text-xl font-bold text-gray-900 mb-2">
                                                        {item.name}
                                                    </h3>
                                                    {item.customHamper && item.hamperDetails && (
                                                        <div className="text-sm text-gray-600 mb-2">
                                                            <p className="font-semibold text-purple-600 mb-1">Custom Hamper Details:</p>
                                                            <ul className="space-y-0.5 ml-2">
                                                                {item.hamperDetails.products.map((p, idx) => (
                                                                    <li key={idx}>• {p.name} (x{p.quantity})</li>
                                                                ))}
                                                                {item.hamperDetails.box && (
                                                                    <li className="text-purple-500">• Gift Box: {item.hamperDetails.box.name}</li>
                                                                )}
                                                            </ul>
                                                        </div>
                                                    )}
                                                    <p className="text-2xl font-bold text-purple-600">
                                                        ₹{item.price.toLocaleString()}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-red-500 hover:text-red-700 transition-colors"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>

                                            {/* Quantity Controls - Hide for custom hampers */}
                                            {!item.customHamper && (
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm font-semibold text-gray-700">Quantity:</span>
                                                    <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, -1)}
                                                            className="w-8 h-8 flex items-center justify-center bg-white rounded-md hover:bg-purple-100 transition-colors"
                                                        >
                                                            <Minus className="w-4 h-4" />
                                                        </button>
                                                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, 1)}
                                                            className="w-8 h-8 flex items-center justify-center bg-white rounded-md hover:bg-purple-100 transition-colors"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <span className="ml-auto text-lg font-bold text-gray-900">
                                                        ₹{(item.price * item.quantity).toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            {item.customHamper && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                                                        Custom Hamper (Qty: {item.quantity})
                                                    </span>
                                                    <span className="text-lg font-bold text-gray-900">
                                                        ₹{(item.price * item.quantity).toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                                <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-gray-700">
                                        <span>Subtotal</span>
                                        <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-700">
                                        <span>Shipping</span>
                                        <span className="font-semibold">
                                            {shipping === 0 ? (
                                                <span className="text-green-600">FREE</span>
                                            ) : (
                                                `₹${shipping}`
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-gray-700">
                                        <span>Tax (GST 18%)</span>
                                        <span className="font-semibold">₹{tax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                    </div>

                                    {subtotal < 5000 && (
                                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm text-purple-700">
                                            Add ₹{(5000 - subtotal).toLocaleString()} more for FREE shipping!
                                        </div>
                                    )}

                                    <div className="border-t pt-4">
                                        <div className="flex justify-between text-xl font-bold text-gray-900">
                                            <span>Total</span>
                                            <span>₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={handleCheckout}
                                    className="w-full bg-gradient-to-r from-purple-600 to-gold-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    Proceed to Checkout
                                    <ArrowRight className="w-5 h-5" />
                                </button>

                                <a
                                    href="/"
                                    className="block text-center mt-4 text-purple-600 hover:text-gold-600 font-semibold transition-colors"
                                >
                                    Continue Shopping
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
