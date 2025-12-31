import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, isAdmin } from '../utils/auth';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const authenticated = isAuthenticated();
            
            if (!authenticated) {
                setAuthorized(false);
                setLoading(false);
                return;
            }

            if (adminOnly) {
                const admin = isAdmin();
                setAuthorized(admin);
            } else {
                setAuthorized(true);
            }
        } catch (error) {
            console.error('Auth check error:', error);
            setAuthorized(false);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Verifying access...</p>
                </div>
            </div>
        );
    }

    if (!authorized) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
