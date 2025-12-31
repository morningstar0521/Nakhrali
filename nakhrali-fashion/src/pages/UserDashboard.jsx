import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Package, MapPin, Heart, LogOut, ShoppingBag, Edit2, Trash2, Plus, Check, Camera, Upload } from 'lucide-react';
import { isAuthenticated, logout } from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Avatar options using DiceBear API
const AVATAR_STYLES = [
    { name: 'Adventurer', style: 'adventurer' },
    { name: 'Avataaars', style: 'avataaars' },
    { name: 'Bottts', style: 'bottts' },
    { name: 'Fun Emoji', style: 'fun-emoji' },
    { name: 'Lorelei', style: 'lorelei' },
    { name: 'Micah', style: 'micah' },
    { name: 'Miniavs', style: 'miniavs' },
    { name: 'Personas', style: 'personas' }
];

const getAvatarUrl = (style, seed) => {
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
};

const UserDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [orders, setOrders] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [editingProfile, setEditingProfile] = useState(false);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [showAvatarSelector, setShowAvatarSelector] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    const [profileForm, setProfileForm] = useState({
        full_name: '',
        phone: '',
        profile_picture: ''
    });

    const [addressForm, setAddressForm] = useState({
        name: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        pincode: '',
        is_default: false
    });

    const [profileErrors, setProfileErrors] = useState({});
    const [addressErrors, setAddressErrors] = useState({});

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }
        fetchData();
    }, [navigate]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const [profileRes, ordersRes, addressesRes] = await Promise.all([
                fetch(`${API_URL}/user/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_URL}/user/orders`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_URL}/user/addresses`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            const profileData = await profileRes.json();
            const ordersData = await ordersRes.json();
            const addressesData = await addressesRes.json();

            if (profileData.success) {
                setProfile(profileData.user);
                setProfileForm({
                    full_name: profileData.user.full_name || '',
                    phone: profileData.user.phone || '',
                    profile_picture: profileData.user.profile_picture || ''
                });
            }

            if (ordersData.success) setOrders(ordersData.orders);
            if (addressesData.success) setAddresses(addressesData.addresses);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const validateProfileForm = () => {
        const errors = {};
        
        if (!profileForm.full_name?.trim()) {
            errors.full_name = 'Full name is required';
        } else if (profileForm.full_name.trim().length < 2) {
            errors.full_name = 'Full name must be at least 2 characters';
        }
        
        if (profileForm.phone && !/^[0-9]{10}$/.test(profileForm.phone)) {
            errors.phone = 'Phone must be 10 digits';
        }
        
        setProfileErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateAddressForm = () => {
        const errors = {};
        
        if (!addressForm.name?.trim()) {
            errors.name = 'Name is required';
        } else if (addressForm.name.trim().length < 2) {
            errors.name = 'Name must be at least 2 characters';
        }
        
        if (!addressForm.phone) {
            errors.phone = 'Phone number is required';
        } else if (!/^[0-9]{10}$/.test(addressForm.phone)) {
            errors.phone = 'Phone must be 10 digits';
        }
        
        if (!addressForm.address_line1?.trim()) {
            errors.address_line1 = 'Address line 1 is required';
        }
        
        if (!addressForm.city?.trim()) {
            errors.city = 'City is required';
        }
        
        if (!addressForm.state?.trim()) {
            errors.state = 'State is required';
        }
        
        if (!addressForm.pincode) {
            errors.pincode = 'Pincode is required';
        } else if (!/^[0-9]{6}$/.test(addressForm.pincode)) {
            errors.pincode = 'Pincode must be 6 digits';
        }
        
        setAddressErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        
        if (!validateProfileForm()) {
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/user/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileForm)
            });

            const data = await response.json();
            if (data.success) {
                setProfile(data.user);
                setEditingProfile(false);
                setShowAvatarSelector(false);
                alert('Profile updated successfully!');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        }
    };

    const handleAvatarSelect = (style) => {
        const seed = profile?.email || 'default';
        const avatarUrl = getAvatarUrl(style, seed);
        setProfileForm({...profileForm, profile_picture: avatarUrl});
        setShowAvatarSelector(false);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploadingImage(true);
            const formData = new FormData();
            formData.append('image', file);

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/user/upload-profile-picture`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                const imageUrl = `http://localhost:5001${data.image}`;
                setProfileForm({...profileForm, profile_picture: imageUrl});
            } else {
                alert('Failed to upload image');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image');
        } finally {
            setUploadingImage(false);
        }
    };

    const getProfileImage = () => {
        if (profileForm.profile_picture) {
            return profileForm.profile_picture;
        }
        if (profile?.profile_picture) {
            return profile.profile_picture;
        }
        // Default gradient avatar with initials
        return null;
    };

    const getInitials = () => {
        if (profile?.full_name) {
            return profile.full_name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
        }
        return profile?.email?.charAt(0).toUpperCase() || 'U';
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        
        if (!validateAddressForm()) {
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            const url = editingAddress 
                ? `${API_URL}/user/addresses/${editingAddress.id}`
                : `${API_URL}/user/addresses`;
            
            const response = await fetch(url, {
                method: editingAddress ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(addressForm)
            });

            const data = await response.json();
            if (data.success) {
                fetchData();
                setShowAddressForm(false);
                setEditingAddress(null);
                resetAddressForm();
                alert(editingAddress ? 'Address updated!' : 'Address added!');
            }
        } catch (error) {
            console.error('Error saving address:', error);
            alert('Failed to save address');
        }
    };

    const handleDeleteAddress = async (id) => {
        if (!confirm('Delete this address?')) return;
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/user/addresses/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (data.success) {
                fetchData();
                alert('Address deleted successfully!');
            }
        } catch (error) {
            console.error('Error deleting address:', error);
            alert('Failed to delete address');
        }
    };

    const resetAddressForm = () => {
        setAddressForm({
            name: '',
            phone: '',
            address_line1: '',
            address_line2: '',
            city: '',
            state: '',
            pincode: '',
            is_default: false
        });
        setAddressErrors({});
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-700',
            processing: 'bg-blue-100 text-blue-700',
            shipped: 'bg-purple-100 text-purple-700',
            delivered: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700'
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-gold-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-gold-50 py-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="font-heading text-4xl font-bold text-gray-900 mb-2">My Account</h1>
                    <p className="text-gray-600">Manage your profile, orders, and addresses</p>
                </div>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                            <div className="text-center mb-6 pb-6 border-b">
                                <div className="w-20 h-20 mx-auto mb-3">
                                    {profile?.profile_picture ? (
                                        <img
                                            src={profile.profile_picture}
                                            alt={profile.full_name}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-purple-600 to-gold-500 rounded-full flex items-center justify-center">
                                            <span className="text-white font-bold text-2xl">{getInitials()}</span>
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-semibold text-lg text-gray-900">{profile?.full_name || 'User'}</h3>
                                <p className="text-sm text-gray-600">{profile?.email}</p>
                            </div>

                            <nav className="space-y-2">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                        activeTab === 'profile' 
                                            ? 'bg-purple-100 text-purple-700' 
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <User className="w-5 h-5" />
                                    Profile
                                </button>
                                <button
                                    onClick={() => setActiveTab('orders')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                        activeTab === 'orders' 
                                            ? 'bg-purple-100 text-purple-700' 
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <Package className="w-5 h-5" />
                                    Orders
                                </button>
                                <button
                                    onClick={() => setActiveTab('addresses')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                        activeTab === 'addresses' 
                                            ? 'bg-purple-100 text-purple-700' 
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <MapPin className="w-5 h-5" />
                                    Addresses
                                </button>
                                <button
                                    onClick={() => navigate('/wishlist')}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    <Heart className="w-5 h-5" />
                                    Wishlist
                                </button>
                                <button
                                    onClick={() => {
                                        logout();
                                        navigate('/');
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Logout
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="bg-white rounded-2xl shadow-lg p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="font-heading text-2xl font-bold text-gray-900">Profile Information</h2>
                                    {!editingProfile && (
                                        <button
                                            onClick={() => setEditingProfile(true)}
                                            className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Edit
                                        </button>
                                    )}
                                </div>

                                {editingProfile ? (
                                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                                        {/* Profile Picture Section */}
                                        <div className="flex flex-col items-center gap-4 pb-6 border-b">
                                            <div className="relative w-32 h-32">
                                                {getProfileImage() ? (
                                                    <img
                                                        src={getProfileImage()}
                                                        alt="Profile"
                                                        className="w-full h-full rounded-full object-cover border-4 border-purple-200"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-purple-600 to-gold-500 rounded-full flex items-center justify-center border-4 border-purple-200">
                                                        <span className="text-white font-bold text-4xl">{getInitials()}</span>
                                                    </div>
                                                )}
                                                <label className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full cursor-pointer hover:bg-purple-700 transition-colors shadow-lg">
                                                    <Camera className="w-4 h-4" />
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageUpload}
                                                        className="hidden"
                                                        disabled={uploadingImage}
                                                    />
                                                </label>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                                                >
                                                    <User className="w-4 h-4" />
                                                    Choose Avatar
                                                </button>
                                                {profileForm.profile_picture && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setProfileForm({...profileForm, profile_picture: ''})}
                                                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                            {uploadingImage && (
                                                <p className="text-sm text-gray-600">Uploading...</p>
                                            )}
                                            
                                            {/* Avatar Selector */}
                                            {showAvatarSelector && (
                                                <div className="w-full bg-gray-50 rounded-lg p-4">
                                                    <p className="text-sm font-medium text-gray-700 mb-3">Select an avatar style:</p>
                                                    <div className="grid grid-cols-4 gap-3">
                                                        {AVATAR_STYLES.map((avatar) => (
                                                            <button
                                                                key={avatar.style}
                                                                type="button"
                                                                onClick={() => handleAvatarSelect(avatar.style)}
                                                                className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-purple-100 transition-colors"
                                                            >
                                                                <img
                                                                    src={getAvatarUrl(avatar.style, profile?.email || 'default')}
                                                                    alt={avatar.name}
                                                                    className="w-16 h-16 rounded-full"
                                                                />
                                                                <span className="text-xs text-gray-600">{avatar.name}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                            <input
                                                type="text"
                                                value={profileForm.full_name}
                                                onChange={(e) => {
                                                    setProfileForm({...profileForm, full_name: e.target.value});
                                                    if (profileErrors.full_name) setProfileErrors({...profileErrors, full_name: ''});
                                                }}
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                                    profileErrors.full_name ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                required
                                            />
                                            {profileErrors.full_name && (
                                                <p className="mt-1 text-sm text-red-600">{profileErrors.full_name}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                            <input
                                                type="tel"
                                                value={profileForm.phone}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                    setProfileForm({...profileForm, phone: value});
                                                    if (profileErrors.phone) setProfileErrors({...profileErrors, phone: ''});
                                                }}
                                                placeholder="10-digit mobile number"
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                                    profileErrors.phone ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            />
                                            {profileErrors.phone && (
                                                <p className="mt-1 text-sm text-red-600">{profileErrors.phone}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                            <input
                                                type="email"
                                                value={profile?.email}
                                                disabled
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-600"
                                            />
                                        </div>
                                        <div className="flex gap-4">
                                            <button
                                                type="submit"
                                                className="flex-1 bg-gradient-to-r from-purple-600 to-gold-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                                            >
                                                Save Changes
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingProfile(false);
                                                    setProfileErrors({});
                                                    setShowAvatarSelector(false);
                                                }}
                                                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Profile Picture Display */}
                                        <div className="flex justify-center pb-6 border-b">
                                            <div className="w-32 h-32">
                                                {profile?.profile_picture ? (
                                                    <img
                                                        src={profile.profile_picture}
                                                        alt={profile.full_name}
                                                        className="w-full h-full rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-purple-600 to-gold-500 rounded-full flex items-center justify-center">
                                                        <span className="text-white font-bold text-4xl">{getInitials()}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                                            <p className="text-lg text-gray-900">{profile?.full_name || 'Not set'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                                            <p className="text-lg text-gray-900">{profile?.phone || 'Not set'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                                            <p className="text-lg text-gray-900">{profile?.email}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Member Since</label>
                                            <p className="text-lg text-gray-900">
                                                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                }) : 'Not available'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Orders Tab */}
                        {activeTab === 'orders' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="font-heading text-2xl font-bold text-gray-900">My Orders</h2>
                                    <span className="text-sm text-gray-600">{orders.length} orders</span>
                                </div>

                                {orders.length === 0 ? (
                                    <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
                                        <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                                        <h3 className="font-heading text-2xl font-bold text-gray-900 mb-4">No Orders Yet</h3>
                                        <p className="text-gray-600 mb-8">Start shopping to see your orders here!</p>
                                        <button
                                            onClick={() => navigate('/')}
                                            className="bg-gradient-to-r from-purple-600 to-gold-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                                        >
                                            Start Shopping
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.map((order) => (
                                            <div key={order.id} className="bg-white rounded-2xl shadow-lg p-6">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <p className="text-sm text-gray-600">Order #{order.id}</p>
                                                        <p className="text-sm text-gray-600">
                                                            {new Date(order.created_at).toLocaleDateString('en-IN', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                    </span>
                                                </div>

                                                <div className="space-y-3 mb-4">
                                                    {order.items && Array.isArray(order.items) && order.items[0] !== null ? (
                                                        order.items.map((item, idx) => (
                                                            <div key={idx} className="flex items-center gap-4">
                                                                <img
                                                                    src={item.image || 'https://via.placeholder.com/60'}
                                                                    alt={item.product_name}
                                                                    className="w-16 h-16 object-cover rounded-lg"
                                                                />
                                                                <div className="flex-1">
                                                                    <p className="font-semibold text-gray-900">{item.product_name}</p>
                                                                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                                                </div>
                                                                <p className="font-semibold text-purple-600">
                                                                    ₹{(parseFloat(item.price) * parseInt(item.quantity)).toLocaleString()}
                                                                </p>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-sm text-gray-600">No items in this order</p>
                                                    )}
                                                </div>

                                                <div className="flex justify-between items-center pt-4 border-t">
                                                    <p className="text-lg font-bold text-gray-900">
                                                        Total: ₹{parseFloat(order.total_amount).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Addresses Tab */}
                        {activeTab === 'addresses' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="font-heading text-2xl font-bold text-gray-900">Saved Addresses</h2>
                                    <button
                                        onClick={() => {
                                            setShowAddressForm(true);
                                            setEditingAddress(null);
                                            resetAddressForm();
                                        }}
                                        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-gold-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Address
                                    </button>
                                </div>

                                {showAddressForm && (
                                    <div className="bg-white rounded-2xl shadow-lg p-6">
                                        <h3 className="font-semibold text-lg mb-4">
                                            {editingAddress ? 'Edit Address' : 'Add New Address'}
                                        </h3>
                                        <form onSubmit={handleSaveAddress} className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text"
                                                    value={addressForm.name}
                                                    onChange={(e) => {
                                                        setAddressForm({...addressForm, name: e.target.value});
                                                        if (addressErrors.name) setAddressErrors({...addressErrors, name: ''});
                                                    }}
                                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                                        addressErrors.name ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                    required
                                                />
                                                {addressErrors.name && (
                                                    <p className="mt-1 text-xs text-red-600">{addressErrors.name}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone <span className="text-red-500">*</span></label>
                                                <input
                                                    type="tel"
                                                    value={addressForm.phone}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                        setAddressForm({...addressForm, phone: value});
                                                        if (addressErrors.phone) setAddressErrors({...addressErrors, phone: ''});
                                                    }}
                                                    placeholder="10-digit number"
                                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                                        addressErrors.phone ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                    required
                                                />
                                                {addressErrors.phone && (
                                                    <p className="mt-1 text-xs text-red-600">{addressErrors.phone}</p>
                                                )}
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text"
                                                    value={addressForm.address_line1}
                                                    onChange={(e) => {
                                                        setAddressForm({...addressForm, address_line1: e.target.value});
                                                        if (addressErrors.address_line1) setAddressErrors({...addressErrors, address_line1: ''});
                                                    }}
                                                    placeholder="House/Flat/Building number, Street name"
                                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                                        addressErrors.address_line1 ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                    required
                                                />
                                                {addressErrors.address_line1 && (
                                                    <p className="mt-1 text-xs text-red-600">{addressErrors.address_line1}</p>
                                                )}
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                                                <input
                                                    type="text"
                                                    value={addressForm.address_line2}
                                                    onChange={(e) => setAddressForm({...addressForm, address_line2: e.target.value})}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">City <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text"
                                                    value={addressForm.city}
                                                    onChange={(e) => {
                                                        setAddressForm({...addressForm, city: e.target.value});
                                                        if (addressErrors.city) setAddressErrors({...addressErrors, city: ''});
                                                    }}
                                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                                        addressErrors.city ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                    required
                                                />
                                                {addressErrors.city && (
                                                    <p className="mt-1 text-xs text-red-600">{addressErrors.city}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">State <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text"
                                                    value={addressForm.state}
                                                    onChange={(e) => {
                                                        setAddressForm({...addressForm, state: e.target.value});
                                                        if (addressErrors.state) setAddressErrors({...addressErrors, state: ''});
                                                    }}
                                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                                        addressErrors.state ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                    required
                                                />
                                                {addressErrors.state && (
                                                    <p className="mt-1 text-xs text-red-600">{addressErrors.state}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text"
                                                    value={addressForm.pincode}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                                        setAddressForm({...addressForm, pincode: value});
                                                        if (addressErrors.pincode) setAddressErrors({...addressErrors, pincode: ''});
                                                    }}
                                                    placeholder="6-digit pincode"
                                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                                        addressErrors.pincode ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                    required
                                                />
                                                {addressErrors.pincode && (
                                                    <p className="mt-1 text-xs text-red-600">{addressErrors.pincode}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={addressForm.is_default}
                                                    onChange={(e) => setAddressForm({...addressForm, is_default: e.target.checked})}
                                                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                                />
                                                <label className="text-sm text-gray-700">Set as default address</label>
                                            </div>
                                            <div className="col-span-2 flex gap-4 mt-2">
                                                <button
                                                    type="submit"
                                                    className="flex-1 bg-gradient-to-r from-purple-600 to-gold-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
                                                >
                                                    Save Address
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowAddressForm(false);
                                                        setEditingAddress(null);
                                                        resetAddressForm();
                                                    }}
                                                    className="flex-1 bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                <div className="grid md:grid-cols-2 gap-4">
                                    {addresses.map((address) => (
                                        <div key={address.id} className="bg-white rounded-2xl shadow-lg p-6 relative">
                                            {address.is_default && (
                                                <div className="absolute top-4 right-4 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                                    <Check className="w-3 h-3" />
                                                    Default
                                                </div>
                                            )}
                                            <h3 className="font-semibold text-gray-900 mb-2">{address.name}</h3>
                                            <p className="text-sm text-gray-600 mb-1">{address.phone}</p>
                                            <p className="text-sm text-gray-600 mb-1">{address.address_line1}</p>
                                            {address.address_line2 && (
                                                <p className="text-sm text-gray-600 mb-1">{address.address_line2}</p>
                                            )}
                                            <p className="text-sm text-gray-600 mb-4">
                                                {address.city}, {address.state} - {address.pincode}
                                            </p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingAddress(address);
                                                        setAddressForm(address);
                                                        setShowAddressForm(true);
                                                    }}
                                                    className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteAddress(address.id)}
                                                    className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {addresses.length === 0 && !showAddressForm && (
                                    <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
                                        <MapPin className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                                        <h3 className="font-heading text-2xl font-bold text-gray-900 mb-4">No Addresses Saved</h3>
                                        <p className="text-gray-600 mb-8">Add an address for faster checkout!</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
