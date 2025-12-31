import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Package, Image, DollarSign, ShoppingBag, TrendingUp } from 'lucide-react';
import MetricsCard from '../components/admin/MetricsCard';
import ProductManagement from '../components/admin/ProductManagement';
import BannerManagement from '../components/admin/BannerManagement';
import OccasionManagement from '../components/admin/OccasionManagement';
import BoxManagement from '../components/admin/BoxManagement';
import HamperManagement from '../components/admin/HamperManagement';
import OrderManagement from '../components/admin/OrderManagement';
import { adminAPI } from '../utils/api';
import { isAdmin, logout } from '../utils/auth';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is admin
        if (!isAdmin()) {
            navigate('/login');
            return;
        }

        // Fetch metrics
        fetchMetrics();
    }, [navigate]);

    const fetchMetrics = async () => {
        try {
            setLoading(true);
            const data = await adminAPI.getMetrics();
            setMetrics(data.metrics);
        } catch (error) {
            console.error('Error fetching metrics:', error);
            if (error.message.includes('authorized')) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-gold-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-gold-50 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="font-heading text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
                    <p className="text-gray-600">Manage your e-commerce platform</p>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-md mb-8">
                    <div className="flex border-b overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-6 py-4 font-semibold transition-colors ${activeTab === 'overview'
                                ? 'text-purple-600 border-b-2 border-purple-600'
                                : 'text-gray-600 hover:text-purple-600'
                                }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`px-6 py-4 font-semibold transition-colors ${activeTab === 'products'
                                ? 'text-purple-600 border-b-2 border-purple-600'
                                : 'text-gray-600 hover:text-purple-600'
                                }`}
                        >
                            Products
                        </button>
                        <button
                            onClick={() => setActiveTab('banners')}
                            className={`px-6 py-4 font-semibold transition-colors ${activeTab === 'banners'
                                ? 'text-purple-600 border-b-2 border-purple-600'
                                : 'text-gray-600 hover:text-purple-600'
                                }`}
                        >
                            Hero Banners
                        </button>
                        <button
                            onClick={() => setActiveTab('occasions')}
                            className={`px-6 py-4 font-semibold transition-colors ${activeTab === 'occasions'
                                ? 'text-purple-600 border-b-2 border-purple-600'
                                : 'text-gray-600 hover:text-purple-600'
                                }`}
                        >
                            Occasions
                        </button>
                        <button
                            onClick={() => setActiveTab('boxes')}
                            className={`px-6 py-4 font-semibold transition-colors ${activeTab === 'boxes'
                                ? 'text-purple-600 border-b-2 border-purple-600'
                                : 'text-gray-600 hover:text-purple-600'
                                }`}
                        >
                            Gift Boxes
                        </button>
                        <button
                            onClick={() => setActiveTab('hampers')}
                            className={`px-6 py-4 font-semibold transition-colors ${activeTab === 'hampers'
                                ? 'text-purple-600 border-b-2 border-purple-600'
                                : 'text-gray-600 hover:text-purple-600'
                                }`}
                        >
                            Hampers
                        </button>
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`px-6 py-4 font-semibold transition-colors ${activeTab === 'orders'
                                ? 'text-purple-600 border-b-2 border-purple-600'
                                : 'text-gray-600 hover:text-purple-600'
                                }`}
                        >
                            Orders
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && metrics && (
                    <div>
                        {/* Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <MetricsCard
                                title="Total Users"
                                value={metrics.totalUsers}
                                icon={<Users className="w-6 h-6" />}
                                color="purple"
                            />
                            <MetricsCard
                                title="Total Products"
                                value={metrics.totalProducts}
                                icon={<Package className="w-6 h-6" />}
                                color="blue"
                            />
                            <MetricsCard
                                title="Active Banners"
                                value={`${metrics.activeBanners}/${metrics.totalBanners}`}
                                icon={<Image className="w-6 h-6" />}
                                color="gold"
                            />
                            <MetricsCard
                                title="Total Revenue"
                                value={`₹${metrics.totalRevenue.toLocaleString()}`}
                                icon={<DollarSign className="w-6 h-6" />}
                                color="green"
                                subtitle="Coming soon"
                            />
                        </div>

                        {/* Recent Activity */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recent Users */}
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h3 className="font-heading text-xl font-bold text-gray-900 mb-4">Recent Users</h3>
                                <div className="space-y-3">
                                    {metrics.recentUsers && metrics.recentUsers.length > 0 ? (
                                        metrics.recentUsers.map((user) => (
                                            <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-semibold text-gray-900">{user.fullName}</p>
                                                    <p className="text-sm text-gray-600">{user.email}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center py-4">No users yet</p>
                                    )}
                                </div>
                            </div>

                            {/* Low Stock Products */}
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h3 className="font-heading text-xl font-bold text-gray-900 mb-4">Low Stock Alert</h3>
                                <div className="space-y-3">
                                    {metrics.lowStockProducts && metrics.lowStockProducts.length > 0 ? (
                                        metrics.lowStockProducts.map((product) => (
                                            <div key={product._id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                                <div>
                                                    <p className="font-semibold text-gray-900">{product.name}</p>
                                                    <p className="text-sm text-gray-600">{product.category}</p>
                                                </div>
                                                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                                                    {product.stock} left
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center py-4">All products well stocked!</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'products' && <ProductManagement />}
                {activeTab === 'banners' && <BannerManagement />}
                {activeTab === 'occasions' && <OccasionManagement />}
                {activeTab === 'boxes' && <BoxManagement />}
                {activeTab === 'hampers' && <HamperManagement />}
                {activeTab === 'orders' && <OrderManagement />}
                {activeTab === 'hampers' && <HamperManagement />}
            </div>
        </div>
    );
};

export default AdminDashboard;
