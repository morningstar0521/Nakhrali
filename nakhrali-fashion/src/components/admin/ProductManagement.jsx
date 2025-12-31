import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Upload, Link as LinkIcon, Loader } from 'lucide-react';
import { productsAPI, occasionsAPI } from '../../utils/api';

const ProductManagement = () => {
    // Helper function to get correct image URL
    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return '';
        // If it's already a full URL (http/https), return as is
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }
        // Otherwise, it's a local upload, prepend backend URL
        return `http://localhost:5001${imageUrl}`;
    };
    const [products, setProducts] = useState([]);
    const [activeOccasions, setActiveOccasions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [extractingUrl, setExtractingUrl] = useState(false);
    const [extractUrl, setExtractUrl] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        salePrice: '',
        category: 'Necklace',
        stock: '',
        featured: false,
        images: [],
        tags: '',
        material: '',
        dimensions: '',
        colors: '',
        customFields: [],
        // Category-specific filters
        subCategory: [],
        style: [],
        occasion: [],
        plating: ''
    });

    const categories = [
        'Necklace', 'Rings', 'Earrings', 'Bracelets', 'Mangalsutra',
        'Pendant Sets', 'Hair Accessories & Pins', 'Bangles & Kada', 'Gift Hampers', 'Sales'
    ];

    // Get category-specific filter options
    const getCategoryFilters = (category) => {
        // Get filter tags from active occasions
        const dynamicOccasions = activeOccasions
            .map(o => o.title);

        // Base occasions for jewelry
        const baseOccasions = ['Bridal', 'Engagement', 'Couple', 'Party Wear', 'Everyday', 'Festive', 'Exclusive', 'Wedding', 'Casual', 'Traditional'];

        // Combine unique occasions
        const allOccasions = [...new Set([...baseOccasions, ...dynamicOccasions])];

        switch (category) {
            case 'Rings':
                return {
                    subCategory: ['AD', 'CZ (Zircon)', 'Rajwada'],
                    style: [],
                    occasion: allOccasions,
                    color: ['Red', 'Blue', 'Sky Blue', 'Teal', 'Black', 'Pink', 'Lavender', 'Emerald', 'Baby Pink', 'Silver'],
                    plating: ['Silver', 'Gold', 'Rose Gold', 'Rajwada']
                };
            case 'Necklace':
                return {
                    subCategory: ['AD', 'CZ (Zircon)'],
                    style: ['Choker', 'Longer', 'Layered'],
                    occasion: allOccasions,
                    color: ['Red', 'Blue', 'Sky Blue', 'Teal', 'Black', 'Pink', 'Lavender', 'Emerald', 'Baby Pink', 'Silver'],
                    plating: ['Silver', 'Gold', 'Rose Gold']
                };
            case 'Earrings':
                return {
                    subCategory: ['AD', 'CZ (Zircon)', 'Rajwada'],
                    style: ['Drop and Danglers', 'Hoops and Huggies', 'Studs and Tops', 'Jhumkas'],
                    occasion: allOccasions,
                    color: ['Red', 'Blue', 'Sky Blue', 'Teal', 'Black', 'Pink', 'Lavender', 'Emerald', 'Baby Pink', 'Silver'],
                    plating: ['Silver', 'Gold', 'Rose Gold']
                };
            case 'Bracelets':
                return {
                    subCategory: ['AD', 'CZ (Zircon)', 'Rajwada', 'Style Statement'],
                    style: ['Pattern', 'Fit All'],
                    occasion: allOccasions,
                    color: ['Red', 'Blue', 'Sky Blue', 'Teal', 'Black', 'Pink', 'Lavender', 'Emerald', 'Baby Pink', 'Silver'],
                    plating: ['Silver', 'Gold', 'Rose']
                };
            case 'Mangalsutra':
                return {
                    subCategory: ['CZ (Zircon)', 'Rajwada'],
                    style: ['Long', 'Short'],
                    occasion: allOccasions,
                    color: ['Red', 'Blue', 'Sky Blue', 'Teal', 'Black', 'Pink', 'Lavender', 'Emerald', 'Baby Pink', 'Silver'],
                    plating: ['Silver', 'Gold', 'Rose Gold']
                };
            case 'Pendant Sets':
                return {
                    subCategory: ['AD', 'CZ (Zircon)', 'Shiny-Wear'],
                    style: ['Pendant Sets', 'Pendant Without Earring'],
                    occasion: allOccasions,
                    color: ['Red', 'Blue', 'Sky Blue', 'Teal', 'Black', 'Pink', 'Lavender', 'Emerald', 'Baby Pink', 'Silver'],
                    plating: ['Silver', 'Gold', 'Rose Gold']
                };
            case 'Hair Accessories & Pins':
                return {
                    subCategory: ['Clutcher', 'Hair Back Clips', 'Magnetic Saree Pins', 'Indo Western Pins'],
                    style: [],
                    occasion: dynamicOccasions, // Only show dynamic occasions for simplified categories
                    color: [],
                    plating: []
                };
            case 'Bangles & Kada':
                return {
                    subCategory: ['AD', 'CZ (Zircon)', 'Rajwada'],
                    style: ['Kada', 'Bangles'],
                    occasion: allOccasions,
                    color: ['Red', 'Blue', 'Sky Blue', 'Teal', 'Black', 'Pink', 'Lavender', 'Emerald', 'Baby Pink', 'Silver'],
                    plating: ['Silver', 'Gold', 'Rajwada']
                };
            case 'Gift Hampers':
                return {
                    subCategory: ['Gift Box', 'Hamper', 'Combo'],
                    style: [],
                    occasion: dynamicOccasions.length > 0 ? dynamicOccasions : ['Anniversary', 'Birthday', 'Wedding', 'Corporate'],
                    color: [],
                    plating: []
                };
            default:
                return {
                    subCategory: [],
                    style: [],
                    occasion: dynamicOccasions,
                    color: [],
                    plating: []
                };
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchOccasions();
    }, []);

    const fetchOccasions = async () => {
        try {
            const data = await occasionsAPI.getAll(); // Fetch all to include inactive ones if needed, or getActive
            // But for tagging products, we probably only care about available occasions. 
            // Let's use getAll to be safe so we see everything.
            setActiveOccasions(data.occasions || []);
        } catch (error) {
            console.error('Error fetching occasions:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await productsAPI.getAll();
            setProducts(data.products || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            alert('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        try {
            setUploadingImages(true);
            const result = await productsAPI.uploadImages(files);
            setFormData({
                ...formData,
                images: [...formData.images, ...result.images]
            });
        } catch (error) {
            console.error('Error uploading images:', error);
            alert(error.message || 'Failed to upload images');
        } finally {
            setUploadingImages(false);
        }
    };

    const handleRemoveImage = async (imageUrl) => {
        try {
            // Only delete from server if it's a local upload (not an external URL)
            if (imageUrl.startsWith('/uploads/')) {
                const filename = imageUrl.split('/').pop();
                await productsAPI.deleteImage(filename);
            }

            // Remove from form state regardless of whether it's local or external
            setFormData({
                ...formData,
                images: formData.images.filter(img => img !== imageUrl)
            });
        } catch (error) {
            console.error('Error removing image:', error);
            alert('Failed to remove image');
        }
    };

    const handleExtractFromUrl = async () => {
        if (!extractUrl.trim()) {
            alert('Please enter a URL');
            return;
        }

        try {
            setExtractingUrl(true);
            const result = await productsAPI.extractFromUrl(extractUrl);

            // Auto-populate form with extracted data
            setFormData({
                ...formData,
                name: result.data.name || formData.name,
                description: result.data.description || formData.description,
                price: result.data.price || formData.price,
                images: [...formData.images, ...result.data.images]
            });

            setExtractUrl('');
            alert('Product data extracted successfully! Please review and adjust as needed.');
        } catch (error) {
            console.error('Error extracting product:', error);
            alert(error.message || 'Failed to extract product data');
        } finally {
            setExtractingUrl(false);
        }
    };

    const handleAddCustomField = () => {
        setFormData({
            ...formData,
            customFields: [...formData.customFields, { key: '', value: '' }]
        });
    };

    const handleRemoveCustomField = (index) => {
        setFormData({
            ...formData,
            customFields: formData.customFields.filter((_, i) => i !== index)
        });
    };

    const handleCustomFieldChange = (index, field, value) => {
        const updatedFields = [...formData.customFields];
        updatedFields[index][field] = value;
        setFormData({
            ...formData,
            customFields: updatedFields
        });
    };

    // Handler for category-specific filter checkboxes
    const handleCategoryFilterChange = (filterType, value) => {
        const currentValues = formData[filterType];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];

        setFormData({
            ...formData,
            [filterType]: newValues
        });
    };

    // Handler for category change - reset category-specific filters
    const handleCategoryChange = (newCategory) => {
        setFormData({
            ...formData,
            category: newCategory,
            subCategory: [],
            style: [],
            occasion: [],
            plating: '',
            // Clear sale price when changing away from Sales category
            salePrice: newCategory === 'Sales' ? formData.salePrice : ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Convert custom fields array to object
            const customFieldsObj = {};
            formData.customFields.forEach(field => {
                if (field.key && field.value) {
                    customFieldsObj[field.key] = field.value;
                }
            });

            // Merge category-specific filters into tags
            const manualTags = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [];
            const filterTags = [
                ...formData.subCategory,
                ...formData.style,
                ...formData.occasion
            ];
            const allTags = [...new Set([...manualTags, ...filterTags])]; // Remove duplicates

            // Parse colors from comma-separated string
            const colorArray = formData.colors ? formData.colors.split(',').map(c => c.trim()).filter(c => c) : [];

            // Handle material: prioritize plating if selected, otherwise use material field
            let materialValue = '';
            if (formData.plating) {
                materialValue = formData.plating;
            } else if (formData.material) {
                materialValue = formData.material;
            }

            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                salePrice: formData.salePrice ? parseFloat(formData.salePrice) : undefined,
                stock: parseInt(formData.stock),
                tags: allTags,
                colors: colorArray,
                material: materialValue,
                dimensions: formData.dimensions || '',
                customFields: customFieldsObj
            };

            // Remove category-specific filter fields from productData (they're merged into tags/material)
            delete productData.subCategory;
            delete productData.style;
            delete productData.occasion;
            delete productData.plating;

            if (editingProduct) {
                await productsAPI.update(editingProduct.id, productData);
                alert('Product updated successfully!');
            } else {
                await productsAPI.create(productData);
                alert('Product created successfully!');
            }

            setShowModal(false);
            resetForm();
            fetchProducts();
        } catch (error) {
            console.error('Error saving product:', error);
            alert(error.message || 'Failed to save product');
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);

        // Convert custom fields object to array for form
        const customFieldsArray = product.customFields ?
            Object.entries(product.customFields).map(([key, value]) => ({ key, value })) : [];

        // Get category-specific filters for this product's category
        const categoryFilters = getCategoryFilters(product.category);

        // Parse tags back into category-specific filters
        const productTags = product.tags || [];
        const subCategoryValues = productTags.filter(tag => categoryFilters.subCategory.includes(tag));
        const styleValues = productTags.filter(tag => categoryFilters.style.includes(tag));
        const occasionValues = productTags.filter(tag => categoryFilters.occasion.includes(tag));

        // Get remaining tags that aren't category-specific filters
        const manualTags = productTags.filter(tag =>
            !categoryFilters.subCategory.includes(tag) &&
            !categoryFilters.style.includes(tag) &&
            !categoryFilters.occasion.includes(tag)
        );

        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            salePrice: product.salePrice || '',
            category: product.category,
            stock: product.stock,
            featured: product.featured,
            images: product.images || [],
            tags: manualTags.join(', '),
            material: product.material || '',
            dimensions: product.dimensions || '',
            colors: product.colors ? product.colors.join(', ') : '',
            customFields: customFieldsArray,
            // Category-specific filters
            subCategory: subCategoryValues,
            style: styleValues,
            occasion: occasionValues,
            plating: product.material || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            await productsAPI.delete(id);
            alert('Product deleted successfully!');
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product');
        }
    };

    const resetForm = () => {
        setEditingProduct(null);
        setExtractUrl('');
        setFormData({
            name: '',
            description: '',
            price: '',
            salePrice: '',
            category: 'Necklace',
            stock: '',
            featured: false,
            images: [],
            tags: '',
            material: '',
            dimensions: '',
            colors: '',
            customFields: [],
            // Category-specific filters
            subCategory: [],
            style: [],
            occasion: [],
            plating: ''
        });
    };

    if (loading) {
        return <div className="text-center py-8">Loading products...</div>;
    }

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-heading text-2xl font-bold text-gray-900">Product Management</h2>
                <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-gold-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Add Product
                </button>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Image</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Stock</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Featured</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {products.length > 0 ? (
                                products.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            {product.images && product.images.length > 0 ? (
                                                <img
                                                    src={getImageUrl(product.images[0])}
                                                    alt={product.name}
                                                    className="w-16 h-16 object-cover rounded-lg"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                                    <Upload className="w-6 h-6 text-gray-400" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-900">{product.name}</p>
                                            <p className="text-sm text-gray-600 truncate max-w-xs">{product.description}</p>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">{product.category}</td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-900">₹{product.price.toLocaleString()}</p>
                                            {product.salePrice && (
                                                <p className="text-sm text-green-600">Sale: ₹{product.salePrice.toLocaleString()}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${product.stock > 10 ? 'bg-green-100 text-green-700' :
                                                product.stock > 0 ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {product.featured ? (
                                                <span className="text-gold-500">⭐</span>
                                            ) : (
                                                <span className="text-gray-300">☆</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="text-purple-600 hover:text-purple-800 mr-3"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                        No products yet. Click "Add Product" to create one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-heading text-2xl font-bold text-gray-900">
                                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                                </h3>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* URL Extraction Section */}
                                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                                    <label className="block text-sm font-semibold text-purple-900 mb-2">
                                        <LinkIcon className="w-4 h-4 inline mr-2" />
                                        Extract from Product URL
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="url"
                                            value={extractUrl}
                                            onChange={(e) => setExtractUrl(e.target.value)}
                                            placeholder="Paste product URL (Amazon, Flipkart, etc.)"
                                            className="flex-1 px-4 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleExtractFromUrl}
                                            disabled={extractingUrl}
                                            className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {extractingUrl ? (
                                                <>
                                                    <Loader className="w-4 h-4 animate-spin" />
                                                    Extracting...
                                                </>
                                            ) : (
                                                'Extract'
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-xs text-purple-700 mt-2">
                                        Automatically extract product details from e-commerce websites
                                    </p>
                                </div>

                                {/* Image Upload Section */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Product Images
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-500 transition-colors">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            id="image-upload"
                                            disabled={uploadingImages}
                                        />
                                        <label htmlFor="image-upload" className="cursor-pointer">
                                            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                                            <p className="text-sm text-gray-600">
                                                {uploadingImages ? 'Uploading...' : 'Click to upload or drag and drop'}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 5MB</p>
                                        </label>
                                    </div>

                                    {/* Image Preview Grid */}
                                    {formData.images.length > 0 && (
                                        <div className="grid grid-cols-4 gap-3 mt-4">
                                            {formData.images.map((image, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={getImageUrl(image)}
                                                        alt={`Product ${index + 1}`}
                                                        className="w-full h-24 object-cover rounded-lg"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveImage(image)}
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹) *</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>

                                    {/* Only show Sale Price if Sales category is selected */}
                                    {formData.category === 'Sales' && (
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Sale Price (₹) *</label>
                                            <input
                                                type="number"
                                                required
                                                min="0"
                                                value={formData.salePrice}
                                                onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                                        <select
                                            required
                                            value={formData.category}
                                            onChange={(e) => handleCategoryChange(e.target.value)}
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            {categories.map((cat) => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Stock *</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={formData.stock}
                                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (comma-separated)</label>
                                    <input
                                        type="text"
                                        value={formData.tags}
                                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                        placeholder="e.g., gold, handmade, trending"
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                {/* Category-Specific Filters Section */}
                                {(() => {
                                    const categoryFilters = getCategoryFilters(formData.category);
                                    const hasFilters = categoryFilters.subCategory.length > 0 ||
                                        categoryFilters.style.length > 0 ||
                                        categoryFilters.occasion.length > 0 ||
                                        categoryFilters.color.length > 0 ||
                                        categoryFilters.plating.length > 0;

                                    if (!hasFilters) return null;

                                    return (
                                        <div className="border-t-2 border-gray-200 pt-4 mt-4">
                                            <h4 className="font-semibold text-gray-800 mb-3">Category-Specific Filters</h4>
                                            <p className="text-xs text-gray-600 mb-4">Select applicable filters for this product. These will help customers find products more easily.</p>

                                            <div className="space-y-4">
                                                {/* Sub-Category Filter */}
                                                {categoryFilters.subCategory.length > 0 && (
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Category Type</label>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {categoryFilters.subCategory.map((option) => (
                                                                <label key={option} className="flex items-center gap-2 cursor-pointer group">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={formData.subCategory.includes(option)}
                                                                        onChange={() => handleCategoryFilterChange('subCategory', option)}
                                                                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                                                    />
                                                                    <span className="text-sm text-gray-700 group-hover:text-purple-600 transition-colors">{option}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Style Filter */}
                                                {categoryFilters.style.length > 0 && (
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Style</label>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {categoryFilters.style.map((option) => (
                                                                <label key={option} className="flex items-center gap-2 cursor-pointer group">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={formData.style.includes(option)}
                                                                        onChange={() => handleCategoryFilterChange('style', option)}
                                                                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                                                    />
                                                                    <span className="text-sm text-gray-700 group-hover:text-purple-600 transition-colors">{option}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Occasion Filter */}
                                                {categoryFilters.occasion.length > 0 && (
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Occasion</label>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {categoryFilters.occasion.map((option) => (
                                                                <label key={option} className="flex items-center gap-2 cursor-pointer group">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={formData.occasion.includes(option)}
                                                                        onChange={() => handleCategoryFilterChange('occasion', option)}
                                                                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                                                    />
                                                                    <span className="text-sm text-gray-700 group-hover:text-purple-600 transition-colors">{option}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Color Filter */}
                                                {categoryFilters.color.length > 0 && (
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Available Colors</label>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            {categoryFilters.color.map((option) => (
                                                                <label key={option} className="flex items-center gap-2 cursor-pointer group">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={formData.colors.split(',').map(c => c.trim()).includes(option)}
                                                                        onChange={() => {
                                                                            const currentColors = formData.colors ? formData.colors.split(',').map(c => c.trim()).filter(c => c) : [];
                                                                            const newColors = currentColors.includes(option)
                                                                                ? currentColors.filter(c => c !== option)
                                                                                : [...currentColors, option];
                                                                            setFormData({ ...formData, colors: newColors.join(', ') });
                                                                        }}
                                                                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                                                    />
                                                                    <span className="text-sm text-gray-700 group-hover:text-purple-600 transition-colors">{option}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Plating Filter */}
                                                {categoryFilters.plating.length > 0 && (
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Plating</label>
                                                        <select
                                                            value={formData.plating}
                                                            onChange={(e) => setFormData({ ...formData, plating: e.target.value })}
                                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                        >
                                                            <option value="">Select Plating</option>
                                                            {categoryFilters.plating.map((option) => (
                                                                <option key={option} value={option}>{option}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Product Attributes Section */}
                                <div className="border-t-2 border-gray-200 pt-4 mt-4">
                                    <h4 className="font-semibold text-gray-800 mb-3">Product Attributes</h4>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Material</label>
                                            <input
                                                type="text"
                                                value={formData.material}
                                                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                                                placeholder="e.g., Gold Plated, Silver, Brass"
                                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Dimensions</label>
                                            <input
                                                type="text"
                                                value={formData.dimensions}
                                                onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                                                placeholder="e.g., 2.5cm x 1.5cm"
                                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Available Colors (comma-separated)</label>
                                        <input
                                            type="text"
                                            value={formData.colors}
                                            onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                                            placeholder="e.g., Gold, Silver, Rose Gold"
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                </div>

                                {/* Custom Fields Section */}
                                <div className="border-t-2 border-gray-200 pt-4 mt-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-semibold text-gray-800">Custom Fields</h4>
                                        <button
                                            type="button"
                                            onClick={handleAddCustomField}
                                            className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-lg hover:bg-purple-200 transition-colors"
                                        >
                                            + Add Field
                                        </button>
                                    </div>

                                    {formData.customFields.length > 0 ? (
                                        <div className="space-y-3">
                                            {formData.customFields.map((field, index) => (
                                                <div key={index} className="grid grid-cols-2 gap-3">
                                                    <input
                                                        type="text"
                                                        value={field.key}
                                                        onChange={(e) => handleCustomFieldChange(index, 'key', e.target.value)}
                                                        placeholder="Field name (e.g., Weight)"
                                                        className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    />
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={field.value}
                                                            onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)}
                                                            placeholder="Value (e.g., 10g)"
                                                            className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveCustomField(index)}
                                                            className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No custom fields added. Click "+ Add Field" to create one.</p>
                                    )}
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.featured}
                                            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                        />
                                        <span className="text-sm font-semibold text-gray-700">Featured Product</span>
                                    </label>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-purple-600 to-gold-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                                    >
                                        {editingProduct ? 'Update Product' : 'Create Product'}
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

export default ProductManagement;
