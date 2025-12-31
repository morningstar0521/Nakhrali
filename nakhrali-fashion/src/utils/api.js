// API helper functions
const API_URL = import.meta.env.VITE_API_URL;

// Get token from localStorage
const getToken = () => {
    return localStorage.getItem('token');
};

// Set token in localStorage
export const setToken = (token) => {
    localStorage.setItem('token', token);
};

// Remove token from localStorage
export const removeToken = () => {
    localStorage.removeItem('token');
};

// Get current user from localStorage
export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

// Set current user in localStorage
export const setCurrentUser = (user) => {
    localStorage.setItem('user', JSON.stringify(user));
};

// Remove current user from localStorage
export const removeCurrentUser = () => {
    localStorage.removeItem('user');
};

// API request helper
const apiRequest = async (endpoint, options = {}) => {
    const token = getToken();

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
    }

    return data;
};

// Auth API
export const authAPI = {
    register: (userData) => apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
    }),

    login: (credentials) => apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    }),

    getMe: () => apiRequest('/auth/me'),
};

// Products API
export const productsAPI = {
    getAll: () => apiRequest('/products'),

    getFeatured: () => apiRequest('/products/featured'),

    getOne: (id) => apiRequest(`/products/${id}`),

    getById: (id) => apiRequest(`/products/${id}`),

    create: (productData) => apiRequest('/products', {
        method: 'POST',
        body: JSON.stringify(productData),
    }),

    update: (id, productData) => apiRequest(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(productData),
    }),

    delete: (id) => apiRequest(`/products/${id}`, {
        method: 'DELETE',
    }),

    uploadImages: async (files) => {
        const token = getToken();
        const formData = new FormData();

        for (let i = 0; i < files.length; i++) {
            formData.append('images', files[i]);
        }

        const response = await fetch(`${API_URL}/products/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to upload images');
        }
        return data;
    },

    deleteImage: (filename) => apiRequest(`/products/images/${filename}`, {
        method: 'DELETE',
    }),

    extractFromUrl: (url) => apiRequest('/products/extract', {
        method: 'POST',
        body: JSON.stringify({ url }),
    }),
};

// Banners API
export const bannersAPI = {
    getActive: () => apiRequest('/banners'),

    getAll: () => apiRequest('/banners/all'),

    getOne: (id) => apiRequest(`/banners/${id}`),

    create: (bannerData) => apiRequest('/banners', {
        method: 'POST',
        body: JSON.stringify(bannerData),
    }),

    update: (id, bannerData) => apiRequest(`/banners/${id}`, {
        method: 'PUT',
        body: JSON.stringify(bannerData),
    }),

    delete: (id) => apiRequest(`/banners/${id}`, {
        method: 'DELETE',
    }),
};

// Admin API
export const adminAPI = {
    getMetrics: () => apiRequest('/admin/metrics'),

    getUsers: () => apiRequest('/admin/users'),
};

// Occasions API
export const occasionsAPI = {
    getActive: () => apiRequest('/occasions'),

    getAll: () => apiRequest('/occasions/all'),

    getOne: (id) => apiRequest(`/occasions/${id}`),

    create: (occasionData) => apiRequest('/occasions', {
        method: 'POST',
        body: JSON.stringify(occasionData),
    }),

    update: (id, occasionData) => apiRequest(`/occasions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(occasionData),
    }),

    delete: (id) => apiRequest(`/occasions/${id}`, {
        method: 'DELETE',
    }),
};

// Boxes API
export const boxesAPI = {
    getActive: () => apiRequest('/boxes'),

    getAll: () => apiRequest('/boxes/all'),

    create: (boxData) => apiRequest('/boxes', {
        method: 'POST',
        body: JSON.stringify(boxData),
    }),

    update: (id, boxData) => apiRequest(`/boxes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(boxData),
    }),

    delete: (id) => apiRequest(`/boxes/${id}`, {
        method: 'DELETE',
    }),
};

// Hampers API
export const hampersAPI = {
    getActive: () => apiRequest('/hampers'),

    getAll: () => apiRequest('/hampers/all'),

    getById: (id) => apiRequest(`/hampers/${id}`),

    getByOccasion: (occasionId) => apiRequest(`/hampers/occasion/${occasionId}`),

    create: (hamperData) => apiRequest('/hampers', {
        method: 'POST',
        body: JSON.stringify(hamperData),
    }),

    update: (id, hamperData) => apiRequest(`/hampers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(hamperData),
    }),

    delete: (id) => apiRequest(`/hampers/${id}`, {
        method: 'DELETE',
    }),
};
