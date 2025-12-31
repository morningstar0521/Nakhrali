import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, MapPin, CreditCard, User, Phone, Mail, Home, ArrowLeft, Plus, Check } from 'lucide-react';
import { getCart, clearCart } from '../utils/cartUtils';
import { getCurrentUser } from '../utils/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Checkout = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        paymentMethod: 'cod',
        cardNumber: '',
        cardExpiry: '',
        cardCVV: ''
    });

    useEffect(() => {
        // Check if user is logged in
        const currentUser = getCurrentUser();
        if (!currentUser) {
            // Save current cart and redirect to login
            const cart = getCart();
            if (cart.length > 0) {
                localStorage.setItem('pendingCheckout', 'true');
            }
            navigate('/login', { state: { from: '/checkout' } });
            return;
        }

        setUser(currentUser);
        loadCart();
        fetchSavedAddresses();

        // Pre-fill user data
        setFormData(prev => ({
            ...prev,
            fullName: currentUser.fullName || '',
            email: currentUser.email || '',
            phone: currentUser.phone || ''
        }));
    }, [navigate]);

    const fetchSavedAddresses = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/user/addresses`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success && data.addresses) {
                setSavedAddresses(data.addresses);
                
                // Auto-select default address if exists
                const defaultAddress = data.addresses.find(addr => addr.is_default);
                if (defaultAddress) {
                    handleSelectAddress(defaultAddress);
                }
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
        }
    };

    const loadCart = () => {
        const items = getCart();
        if (items.length === 0) {
            navigate('/cart');
            return;
        }
        setCartItems(items);
    };

    const handleSelectAddress = (address) => {
        setSelectedAddressId(address.id);
        setShowNewAddressForm(false);
        setFormData(prev => ({
            ...prev,
            fullName: address.name,
            phone: address.phone,
            address: address.address_line1 + (address.address_line2 ? ', ' + address.address_line2 : ''),
            city: address.city,
            state: address.state,
            pincode: address.pincode
        }));
    };

    const handleAddNewAddress = () => {
        setSelectedAddressId(null);
        setShowNewAddressForm(true);
        // Reset address fields but keep user info
        setFormData(prev => ({
            ...prev,
            address: '',
            city: '',
            state: '',
            pincode: ''
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 5000 ? 0 : 200;
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + shipping + tax;

    const validateForm = () => {
        // If using saved address, basic validation
        if (selectedAddressId && !showNewAddressForm) {
            return true;
        }

        // If adding new address, full validation
        if (!formData.fullName || !formData.email || !formData.phone || 
            !formData.address || !formData.city || !formData.state || !formData.pincode) {
            alert('Please fill in all required fields');
            return false;
        }

        // Validate phone number (10 digits)
        if (!/^\d{10}$/.test(formData.phone)) {
            alert('Please enter a valid 10-digit phone number');
            return false;
        }

        // Validate pincode (6 digits)
        if (!/^\d{6}$/.test(formData.pincode)) {
            alert('Please enter a valid 6-digit pincode');
            return false;
        }

        // Validate email
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            alert('Please enter a valid email address');
            return false;
        }

        // If payment method is card, validate card details
        if (formData.paymentMethod === 'card') {
            if (!formData.cardNumber || !formData.cardExpiry || !formData.cardCVV) {
                alert('Please enter all card details');
                return false;
            }
            if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
                alert('Please enter a valid 16-digit card number');
                return false;
            }
        }

        return true;
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);

            const token = localStorage.getItem('token');

            // Prepare order data for backend
            const orderData = {
                items: cartItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    image: item.image
                })),
                shipping_address: {
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode
                },
                billing_address: {
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode
                },
                total_amount: total,
                shipping_cost: shipping,
                tax_amount: tax,
                payment_method: formData.paymentMethod
            };

            // Send order to backend API
            const response = await fetch(`${API_URL}/user/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to place order');
            }

            // Clear cart
            clearCart();

            // Clear pending checkout flag
            localStorage.removeItem('pendingCheckout');

            // Show success message and redirect
            alert(`Order placed successfully! Order ID: #${data.order.id}\n\nThank you for your purchase!`);
            navigate('/dashboard');

        } catch (error) {
            console.error('Error placing order:', error);
            alert(error.message || 'Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!user || cartItems.length === 0) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-gold-50 py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/cart')}
                        className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Cart
                    </button>
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="w-10 h-10 text-purple-600" />
                        <h1 className="font-heading text-4xl font-bold text-gray-900">Checkout</h1>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Checkout Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handlePlaceOrder} className="space-y-6">
                            {/* Contact Information */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <User className="w-6 h-6 text-purple-600" />
                                    <h2 className="font-heading text-2xl font-bold text-gray-900">Contact Information</h2>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="10-digit number"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-gray-700 font-semibold mb-2">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <MapPin className="w-6 h-6 text-purple-600" />
                                        <h2 className="font-heading text-2xl font-bold text-gray-900">Shipping Address</h2>
                                    </div>
                                </div>

                                {/* Saved Addresses */}
                                {savedAddresses.length > 0 && !showNewAddressForm && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Saved Addresses</h3>
                                        <div className="space-y-3">
                                            {savedAddresses.map((address) => (
                                                <div
                                                    key={address.id}
                                                    onClick={() => handleSelectAddress(address)}
                                                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                        selectedAddressId === address.id
                                                            ? 'border-purple-500 bg-purple-50'
                                                            : 'border-gray-200 hover:border-purple-300'
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="font-semibold text-gray-900">{address.name}</span>
                                                                {address.is_default && (
                                                                    <span className="px-2 py-1 bg-gold-100 text-gold-700 text-xs font-semibold rounded">
                                                                        Default
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-gray-700 mb-1">
                                                                {address.address_line1}
                                                                {address.address_line2 && `, ${address.address_line2}`}
                                                            </p>
                                                            <p className="text-gray-700 mb-1">
                                                                {address.city}, {address.state} - {address.pincode}
                                                            </p>
                                                            <p className="text-gray-600 text-sm">Phone: {address.phone}</p>
                                                        </div>
                                                        {selectedAddressId === address.id && (
                                                            <div className="ml-4">
                                                                <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                                                                    <Check className="w-4 h-4 text-white" />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Add New Address Button */}
                                        <button
                                            type="button"
                                            onClick={handleAddNewAddress}
                                            className="mt-4 w-full py-3 border-2 border-dashed border-purple-300 rounded-lg text-purple-600 font-semibold hover:border-purple-500 hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Plus className="w-5 h-5" />
                                            Add New Address
                                        </button>
                                    </div>
                                )}

                                {/* New Address Form */}
                                {(savedAddresses.length === 0 || showNewAddressForm) && (
                                    <div>
                                        {savedAddresses.length > 0 && (
                                            <div className="mb-4 flex items-center justify-between">
                                                <h3 className="text-lg font-semibold text-gray-900">New Address</h3>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowNewAddressForm(false);
                                                        if (savedAddresses.length > 0) {
                                                            handleSelectAddress(savedAddresses[0]);
                                                        }
                                                    }}
                                                    className="text-purple-600 hover:text-purple-700 font-semibold text-sm"
                                                >
                                                    Use Saved Address
                                                </button>
                                            </div>
                                        )}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">
                                                    Address *
                                                </label>
                                                <textarea
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    rows="3"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                                                    placeholder="House No., Street, Area"
                                                    required
                                                />
                                            </div>
                                            <div className="grid md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-gray-700 font-semibold mb-2">
                                                        City *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="city"
                                                        value={formData.city}
                                                        onChange={handleInputChange}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-gray-700 font-semibold mb-2">
                                                        State *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="state"
                                                        value={formData.state}
                                                        onChange={handleInputChange}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-gray-700 font-semibold mb-2">
                                                        Pincode *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="pincode"
                                                        value={formData.pincode}
                                                        onChange={handleInputChange}
                                                        placeholder="6-digit code"
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <CreditCard className="w-6 h-6 text-purple-600" />
                                    <h2 className="font-heading text-2xl font-bold text-gray-900">Payment Method</h2>
                                </div>

                                <div className="space-y-4">
                                    {/* Payment Options */}
                                    <div className="space-y-3">
                                        <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="cod"
                                                checked={formData.paymentMethod === 'cod'}
                                                onChange={handleInputChange}
                                                className="w-5 h-5 text-purple-600"
                                            />
                                            <div className="ml-4">
                                                <span className="font-semibold text-gray-900">Cash on Delivery</span>
                                                <p className="text-sm text-gray-600">Pay when you receive</p>
                                            </div>
                                        </label>

                                        <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="card"
                                                checked={formData.paymentMethod === 'card'}
                                                onChange={handleInputChange}
                                                className="w-5 h-5 text-purple-600"
                                            />
                                            <div className="ml-4">
                                                <span className="font-semibold text-gray-900">Credit/Debit Card</span>
                                                <p className="text-sm text-gray-600">Pay securely with your card</p>
                                            </div>
                                        </label>

                                        <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="upi"
                                                checked={formData.paymentMethod === 'upi'}
                                                onChange={handleInputChange}
                                                className="w-5 h-5 text-purple-600"
                                            />
                                            <div className="ml-4">
                                                <span className="font-semibold text-gray-900">UPI</span>
                                                <p className="text-sm text-gray-600">Google Pay, PhonePe, Paytm</p>
                                            </div>
                                        </label>
                                    </div>

                                    {/* Card Details (shown only if card is selected) */}
                                    {formData.paymentMethod === 'card' && (
                                        <div className="pt-4 space-y-4 border-t">
                                            <div>
                                                <label className="block text-gray-700 font-semibold mb-2">
                                                    Card Number *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="cardNumber"
                                                    value={formData.cardNumber}
                                                    onChange={handleInputChange}
                                                    placeholder="1234 5678 9012 3456"
                                                    maxLength="19"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-gray-700 font-semibold mb-2">
                                                        Expiry Date *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="cardExpiry"
                                                        value={formData.cardExpiry}
                                                        onChange={handleInputChange}
                                                        placeholder="MM/YY"
                                                        maxLength="5"
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-gray-700 font-semibold mb-2">
                                                        CVV *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="cardCVV"
                                                        value={formData.cardCVV}
                                                        onChange={handleInputChange}
                                                        placeholder="123"
                                                        maxLength="3"
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                            <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

                            {/* Cart Items Preview */}
                            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-3 pb-4 border-b">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-16 h-16 object-cover rounded-lg"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 text-sm mb-1">
                                                {item.name}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                Qty: {item.quantity} × ₹{item.price.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pricing */}
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

                                <div className="border-t pt-4">
                                    <div className="flex justify-between text-xl font-bold text-gray-900">
                                        <span>Total</span>
                                        <span>₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-purple-600 to-gold-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Processing...
                                    </span>
                                ) : (
                                    'Place Order'
                                )}
                            </button>

                            <p className="text-xs text-gray-500 text-center mt-4">
                                By placing this order, you agree to our terms and conditions
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
