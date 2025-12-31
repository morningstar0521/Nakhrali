import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { authAPI, setToken, setCurrentUser } from '../utils/api';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            setLoading(true);

            // Call login API
            const response = await authAPI.login({
                email: formData.email,
                password: formData.password
            });

            // Store token and user data
            setToken(response.token);
            setCurrentUser(response.user);

            // Show success message
            alert(`Welcome back, ${response.user.fullName}!`);

            // Check if there was a pending checkout
            const pendingCheckout = localStorage.getItem('pendingCheckout');
            const redirectPath = location.state?.from;

            // Redirect logic
            if (response.user.role === 'admin') {
                navigate('/admin');
            } else if (pendingCheckout === 'true' || redirectPath === '/checkout') {
                // Clear the pending checkout flag
                localStorage.removeItem('pendingCheckout');
                // Redirect to checkout page (cart is already preserved)
                navigate('/checkout');
            } else {
                navigate('/');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = () => {
        alert('Google Sign-In will be implemented with backend integration');
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Purple with Gold Accents */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-900 via-purple-700 to-purple-900 relative overflow-hidden">
                {/* Decorative Gold Patterns */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-64 h-64 border-4 border-gold-500 rounded-full"></div>
                    <div className="absolute bottom-20 right-20 w-48 h-48 border-4 border-gold-500 rounded-full"></div>
                    <div className="absolute top-1/2 left-1/4 w-32 h-32 border-4 border-gold-500 transform rotate-45"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center px-16 text-white">
                    <div className="mb-8">
                        <div className="w-20 h-1 bg-gold-500 mb-6"></div>
                        <h1 className="font-heading text-5xl font-bold mb-4">Welcome Back</h1>
                        <p className="text-2xl text-purple-200 mb-8">to Nakhrali Fashion</p>
                        <p className="text-lg text-purple-100 leading-relaxed">
                            Sign in to access your account and continue your journey with our exquisite handcrafted jewelry collections.
                        </p>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-6 mt-12">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gold-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl">💎</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">Exclusive Collections</h3>
                                <p className="text-purple-200 text-sm">Access members-only designs and limited editions</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gold-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl">🎁</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">Special Offers</h3>
                                <p className="text-purple-200 text-sm">Get personalized deals and birthday surprises</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gold-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl">📦</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">Order Tracking</h3>
                                <p className="text-purple-200 text-sm">Track your purchases and manage your wishlist</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - White Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <h2 className="font-heading text-4xl font-bold text-gray-900 mb-3">Sign In</h2>
                        <p className="text-gray-600">Enter your credentials to access your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-12 pr-14 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.rememberMe}
                                    onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">Remember me</span>
                            </label>
                            <a href="#" className="text-sm text-purple-600 hover:text-gold-600 font-semibold transition-colors">
                                Forgot password?
                            </a>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-purple-600 to-gold-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>

                        {/* Divider */}
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        {/* Google Sign In */}
                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 py-3.5 rounded-xl font-semibold hover:bg-gray-50 hover:border-purple-300 transition-all"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Sign in with Google
                        </button>
                    </form>

                    {/* Register Link */}
                    <p className="mt-8 text-center text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-purple-600 hover:text-gold-600 font-semibold transition-colors">
                            Create Account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
