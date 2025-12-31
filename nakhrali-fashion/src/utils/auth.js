import { getCurrentUser, removeToken, removeCurrentUser } from './api';

// Check if user is authenticated
export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

// Check if user is admin
export const isAdmin = () => {
    const user = getCurrentUser();
    return user && user.role === 'admin';
};

// Logout user
export const logout = () => {
    removeToken();
    removeCurrentUser();
    window.location.href = '/login';
};
