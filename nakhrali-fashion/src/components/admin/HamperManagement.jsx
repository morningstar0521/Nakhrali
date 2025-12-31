import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Package, X, IndianRupee, Search, Upload, Image as ImageIcon } from 'lucide-react';
import { hampersAPI, productsAPI, boxesAPI, occasionsAPI } from '../../utils/api';

const API_URL = 'http://localhost:5001';

// Helper to get full image URL
const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_URL}${imagePath}`;
};

const HamperManagement = () => {
    const [hampers, setHampers] = useState([]);
    const [products, setProducts] = useState([]);
    const [boxes, setBoxes] = useState([]);
    const [occasions, setOccasions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingHamper, setEditingHamper] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [productCategory, setProductCategory] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        occasion_id: '',
        box_id: '',
        image: '',
        is_active: true,
        selectedProducts: []
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [hampersRes, productsRes, boxesRes, occasionsRes] = await Promise.all([
                hampersAPI.getAll(),
                productsAPI.getAll(),
                boxesAPI.getAll(),
                occasionsAPI.getAll()
            ]);

            setHampers(hampersRes.hampers || []);
            setProducts(productsRes.products || []);
            setBoxes(boxesRes.boxes || []);
            setOccasions(occasionsRes.occasions || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Error loading data: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
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
            return data.images[0]; // Return first uploaded image URL
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    };

    const handleProductToggle = (productId) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        setFormData(prev => {
            const existingIndex = prev.selectedProducts.findIndex(p => p.product_id === productId);
            
            if (existingIndex >= 0) {
                // Remove product
                return {
                    ...prev,
                    selectedProducts: prev.selectedProducts.filter(p => p.product_id !== productId)
                };
            } else {
                // Add product with quantity 1
                return {
                    ...prev,
                    selectedProducts: [...prev.selectedProducts, {
                        product_id: productId,
                        quantity: 1,
                        name: product.name,
                        price: product.price
                    }]
                };
            }
        });
    };

    const handleQuantityChange = (productId, quantity) => {
        if (quantity < 1) return;
        
        setFormData(prev => ({
            ...prev,
            selectedProducts: prev.selectedProducts.map(p =>
                p.product_id === productId ? { ...p, quantity: parseInt(quantity) } : p
            )
        }));
    };

    const calculateTotalPrice = () => {
        let total = formData.selectedProducts.reduce((sum, p) => {
            const product = products.find(prod => prod.id === p.product_id);
            return sum + (product ? parseFloat(product.price) * p.quantity : 0);
        }, 0);

        if (formData.box_id) {
            const box = boxes.find(b => b.id === formData.box_id);
            if (box) total += parseFloat(box.price);
        }

        return total;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.selectedProducts.length === 0) {
            alert('Please add at least one product to the hamper');
            return;
        }

        try {
            // Upload image if file selected
            let imageUrl = formData.image;
            if (imageFile) {
                imageUrl = await uploadImage();
            }

            const hamperData = {
                name: formData.name,
                description: formData.description,
                occasion_id: formData.occasion_id || null,
                box_id: formData.box_id || null,
                image: imageUrl,
                is_active: formData.is_active,
                total_price: calculateTotalPrice(),
                products: formData.selectedProducts
            };

            if (editingHamper) {
                await hampersAPI.update(editingHamper.id, hamperData);
                alert('Hamper updated successfully!');
            } else {
                await hampersAPI.create(hamperData);
                alert('Hamper created successfully!');
            }

            resetForm();
            fetchData();
        } catch (error) {
            console.error('Error saving hamper:', error);
            alert('Error saving hamper: ' + (error.message || 'Unknown error'));
        }
    };

    const handleEdit = (hamper) => {
        setEditingHamper(hamper);
        setFormData({
            name: hamper.name,
            description: hamper.description || '',
            occasion_id: hamper.occasion_id || '',
            box_id: hamper.box_id || '',
            image: hamper.image || '',
            is_active: hamper.is_active,
            selectedProducts: hamper.products?.map(p => ({
                product_id: p.product_id || p.id,
                quantity: p.quantity || 1,
                name: p.name,
                price: p.price
            })) || []
        });
        setImagePreview(getImageUrl(hamper.image) || '');
        setImageFile(null);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this hamper?')) return;

        try {
            await hampersAPI.delete(id);
            alert('Hamper deleted successfully!');
            fetchData();
        } catch (error) {
            console.error('Error deleting hamper:', error);
            alert('Error deleting hamper');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            occasion_id: '',
            box_id: '',
            image: '',
            is_active: true,
            selectedProducts: []
        });
        setEditingHamper(null);
        setShowForm(false);
        setImageFile(null);
        setImagePreview('');
        setProductCategory('');
    };

    const filteredHampers = hampers.filter(h =>
        h.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Hamper Management</h2>
                    <p className="text-gray-600">Create and manage gift hampers for suggested hampers</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Hamper
                </button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search hampers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Hampers List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHampers.map((hamper) => (
                    <div key={hamper.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                        {hamper.image && (
                            <img
                                src={getImageUrl(hamper.image)}
                                alt={hamper.name}
                                className="w-full h-48 object-cover"
                            />
                        )}
                        <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="font-bold text-lg text-gray-900">{hamper.name}</h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    hamper.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                    {hamper.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            
                            {hamper.occasion_name && (
                                <p className="text-sm text-purple-600 mb-2">{hamper.occasion_name}</p>
                            )}
                            
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{hamper.description}</p>
                            
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-1 text-gray-600 text-sm">
                                    <Package className="w-4 h-4" />
                                    <span>{hamper.products?.length || 0} items</span>
                                </div>
                                <div className="flex items-center font-bold text-purple-600">
                                    <IndianRupee className="w-4 h-4" />
                                    <span>{parseFloat(hamper.total_price).toLocaleString()}</span>
                                </div>
                            </div>
                            
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(hamper)}
                                    className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(hamper.id)}
                                    className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredHampers.length === 0 && (
                <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hampers found</p>
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h3 className="text-2xl font-bold text-gray-900">
                                {editingHamper ? 'Edit Hamper' : 'Add New Hamper'}
                            </h3>
                            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Hamper Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="e.g., Diwali Special Hamper"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows="3"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Describe your hamper..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Occasion/Event
                                        </label>
                                        <select
                                            name="occasion_id"
                                            value={formData.occasion_id}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        >
                                            <option value="">Select Occasion (Optional)</option>
                                            {occasions.map((occasion) => (
                                                <option key={occasion.id} value={occasion.id}>
                                                    {occasion.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Gift Box
                                        </label>
                                        <select
                                            name="box_id"
                                            value={formData.box_id}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        >
                                            <option value="">Select Box (Optional)</option>
                                            {boxes.map((box) => (
                                                <option key={box.id} value={box.id}>
                                                    {box.name} - ₹{parseFloat(box.price).toLocaleString()}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Hamper Image
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
                                                    <span className="px-2 bg-white text-gray-500">OR</span>
                                                </div>
                                            </div>
                                            <input
                                                type="url"
                                                name="image"
                                                value={formData.image}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                                placeholder="Or paste image URL"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="is_active"
                                            id="is_active"
                                            checked={formData.is_active}
                                            onChange={handleInputChange}
                                            className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                                        />
                                        <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                                            Active (visible in suggested hampers)
                                        </label>
                                    </div>

                                    {/* Total Price Display */}
                                    <div className="pt-4 border-t">
                                        <div className="flex items-center justify-between text-lg font-bold">
                                            <span className="text-gray-700">Total Price:</span>
                                            <span className="text-purple-600 flex items-center">
                                                <IndianRupee className="w-5 h-5" />
                                                {calculateTotalPrice().toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Product Selection */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Select Products *
                                    </label>
                                    
                                    {/* Category Filter */}
                                    <div className="mb-3">
                                        <select
                                            value={productCategory}
                                            onChange={(e) => setProductCategory(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                        >
                                            <option value="">All Categories</option>
                                            {[...new Set(products.map(p => p.category).filter(cat => cat && cat.toLowerCase() !== 'sale'))].map((category) => (
                                                <option key={category} value={category}>
                                                    {category}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="border border-gray-300 rounded-lg p-4 max-h-96 overflow-y-auto">
                                        {products
                                            .filter(p => {
                                                const matchesCategory = !productCategory || p.category === productCategory;
                                                const notSale = p.category?.toLowerCase() !== 'sale';
                                                return matchesCategory && notSale;
                                            })
                                            .map((product) => {
                                            const selectedProduct = formData.selectedProducts.find(
                                                p => p.product_id === product.id
                                            );
                                            const isSelected = !!selectedProduct;

                                            return (
                                                <div key={product.id} className="mb-3 p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-start gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => handleProductToggle(product.id)}
                                                            className="mt-1 w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                                                        />
                                                        <div className="flex-1">
                                                            <div className="flex items-start justify-between">
                                                                <div>
                                                                    <p className="font-semibold text-gray-900 text-sm">
                                                                        {product.name}
                                                                    </p>
                                                                    <p className="text-xs text-gray-600">
                                                                        {product.category}
                                                                    </p>
                                                                </div>
                                                                <span className="text-purple-600 font-bold text-sm flex items-center">
                                                                    <IndianRupee className="w-3 h-3" />
                                                                    {parseFloat(product.price).toLocaleString()}
                                                                </span>
                                                            </div>
                                                            
                                                            {isSelected && (
                                                                <div className="mt-2 flex items-center gap-2">
                                                                    <label className="text-xs text-gray-600">Qty:</label>
                                                                    <input
                                                                        type="number"
                                                                        min="1"
                                                                        value={selectedProduct.quantity}
                                                                        onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                                                                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                                                                    />
                                                                    <span className="text-xs text-gray-600">
                                                                        = ₹{(parseFloat(product.price) * selectedProduct.quantity).toLocaleString()}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Selected: {formData.selectedProducts.length} products
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-6 pt-6 border-t">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    {editingHamper ? 'Update Hamper' : 'Create Hamper'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HamperManagement;
