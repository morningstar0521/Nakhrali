import React, { useState, useEffect } from 'react';
import { Package, Eye, Check, X, Truck, ChevronDown, ChevronUp, Search } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            console.log('Fetching admin orders with token:', token ? 'Token exists' : 'No token');
            
            const response = await fetch(`${API_URL}/admin/orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            console.log('Admin orders response status:', response.status);
            const data = await response.json();
            console.log('Admin orders data:', data);
            
            if (data.success) {
                setOrders(data.orders || []);
                console.log('Orders set:', data.orders?.length || 0);
            } else {
                console.error('Failed to fetch orders:', data.message);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/admin/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await response.json();
            if (data.success) {
                fetchOrders();
                alert('Order status updated successfully!');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Failed to update order status');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
            processing: 'bg-blue-100 text-blue-700 border-blue-300',
            shipped: 'bg-purple-100 text-purple-700 border-purple-300',
            delivered: 'bg-green-100 text-green-700 border-green-300',
            cancelled: 'bg-red-100 text-red-700 border-red-300'
        };
        return colors[status] || 'bg-gray-100 text-gray-700 border-gray-300';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return '⏳';
            case 'processing':
                return '⚙️';
            case 'shipped':
                return '📦';
            case 'delivered':
                return '✅';
            case 'cancelled':
                return '❌';
            default:
                return '📋';
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        const matchesSearch = !searchQuery || 
            order.id.toString().includes(searchQuery) ||
            JSON.stringify(order.shipping_address).toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Package className="w-8 h-8 text-purple-600" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
                        <p className="text-gray-600">{orders.length} total orders</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-4">
                <div className="grid md:grid-cols-2 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by Order ID or Customer..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                    >
                        <option value="all">All Orders</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No orders found</p>
                    </div>
                ) : (
                    filteredOrders.map((order) => (
                        <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            {/* Order Header */}
                            <div className="p-6 border-b">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <span className="text-2xl">{getStatusIcon(order.status)}</span>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">
                                                Order #{order.id}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {formatDate(order.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-purple-600">
                                            ₹{parseFloat(order.total_amount).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Customer</p>
                                        <p className="font-semibold">{order.shipping_address?.fullName || 'N/A'}</p>
                                        <p className="text-sm text-gray-600">{order.shipping_address?.phone || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Shipping Address</p>
                                        <p className="font-semibold">
                                            {order.shipping_address?.city || 'N/A'}, {order.shipping_address?.state || 'N/A'}
                                        </p>
                                        <p className="text-sm text-gray-600">PIN: {order.shipping_address?.pincode || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">Status</p>
                                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(order.status)}`}>
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <button
                                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                        className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2"
                                    >
                                        <Eye className="w-4 h-4" />
                                        {expandedOrder === order.id ? 'Hide Details' : 'View Details'}
                                        {expandedOrder === order.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </button>

                                    {order.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => updateOrderStatus(order.id, 'processing')}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                            >
                                                <Check className="w-4 h-4" />
                                                Mark Processing
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to cancel this order?')) {
                                                        updateOrderStatus(order.id, 'cancelled');
                                                    }
                                                }}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                                            >
                                                <X className="w-4 h-4" />
                                                Cancel Order
                                            </button>
                                        </>
                                    )}

                                    {order.status === 'processing' && (
                                        <button
                                            onClick={() => updateOrderStatus(order.id, 'shipped')}
                                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                                        >
                                            <Truck className="w-4 h-4" />
                                            Mark Shipped
                                        </button>
                                    )}

                                    {order.status === 'shipped' && (
                                        <button
                                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                        >
                                            <Check className="w-4 h-4" />
                                            Mark Delivered
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Expanded Order Details */}
                            {expandedOrder === order.id && (
                                <div className="p-6 bg-gray-50">
                                    <h4 className="font-semibold text-lg mb-4">Order Items</h4>
                                    <div className="space-y-3">
                                        {order.items && Array.isArray(order.items) && order.items[0] !== null ? (
                                            order.items.map((item, index) => (
                                                <div key={index} className="flex items-center gap-4 bg-white p-4 rounded-lg">
                                                    <img
                                                        src={item.image || 'https://via.placeholder.com/80'}
                                                        alt={item.product_name}
                                                        className="w-20 h-20 object-cover rounded-lg"
                                                    />
                                                    <div className="flex-1">
                                                        <h5 className="font-semibold text-gray-900">{item.product_name}</h5>
                                                        <p className="text-sm text-gray-600">
                                                            Quantity: {item.quantity} × ₹{parseFloat(item.price).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-purple-600">
                                                            ₹{(item.quantity * parseFloat(item.price)).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 text-center py-4">No items in this order</p>
                                        )}
                                    </div>

                                    {/* Order Summary */}
                                    <div className="mt-6 bg-white p-4 rounded-lg">
                                        <h4 className="font-semibold text-lg mb-3">Order Summary</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-gray-700">
                                                <span>Subtotal</span>
                                                <span>₹{(parseFloat(order.total_amount) - parseFloat(order.shipping_cost || 0) - parseFloat(order.tax_amount || 0)).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-700">
                                                <span>Shipping</span>
                                                <span>₹{parseFloat(order.shipping_cost || 0).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-700">
                                                <span>Tax</span>
                                                <span>₹{parseFloat(order.tax_amount || 0).toLocaleString()}</span>
                                            </div>
                                            <div className="border-t pt-2 flex justify-between text-lg font-bold">
                                                <span>Total</span>
                                                <span className="text-purple-600">₹{parseFloat(order.total_amount).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Full Shipping Address */}
                                    <div className="mt-4 bg-white p-4 rounded-lg">
                                        <h4 className="font-semibold text-lg mb-3">Shipping Details</h4>
                                        <div className="text-gray-700">
                                            <p className="font-semibold">{order.shipping_address?.fullName}</p>
                                            <p>{order.shipping_address?.address}</p>
                                            <p>{order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.pincode}</p>
                                            <p className="mt-2">Phone: {order.shipping_address?.phone}</p>
                                            <p>Email: {order.shipping_address?.email}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default OrderManagement;
