import React, { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { getCartCount, getWishlist } from '../utils/cartUtils';
import { isAuthenticated, isAdmin, logout } from '../utils/auth';
import SearchBar from './SearchBar';

const Header = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [isAuth, setIsAuth] = useState(false);
    const [isUserAdmin, setIsUserAdmin] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const currentCategory = searchParams.get('category');

    // Update counts and auth state on location change
    useEffect(() => {
        updateCounts();
        checkAuthStatus();
    }, [location]);

    const updateCounts = () => {
        setCartCount(getCartCount());
        setWishlistCount(getWishlist().length);
    };

    const checkAuthStatus = () => {
        setIsAuth(isAuthenticated());
        setIsUserAdmin(isAdmin());
    };

    const handleLogout = () => {
        logout();
        setShowUserMenu(false);
        navigate('/login');
    };

    // Helper function to check if a category link is active
    const isActiveCategory = (category) => {
        return location.pathname === '/products' && currentCategory === category;
    };

    // Helper function to get link classes with active state
    const getLinkClasses = (category) => {
        const baseClasses = "block py-2 px-3 font-medium transition-all duration-200 rounded-md relative";
        const isActive = isActiveCategory(category);

        if (category === 'Sales') {
            // Special styling for Sale link
            return `${baseClasses} ${isActive
                    ? 'text-gold-700 bg-gold-100 font-bold'
                    : 'text-gold-600 hover:text-gold-700 hover:bg-gold-50 font-bold'
                }`;
        }

        return `${baseClasses} ${isActive
                ? 'text-purple-600 bg-purple-100 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-purple-600'
                : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
            }`;
    };

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            {/* Top Bar with Logo, Name and Search */}
            <div className="bg-purple-500 py-4">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between gap-4">
                        {/* Logo and Name - Clickable */}
                        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-white flex items-center justify-center p-1">
                                <img 
                                    src="/assets/logo/logo1.png" 
                                    alt="Nakhrali Fashion Logo" 
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentElement.innerHTML = '<span class="text-purple-600 font-bold text-xl">N</span>';
                                    }}
                                />
                            </div>
                            <div>
                                <h1 className="text-white font-heading text-2xl font-bold">Nakhrali</h1>
                                <p className="text-purple-100 text-xs">Handcrafted Luxury Jewelry</p>
                            </div>
                        </Link>

                        {/* Search Bar - Desktop */}
                        <div className="hidden md:flex flex-1 max-w-2xl mx-8">
                            <SearchBar className="w-full" />
                        </div>

                        {/* Icons */}
                        <div className="flex items-center gap-3">
                            {/* Wishlist */}
                            <Link to="/wishlist" className="relative text-white hover:text-gold-300 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                {wishlistCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-gold-500 text-gray-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                        {wishlistCount}
                                    </span>
                                )}
                            </Link>

                            {/* Cart */}
                            <Link to="/cart" className="relative text-white hover:text-gold-300 transition-colors">
                                <ShoppingCart className="w-6 h-6" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-gold-500 text-gray-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>

                            {/* Login/Register or User Menu - Desktop */}
                            <div className="hidden md:flex items-center gap-2 ml-2">
                                {isAuth ? (
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowUserMenu(!showUserMenu)}
                                            className="flex items-center gap-2 px-4 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gold-100 transition-colors text-sm"
                                        >
                                            <User className="w-4 h-4" />
                                            <span>Account</span>
                                        </button>
                                        
                                        {showUserMenu && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                                                <Link
                                                    to="/dashboard"
                                                    onClick={() => setShowUserMenu(false)}
                                                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                                                >
                                                    <User className="w-4 h-4" />
                                                    <span>My Account</span>
                                                </Link>
                                                {isUserAdmin && (
                                                    <Link
                                                        to="/admin"
                                                        onClick={() => setShowUserMenu(false)}
                                                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                                                    >
                                                        <LayoutDashboard className="w-4 h-4" />
                                                        <span>Admin Panel</span>
                                                    </Link>
                                                )}
                                                <Link
                                                    to="/wishlist"
                                                    onClick={() => setShowUserMenu(false)}
                                                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                    </svg>
                                                    <span>Wishlist</span>
                                                </Link>
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center gap-2 w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    <span>Logout</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <Link
                                            to="/login"
                                            className="px-4 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gold-100 transition-colors text-sm"
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            to="/register"
                                            className="px-4 py-2 bg-gold-500 text-gray-900 rounded-lg font-semibold hover:bg-gold-600 transition-colors text-sm"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </div>

                            {/* Mobile Menu Toggle */}
                            <button
                                className="md:hidden text-white"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>

                    {/* Search Bar - Mobile */}
                    <div className="md:hidden mt-4">
                        <SearchBar className="w-full" />
                    </div>
                </div>
            </div>

            {/* Navigation Bar */}
            <nav className={`bg-white border-b border-purple-100 ${mobileMenuOpen ? 'block' : 'hidden md:block'}`}>
                <div className="container mx-auto px-4">
                    <ul className="flex flex-col md:flex-row md:items-center md:justify-center gap-1 md:gap-2 py-4">
                        <li>
                            <Link to="/products?category=Necklace" className={getLinkClasses('Necklace')}>
                                Necklace
                            </Link>
                        </li>
                        <li>
                            <Link to="/products?category=Rings" className={getLinkClasses('Rings')}>
                                Rings
                            </Link>
                        </li>
                        <li>
                            <Link to="/products?category=Earrings" className={getLinkClasses('Earrings')}>
                                Earrings
                            </Link>
                        </li>
                        <li>
                            <Link to="/products?category=Bracelets" className={getLinkClasses('Bracelets')}>
                                Bracelets
                            </Link>
                        </li>
                        <li>
                            <Link to="/products?category=Mangalsutra" className={getLinkClasses('Mangalsutra')}>
                                Mangalsutra
                            </Link>
                        </li>
                        <li>
                            <Link to="/products?category=Pendant Sets" className={getLinkClasses('Pendant Sets')}>
                                Pendant Sets
                            </Link>
                        </li>
                        <li>
                            <Link to={`/products?category=${encodeURIComponent('Hair Accessories & Pins')}`} className={getLinkClasses('Hair Accessories & Pins')}>
                                Hair Accessories & Pins
                            </Link>
                        </li>
                        <li>
                            <Link to={`/products?category=${encodeURIComponent('Bangles & Kada')}`} className={getLinkClasses('Bangles & Kada')}>
                                Bangles & Kada
                            </Link>
                        </li>
                        <li>
                            <Link to="/products?category=Gift Hampers" className={getLinkClasses('Gift Hampers')}>
                                Gift Hampers
                            </Link>
                        </li>
                        <li>
                            <Link to="/products?category=Sales" className={getLinkClasses('Sales')}>
                                Sale
                            </Link>
                        </li>
                    </ul>
                </div>
            </nav>
        </header>
    );
};

export default Header;
