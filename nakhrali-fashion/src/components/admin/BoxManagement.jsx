import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Package, Upload } from 'lucide-react';
import { boxesAPI } from '../../utils/api';

const BoxManagement = () => {
    const [boxes, setBoxes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBox, setEditingBox] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        image: '',
        dimensions: '',
        color: '',
        material: '',
        stock: 0,
        active: true
    });

    useEffect(() => {
        fetchBoxes();
    }, []);

    const fetchBoxes = async () => {
        try {
            setLoading(true);
            const data = await boxesAPI.getAll();
            setBoxes(data.boxes || []);
        } catch (error) {
            console.error('Error fetching boxes:', error);
            alert('Failed to fetch boxes');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadImage = async () => {
        if (!imageFile) return formData.image;

        const formDataUpload = new FormData();
        formDataUpload.append('images', imageFile);

        try {
            const response = await fetch('http://localhost:5001/api/products/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formDataUpload
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return data.images[0];
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Upload image if a new file was selected
            const imageUrl = await uploadImage();

            const boxData = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                image: imageUrl,
                dimensions: formData.dimensions,
                color: formData.color,
                material: formData.material,
                stock: parseInt(formData.stock),
                active: formData.active
            };

            if (editingBox) {
                await boxesAPI.update(editingBox.id, boxData);
                alert('Box updated successfully!');
            } else {
                await boxesAPI.create(boxData);
                alert('Box created successfully!');
            }

            setShowModal(false);
            resetForm();
            fetchBoxes();
        } catch (error) {
            console.error('Error saving box:', error);
            alert(error.message || 'Failed to save box');
        }
    };

    const handleEdit = (box) => {
        setEditingBox(box);
        setFormData({
            name: box.name,
            description: box.description || '',
            price: box.price,
            image: box.image || '',
            dimensions: box.dimensions || '',
            color: box.color || '',
            material: box.material || '',
            stock: box.stock,
            active: box.active
        });
        setImagePreview(getImageUrl(box.image) || '');
        setImageFile(null);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this box?')) return;

        try {
            await boxesAPI.delete(id);
            alert('Box deleted successfully!');
            fetchBoxes();
        } catch (error) {
            console.error('Error deleting box:', error);
            alert('Failed to delete box');
        }
    };

    const toggleActive = async (box) => {
        try {
            await boxesAPI.update(box.id, { ...box, active: !box.active });
            fetchBoxes();
        } catch (error) {
            console.error('Error toggling box:', error);
            alert('Failed to toggle box status');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            image: '',
            dimensions: '',
            color: '',
            material: '',
            stock: 0,
            active: true
        });
        setImageFile(null);
        setImagePreview('');
        setEditingBox(null);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        resetForm();
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return 'https://via.placeholder.com/300x300?text=No+Image';
        if (imagePath.startsWith('http')) return imagePath;
        return `http://localhost:5001${imagePath}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Gift Box Management</h2>
                    <p className="text-gray-600 mt-1">Manage gift boxes for custom hampers</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Add Box
                </button>
            </div>

            {/* Boxes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {boxes.length > 0 ? (
                    boxes.map((box) => (
                        <div key={box.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                            {/* Box Image */}
                            <div className="relative h-48 bg-gray-100">
                                <img
                                    src={getImageUrl(box.image)}
                                    alt={box.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <button
                                        onClick={() => handleEdit(box)}
                                        className="p-2 bg-white/90 text-purple-600 hover:bg-white rounded-full shadow-sm transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(box.id)}
                                        className="p-2 bg-white/90 text-red-600 hover:bg-white rounded-full shadow-sm transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Box Details */}
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-heading text-lg font-bold text-gray-900">{box.name}</h3>
                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${box.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {box.active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{box.description}</p>

                                <div className="space-y-2 text-xs text-gray-600 border-t pt-3">
                                    <div className="flex justify-between">
                                        <span>Price:</span>
                                        <span className="font-semibold text-purple-600">₹{parseFloat(box.price).toLocaleString()}</span>
                                    </div>
                                    {box.dimensions && (
                                        <div className="flex justify-between">
                                            <span>Size:</span>
                                            <span className="font-semibold">{box.dimensions}</span>
                                        </div>
                                    )}
                                    {box.color && (
                                        <div className="flex justify-between">
                                            <span>Color:</span>
                                            <span className="font-semibold">{box.color}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span>Stock:</span>
                                        <span className="font-semibold">{box.stock}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => toggleActive(box)}
                                    className={`w-full mt-3 py-1.5 rounded text-sm font-semibold transition-colors ${box.active
                                            ? 'text-red-600 hover:bg-red-50'
                                            : 'text-green-600 hover:bg-green-50'
                                        }`}
                                >
                                    {box.active ? 'Deactivate' : 'Activate'}
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full bg-white rounded-xl shadow-md p-12 text-center text-gray-500">
                        <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No gift boxes yet. Click "Add Box" to create one.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-900">
                                    {editingBox ? 'Edit Box' : 'Add New Box'}
                                </h3>
                                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Box Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="e.g., Premium Gift Box"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows="3"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Describe the gift box..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Price (₹) *
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Stock
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.stock}
                                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Box Image
                                    </label>
                                    <div className="space-y-3">
                                        {/* Image Preview */}
                                        {(imagePreview || formData.image) && (
                                            <div className="relative w-full h-40 border-2 border-gray-200 rounded-lg overflow-hidden">
                                                <img
                                                    src={imagePreview || getImageUrl(formData.image)}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        
                                        {/* File Upload */}
                                        <div className="flex gap-2">
                                            <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors">
                                                <Upload className="w-5 h-5 text-gray-600" />
                                                <span className="text-sm text-gray-600">
                                                    {imageFile ? imageFile.name : 'Upload Image'}
                                                </span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                        
                                        {/* Or Image URL */}
                                        <div className="relative">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-gray-300"></div>
                                            </div>
                                            <div className="relative flex justify-center text-xs">
                                                <span className="px-2 bg-white text-gray-500">or enter URL</span>
                                            </div>
                                        </div>
                                        
                                        <input
                                            type="text"
                                            value={formData.image}
                                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                            placeholder="https://example.com/box-image.jpg"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Dimensions
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.dimensions}
                                            onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="e.g., 10x8x4 in"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Color
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="e.g., Red"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Material
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.material}
                                            onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="e.g., Cardboard"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="active"
                                        checked={formData.active}
                                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                    />
                                    <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                                        Active (visible to customers)
                                    </label>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                    >
                                        {editingBox ? 'Update Box' : 'Create Box'}
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

export default BoxManagement;
