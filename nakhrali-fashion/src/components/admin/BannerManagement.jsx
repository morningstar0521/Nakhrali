import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, ArrowUp, ArrowDown, Upload, Link as LinkIcon, Loader } from 'lucide-react';
import { bannersAPI, productsAPI } from '../../utils/api';

const BannerManagement = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [extractUrl, setExtractUrl] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        description: '',
        image: '',
        redirectLink: '',
        primaryCTA: 'Shop Now',
        secondaryCTA: 'Learn More',
        active: true,
        order: 0
    });

    const redirectOptions = [
        { value: '', label: 'No Redirect' },
        { value: '/products?category=Necklace', label: 'Necklace' },
        { value: '/products?category=Rings', label: 'Rings' },
        { value: '/products?category=Earrings', label: 'Earrings' },
        { value: '/products?category=Bracelets', label: 'Bracelets' },
        { value: '/products?category=Mangalsutra', label: 'Mangalsutra' },
        { value: '/products?category=Sales', label: 'Sales' },
        { value: '/products', label: 'All Products' }
    ];

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const data = await bannersAPI.getAll();
            setBanners(data.banners || []);
        } catch (error) {
            console.error('Error fetching banners:', error);
            alert('Failed to fetch banners');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const bannerData = {
                title: formData.title,
                subtitle: formData.subtitle,
                description: formData.description,
                image: formData.image,
                redirectLink: formData.redirectLink,
                primaryCta: formData.primaryCTA,
                secondaryCta: formData.secondaryCTA,
                active: formData.active,
                order: parseInt(formData.order)
            };

            if (editingBanner) {
                await bannersAPI.update(editingBanner.id, bannerData);
                alert('Banner updated successfully!');
            } else {
                await bannersAPI.create(bannerData);
                alert('Banner created successfully!');
            }

            setShowModal(false);
            resetForm();
            fetchBanners();
        } catch (error) {
            console.error('Error saving banner:', error);
            alert(error.message || 'Failed to save banner');
        }
    };

    const handleEdit = (banner) => {
        setEditingBanner(banner);
        setFormData({
            title: banner.title,
            subtitle: banner.subtitle || '',
            description: banner.description,
            image: banner.image,
            redirectLink: banner.redirectLink || '',
            primaryCTA: banner.primaryCta || 'Shop Now',
            secondaryCTA: banner.secondaryCta || 'Learn More',
            active: banner.active,
            order: banner.order
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this banner?')) return;

        try {
            await bannersAPI.delete(id);
            alert('Banner deleted successfully!');
            fetchBanners();
        } catch (error) {
            console.error('Error deleting banner:', error);
            alert('Failed to delete banner');
        }
    };

    const toggleActive = async (banner) => {
        try {
            await bannersAPI.update(banner.id, { ...banner, active: !banner.active });
            fetchBanners();
        } catch (error) {
            console.error('Error toggling banner:', error);
            alert('Failed to toggle banner status');
        }
    };

    const resetForm = () => {
        setEditingBanner(null);
        setExtractUrl('');
        setFormData({
            title: '',
            subtitle: '',
            description: '',
            image: '',
            redirectLink: '',
            primaryCTA: 'Shop Now',
            secondaryCTA: 'Learn More',
            active: true,
            order: 0
        });
    };

    const handleImageUpload = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        try {
            setUploadingImage(true);
            const result = await productsAPI.uploadImages(files);
            if (result.images && result.images.length > 0) {
                setFormData({
                    ...formData,
                    image: `http://localhost:5001${result.images[0]}`
                });
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert(error.message || 'Failed to upload image');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleExtractFromUrl = async () => {
        if (!extractUrl.trim()) {
            alert('Please enter a URL');
            return;
        }

        try {
            const result = await productsAPI.extractFromUrl(extractUrl);
            if (result.data.images && result.data.images.length > 0) {
                setFormData({
                    ...formData,
                    image: result.data.images[0]
                });
                setExtractUrl('');
                alert('Image extracted successfully!');
            } else {
                alert('No images found at this URL');
            }
        } catch (error) {
            console.error('Error extracting image:', error);
            alert(error.message || 'Failed to extract image from URL');
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading banners...</div>;
    }

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-heading text-2xl font-bold text-gray-900">Hero Banner Management</h2>
                <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-gold-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Add Banner
                </button>
            </div>

            {/* Banners Grid */}
            <div className="grid gap-6">
                {banners.length > 0 ? (
                    banners.map((banner) => (
                        <div key={banner._id} className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="flex flex-col md:flex-row">
                                {/* Banner Preview */}
                                <div className="md:w-1/3 h-48 md:h-auto bg-gray-200 flex items-center justify-center">
                                    {banner.image ? (
                                        <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-gray-400">No Image</span>
                                    )}
                                </div>

                                {/* Banner Details */}
                                <div className="flex-1 p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-heading text-xl font-bold text-gray-900 mb-1">{banner.title}</h3>
                                            {banner.subtitle && (
                                                <p className="text-gold-600 font-script text-lg mb-2">{banner.subtitle}</p>
                                            )}
                                            <p className="text-gray-600 mb-3">{banner.description}</p>
                                            <div className="flex gap-2 mb-3">
                                                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                                                    {banner.primaryCTA}
                                                </span>
                                                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                                                    {banner.secondaryCTA}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <span>Order: {banner.order}</span>
                                                <span className={`px-2 py-1 rounded ${banner.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {banner.active ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => toggleActive(banner)}
                                                className={`px-4 py-2 rounded-lg font-semibold text-sm ${banner.active
                                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    }`}
                                            >
                                                {banner.active ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button
                                                onClick={() => handleEdit(banner)}
                                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(banner.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center text-gray-500">
                        No banners yet. Click "Add Banner" to create one.
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-heading text-2xl font-bold text-gray-900">
                                    {editingBanner ? 'Edit Banner' : 'Add New Banner'}
                                </h3>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="Exclusive Collection 2025"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Subtitle</label>
                                    <input
                                        type="text"
                                        value={formData.subtitle}
                                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="Discover Elegance"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                                    <textarea
                                        required
                                        rows="3"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="Explore our handcrafted jewelry collection..."
                                    />
                                </div>

                                {/* Image Section */}
                                <div className="border-2 border-purple-100 rounded-lg p-4 bg-purple-50">
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">Banner Image *</label>

                                    {/* URL Extraction */}
                                    <div className="mb-3">
                                        <label className="block text-xs font-semibold text-gray-600 mb-2">
                                            <LinkIcon className="w-3 h-3 inline mr-1" />
                                            Extract from URL
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="url"
                                                value={extractUrl}
                                                onChange={(e) => setExtractUrl(e.target.value)}
                                                placeholder="Paste image URL or product link"
                                                className="flex-1 px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleExtractFromUrl}
                                                className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
                                            >
                                                Extract
                                            </button>
                                        </div>
                                    </div>

                                    {/* Upload */}
                                    <div className="mb-3">
                                        <label className="block text-xs font-semibold text-gray-600 mb-2">
                                            <Upload className="w-3 h-3 inline mr-1" />
                                            Or Upload Image
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={uploadingImage}
                                            className="w-full text-sm"
                                        />
                                        {uploadingImage && <p className="text-xs text-purple-600 mt-1">Uploading...</p>}
                                    </div>

                                    {/* Current Image Preview */}
                                    {formData.image && (
                                        <div className="mt-3">
                                            <p className="text-xs font-semibold text-gray-600 mb-2">Current Image:</p>
                                            <img
                                                src={formData.image}
                                                alt="Banner preview"
                                                className="w-full h-32 object-cover rounded-lg"
                                            />
                                        </div>
                                    )}

                                    {/* Manual URL Input */}
                                    <div className="mt-3">
                                        <label className="block text-xs font-semibold text-gray-600 mb-2">Or Enter Image URL</label>
                                        <input
                                            type="url"
                                            required={!formData.image}
                                            value={formData.image}
                                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                            placeholder="https://example.com/banner.jpg"
                                            className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                </div>

                                {/* Redirect Link */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Redirect Link</label>
                                    <select
                                        value={formData.redirectLink}
                                        onChange={(e) => setFormData({ ...formData, redirectLink: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        {redirectOptions.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">Where to redirect when banner is clicked</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Primary CTA</label>
                                        <input
                                            type="text"
                                            value={formData.primaryCTA}
                                            onChange={(e) => setFormData({ ...formData, primaryCTA: e.target.value })}
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Secondary CTA</label>
                                        <input
                                            type="text"
                                            value={formData.secondaryCTA}
                                            onChange={(e) => setFormData({ ...formData, secondaryCTA: e.target.value })}
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Display Order</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.active}
                                            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                        />
                                        <span className="text-sm font-semibold text-gray-700">Active (show on website)</span>
                                    </label>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-purple-600 to-gold-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                                    >
                                        {editingBanner ? 'Update Banner' : 'Create Banner'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BannerManagement;
