import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff, Calendar } from 'lucide-react';
import { authAPI, setToken, setCurrentUser } from '../utils/api';

const Register = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        gender: '',
        dateOfBirth: '',
        newsletter: true,
        whatsapp: false,
        terms: false
    });

    // Validation functions
    const validateFullName = (name) => {
        if (!name || name.trim().length < 2) {
            return 'Full name must be at least 2 characters';
        }
        if (name.trim().length > 100) {
            return 'Full name must be less than 100 characters';
        }
        if (!/^[a-zA-Z\s]+$/.test(name)) {
            return 'Full name can only contain letters and spaces';
        }
        return null;
    };

    const validateEmail = (email) => {
        if (!email) {
            return 'Email is required';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return 'Please enter a valid email address';
        }
        return null;
    };

    const validatePhone = (phone) => {
        if (!phone) {
            return 'Phone number is required';
        }
        const digitsOnly = phone.replace(/\D/g, '');
        if (digitsOnly.length !== 10) {
            return 'Phone number must be exactly 10 digits';
        }
        if (!/^[6-9]/.test(digitsOnly)) {
            return 'Phone number must start with 6, 7, 8, or 9';
        }
        return null;
    };

    const validatePassword = (password) => {
        if (!password) {
            return 'Password is required';
        }
        if (password.length < 8) {
            return 'Password must be at least 8 characters';
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            return 'Password must contain uppercase, lowercase, and number';
        }
        return null;
    };

    const validateConfirmPassword = (confirmPassword, password) => {
        if (!confirmPassword) {
            return 'Please confirm your password';
        }
        if (confirmPassword !== password) {
            return 'Passwords do not match';
        }
        return null;
    };

    const validateForm = () => {
        const errors = {};
        
        const nameError = validateFullName(formData.fullName);
        if (nameError) errors.fullName = nameError;
        
        const emailError = validateEmail(formData.email);
        if (emailError) errors.email = emailError;
        
        const phoneError = validatePhone(formData.phone);
        if (phoneError) errors.phone = phoneError;
        
        const passwordError = validatePassword(formData.password);
        if (passwordError) errors.password = passwordError;
        
        const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password);
        if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;
        
        if (!formData.terms) {
            errors.terms = 'You must accept the terms and conditions';
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
        
        // Clear validation error for this field when user types
        if (validationErrors[field]) {
            setValidationErrors({ ...validationErrors, [field]: null });
        }
        
        // Clear general error
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setValidationErrors({});

        // Validate all fields
        if (!validateForm()) {
            setError('Please fix the errors below');
            return;
        }

        try {
            setLoading(true);

            // Prepare data for API
            const userData = {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                gender: formData.gender,
                dateOfBirth: formData.dateOfBirth || undefined,
                newsletter: formData.newsletter,
                whatsapp: formData.whatsapp
            };

            // Call register API
            const response = await authAPI.register(userData);

            // Store token and user data
            setToken(response.token);
            setCurrentUser(response.user);

            // Show success message
            alert('Registration successful! Welcome to Nakhrali Fashion!');

            // Redirect to homepage
            navigate('/');
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = () => {
        alert('Google Sign-Up will be implemented with backend integration');
    };

    const getPasswordStrength = (password) => {
        if (password.length === 0) return { strength: 0, label: '', color: '' };
        
        let strength = 0;
        let label = 'Very Weak';
        let color = 'bg-red-500';
        
        // Check length
        if (password.length >= 8) strength += 25;
        if (password.length >= 12) strength += 15;
        
        // Check for lowercase
        if (/[a-z]/.test(password)) strength += 20;
        
        // Check for uppercase
        if (/[A-Z]/.test(password)) strength += 20;
        
        // Check for numbers
        if (/\d/.test(password)) strength += 20;
        
        if (strength < 40) {
            label = 'Weak';
            color = 'bg-red-500';
        } else if (strength < 65) {
            label = 'Fair';
            color = 'bg-yellow-500';
        } else if (strength < 85) {
            label = 'Good';
            color = 'bg-blue-500';
        } else {
            label = 'Strong';
            color = 'bg-green-500';
        }
        
        return { strength, label, color };
    };

    const passwordStrength = getPasswordStrength(formData.password);

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Purple with Gold Accents */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-900 via-purple-700 to-purple-900 relative overflow-hidden">
                {/* Decorative Gold Patterns */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 right-20 w-64 h-64 border-4 border-gold-500 rounded-full"></div>
                    <div className="absolute bottom-20 left-20 w-48 h-48 border-4 border-gold-500 rounded-full"></div>
                    <div className="absolute top-1/3 right-1/4 w-32 h-32 border-4 border-gold-500 transform rotate-45"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center px-16 text-white">
                    <div className="mb-8">
                        <div className="w-20 h-1 bg-gold-500 mb-6"></div>
                        <h1 className="font-heading text-5xl font-bold mb-4">Join Us Today</h1>
                        <p className="text-2xl text-purple-200 mb-8">Nakhrali Fashion</p>
                        <p className="text-lg text-purple-100 leading-relaxed">
                            Create your account and unlock a world of exquisite handcrafted jewelry, exclusive offers, and personalized shopping experience.
                        </p>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-6 mt-12">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gold-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl">✨</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">Exclusive Member Benefits</h3>
                                <p className="text-purple-200 text-sm">Early access to new collections and special sales</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gold-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl">🎂</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">Birthday Surprises</h3>
                                <p className="text-purple-200 text-sm">Special discounts and gifts on your birthday</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gold-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl">💝</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">Personalized Experience</h3>
                                <p className="text-purple-200 text-sm">Curated recommendations based on your style</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - White Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white overflow-y-auto">
                <div className="w-full max-w-md py-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h2 className="font-heading text-4xl font-bold text-gray-900 mb-3">Create Account</h2>
                        <p className="text-gray-600">Join Nakhrali Fashion family today</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        {/* Google Sign Up */}
                        <button
                            type="button"
                            onClick={handleGoogleSignUp}
                            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 py-3.5 rounded-xl font-semibold hover:bg-gray-50 hover:border-purple-300 transition-all"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Sign up with Google
                        </button>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500">Or register with email</span>
                            </div>
                        </div>

                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                                <input
                                    type="text"
                                    required
                                    value={formData.fullName}
                                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                                        validationErrors.fullName ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                    placeholder="John Doe"
                                />
                            </div>
                            {validationErrors.fullName && (
                                <p className="mt-1 text-xs text-red-600">{validationErrors.fullName}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                                        validationErrors.email ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                    placeholder="you@example.com"
                                />
                            </div>
                            {validationErrors.email && (
                                <p className="mt-1 text-xs text-red-600">{validationErrors.email}</p>
                            )}
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Phone Number <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        handleInputChange('phone', value);
                                    }}
                                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                                        validationErrors.phone ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                    placeholder="9876543210"
                                    maxLength="10"
                                />
                            </div>
                            {validationErrors.phone && (
                                <p className="mt-1 text-xs text-red-600">{validationErrors.phone}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    className={`w-full pl-12 pr-14 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                                        validationErrors.password ? 'border-red-500' : 'border-gray-200'
                                    }`}
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
                            {formData.password && !validationErrors.password && (
                                <div className="mt-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${passwordStrength.color} transition-all duration-300`}
                                                style={{ width: `${passwordStrength.strength}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs font-medium text-gray-600">{passwordStrength.label}</span>
                                    </div>
                                </div>
                            )}
                            {validationErrors.password && (
                                <p className="mt-1 text-xs text-red-600">{validationErrors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Confirm Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    required
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                    className={`w-full pl-12 pr-14 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                                        validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {validationErrors.confirmPassword && (
                                <p className="mt-1 text-xs text-red-600">{validationErrors.confirmPassword}</p>
                            )}
                        </div>

                        {/* Communication Preferences */}
                        <div className="space-y-3 pt-2">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.newsletter}
                                    onChange={(e) => setFormData({ ...formData, newsletter: e.target.checked })}
                                    className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                />
                                <span className="text-sm text-gray-700">Subscribe to newsletter for exclusive offers</span>
                            </label>

                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.whatsapp}
                                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.checked })}
                                    className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                />
                                <span className="text-sm text-gray-700">Receive order updates on WhatsApp</span>
                            </label>
                        </div>

                        {/* Terms */}
                        <div className="border-t pt-4">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    required
                                    checked={formData.terms}
                                    onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
                                    className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                />
                                <span className="text-sm text-gray-700">
                                    I agree to the{' '}
                                    <a href="#" className="text-purple-600 hover:text-gold-600 font-semibold">Terms & Conditions</a>
                                    {' '}and{' '}
                                    <a href="#" className="text-purple-600 hover:text-gold-600 font-semibold">Privacy Policy</a>
                                    {' '}<span className="text-red-500">*</span>
                                </span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-purple-600 to-gold-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    {/* Login Link */}
                    <p className="mt-6 text-center text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="text-purple-600 hover:text-gold-600 font-semibold transition-colors">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
