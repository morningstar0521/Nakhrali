// Cart and Wishlist utility functions using localStorage

const API_URL = 'http://localhost:5001';

// Helper to get proper image URL
const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/400';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_URL}${imagePath}`;
};

export const getCart = () => {
    try {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    } catch (error) {
        console.error('Error reading cart:', error);
        return [];
    }
};

export const addToCart = (product, quantity = 1) => {
    try {
        const cart = getCart();
        const existingItemIndex = cart.findIndex(item => item.id === product.id);
        
        if (existingItemIndex > -1) {
            // Update quantity if item already exists
            cart[existingItemIndex].quantity += quantity;
        } else {
            // Add new item
            cart.push({
                id: product.id,
                name: product.name,
                price: product.salePrice || product.price,
                originalPrice: product.price,
                image: getImageUrl(product.images?.[0] || product.image),
                category: product.category,
                quantity: quantity
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        return true;
    } catch (error) {
        console.error('Error adding to cart:', error);
        return false;
    }
};

export const removeFromCart = (productId) => {
    try {
        const cart = getCart();
        const updatedCart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        return true;
    } catch (error) {
        console.error('Error removing from cart:', error);
        return false;
    }
};

export const updateCartQuantity = (productId, quantity) => {
    try {
        const cart = getCart();
        const itemIndex = cart.findIndex(item => item.id === productId);
        
        if (itemIndex > -1) {
            if (quantity <= 0) {
                return removeFromCart(productId);
            }
            cart[itemIndex].quantity = quantity;
            localStorage.setItem('cart', JSON.stringify(cart));
        }
        return true;
    } catch (error) {
        console.error('Error updating cart quantity:', error);
        return false;
    }
};

export const clearCart = () => {
    try {
        localStorage.removeItem('cart');
        return true;
    } catch (error) {
        console.error('Error clearing cart:', error);
        return false;
    }
};

export const getCartTotal = () => {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
};

export const getCartCount = () => {
    const cart = getCart();
    return cart.reduce((count, item) => count + item.quantity, 0);
};

// Wishlist functions
export const getWishlist = () => {
    try {
        const wishlist = localStorage.getItem('wishlist');
        return wishlist ? JSON.parse(wishlist) : [];
    } catch (error) {
        console.error('Error reading wishlist:', error);
        return [];
    }
};

export const addToWishlist = (product) => {
    try {
        const wishlist = getWishlist();
        const exists = wishlist.find(item => item.id === product.id);
        
        if (!exists) {
            wishlist.push({
                id: product.id,
                name: product.name,
                price: product.salePrice || product.price,
                originalPrice: product.price,
                image: getImageUrl(product.images?.[0] || product.image),
                category: product.category,
                inStock: product.stock > 0
            });
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
        }
        return true;
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        return false;
    }
};

export const removeFromWishlist = (productId) => {
    try {
        const wishlist = getWishlist();
        const updatedWishlist = wishlist.filter(item => item.id !== productId);
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
        return true;
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        return false;
    }
};

export const isInWishlist = (productId) => {
    const wishlist = getWishlist();
    return wishlist.some(item => item.id === productId);
};

export const clearWishlist = () => {
    try {
        localStorage.removeItem('wishlist');
        return true;
    } catch (error) {
        console.error('Error clearing wishlist:', error);
        return false;
    }
};
