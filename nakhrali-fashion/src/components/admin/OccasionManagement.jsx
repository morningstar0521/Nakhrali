import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Upload, Link as LinkIcon } from 'lucide-react';
import { occasionsAPI, productsAPI } from '../../utils/api';

const OccasionManagement = () => {
    const [occasions, setOccasions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingOccasion, setEditingOccasion] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [extractUrl, setExtractUrl] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: '',
        active: true,
        order: 0
    });

    useEffect(() => {
        fetchOccasions();
    }, []);

    const fetchOccasions = async () => {
        try {
            setLoading(true);
            const data = await occasionsAPI.getAll();
            setOccasions(data.occasions || []);
        } catch (error) {
            console.error('Error fetching occasions:', error);
            alert('Failed to fetch occasions');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const occasionData = {
                title: formData.title,
                description: formData.description,
                image: formData.image,
                active: formData.active,
                order: parseInt(formData.order)
            };

            if (editingOccasion) {
                await occasionsAPI.update(editingOccasion.id, occasionData);
                alert('Occasion updated successfully!');
            } else {
                await occasionsAPI.create(occasionData);
                alert('Occasion created successfully!');
            }

            setShowModal(false);
            resetForm();
            fetchOccasions();
        } catch (error) {
            console.error('Error saving occasion:', error);
            alert(error.message || 'Failed to save occasion');
        }
    };

    const handleEdit = (occasion) => {
        setEditingOccasion(occasion);
        setFormData({
            title: occasion.title,
            description: occasion.description || '',
            image: occasion.image,
            active: occasion.active,
            order: occasion.order
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this occasion?')) return;

        try {
            await occasionsAPI.delete(id);
            alert('Occasion deleted successfully!');
            fetchOccasions();
        } catch (error) {
            console.error('Error deleting occasion:', error);
            alert('Failed to delete occasion');
        }
    };

    const toggleActive = async (occasion) => {
        try {
            await occasionsAPI.update(occasion.id, { ...occasion, active: !occasion.active });
            fetchOccasions();
        } catch (error) {
            console.error('Error toggling occasion:', error);
            alert('Failed to toggle occasion status');
        }
    };

    const resetForm = () => {
        setEditingOccasion(null);
        setExtractUrl('');
        setFormData({
            title: '',
            description: '',
            image: '',
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
        return <div className="text-center py-8">Loading occasions...</div>;
    }

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-heading text-2xl font-bold text-gray-900">Shop by Occasion Management</h2>
                <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-gold-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Add Occasion
                </button>
            </div>

            {/* Occasions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {occasions.length > 0 ? (
                    occasions.map((occasion) => (
                        <div key={occasion.id} className="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-lg transition-shadow">
                            {/* Occasion Image */}
                            <div className="h-48 bg-gray-200 relative overflow-hidden">
                                {occasion.image ? (
                                    <img
                                        src={occasion.image}
                                        alt={occasion.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        No Image
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleEdit(occasion); }}
                                        className="p-2 bg-white/90 text-purple-600 hover:bg-white rounded-full shadow-sm transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(occasion.id); }}
                                        className="p-2 bg-white/90 text-red-600 hover:bg-white rounded-full shadow-sm transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Occasion Details */}
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-heading text-lg font-bold text-gray-900">{occasion.title}</h3>
                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${occasion.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {occasion.active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{occasion.description}</p>

                                <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3">
                                    <span>Display Order: {occasion.order}</span>
                                </div>

                                <button
                                    onClick={() => toggleActive(occasion)}
                                    className={`w-full mt-3 py-1.5 rounded text-sm font-semibold transition-colors ${occasion.active
                                            ? 'text-red-600 hover:bg-red-50'
                                            : 'text-green-600 hover:bg-green-50'
                                        }`}
                                >
                                    {occasion.active ? 'Deactivate' : 'Activate'}
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full bg-white rounded-xl shadow-md p-12 text-center text-gray-500">
                        No occasions yet. Click "Add Occasion" to create one.
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
                                    {editingOccasion ? 'Edit Occasion' : 'Add New Occasion'}
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
                                        placeholder="e.g. Wedding Gifts"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                    <textarea
                                        rows="2"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="Brief description of this occasion collection..."
                                    />
                                </div>

                                {/* Image Section */}
                                <div className="border-2 border-purple-100 rounded-lg p-4 bg-purple-50">
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">Occasion Image *</label>

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
                                                placeholder="Paste image URL"
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
                                                alt="Preview"
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
                                            placeholder="https://example.com/image.jpg"
                                            className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                                        {editingOccasion ? 'Update Occasion' : 'Create Occasion'}
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

export default OccasionManagement;
