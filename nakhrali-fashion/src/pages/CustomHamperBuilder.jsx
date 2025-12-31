import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI, boxesAPI } from '../utils/api';
import { addToCart } from '../utils/cartUtils';
import { Plus, Minus, Trash2, Package, IndianRupee, ShoppingCart, X, Wallet, AlertCircle } from 'lucide-react';

const CustomHamperBuilder = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [boxes, setBoxes] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [selectedBox, setSelectedBox] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [budget, setBudget] = useState('');
    const [budgetSet, setBudgetSet] = useState(false);
    const [showBudgetWarning, setShowBudgetWarning] = useState(false);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        if (budgetSet) {
            fetchData();
        }
    }, [budgetSet]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [productsRes, boxesRes] = await Promise.all([
                productsAPI.getAll(),
                boxesAPI.getActive()
            ]);

            const allProducts = productsRes.products || [];
            setProducts(allProducts);
            setBoxes(boxesRes.boxes || []);

            // Extract unique categories, excluding 'sales'
            const uniqueCategories = [...new Set(
                allProducts
                    .map(p => p.category)
                    .filter(cat => cat && cat.toLowerCase() !== 'sales')
            )];
            setCategories(uniqueCategories);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return 'https://via.placeholder.com/200';
        if (imagePath.startsWith('http')) return imagePath;
        return `http://localhost:5001${imagePath}`;
    };

    const addProduct = (product) => {
        const existing = selectedProducts.find(p => p.id === product.id);
        let newTotal;
        
        if (existing) {
            newTotal = calculateTotal() + parseFloat(product.price);
        } else {
            newTotal = calculateTotal() + parseFloat(product.price);
        }

        if (newTotal > parseFloat(budget)) {
            setShowBudgetWarning(true);
            setTimeout(() => setShowBudgetWarning(false), 3000);
            return;
        }

        if (existing) {
            setSelectedProducts(selectedProducts.map(p =>
                p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
            ));
        } else {
            setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
        }
    };

    const updateQuantity = (productId, change) => {
        if (change > 0) {
            const product = selectedProducts.find(p => p.id === productId);
            const newTotal = calculateTotal() + parseFloat(product.price);
            
            if (newTotal > parseFloat(budget)) {
                setShowBudgetWarning(true);
                setTimeout(() => setShowBudgetWarning(false), 3000);
                return;
            }
        }

        setSelectedProducts(selectedProducts.map(p => {
            if (p.id === productId) {
                const newQuantity = p.quantity + change;
                return newQuantity > 0 ? { ...p, quantity: newQuantity } : p;
            }
            return p;
        }).filter(p => p.quantity > 0));
    };

    const removeProduct = (productId) => {
        setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
    };

    const handleSelectBox = (box) => {
        const currentTotal = selectedProducts.reduce((sum, p) => sum + (parseFloat(p.price) * p.quantity), 0);
        const newTotal = currentTotal + parseFloat(box.price);

        if (selectedBox?.id === box.id) {
            setSelectedBox(null);
            return;
        }

        if (newTotal > parseFloat(budget)) {
            setShowBudgetWarning(true);
            setTimeout(() => setShowBudgetWarning(false), 3000);
            return;
        }

        setSelectedBox(box);
    };

    const calculateTotal = () => {
        let total = selectedProducts.reduce((sum, p) => sum + (parseFloat(p.price) * p.quantity), 0);
        if (selectedBox) {
            total += parseFloat(selectedBox.price);
        }
        return total;
    };

    const getRemainingBudget = () => {
        return parseFloat(budget) - calculateTotal();
    };

    const handleSetBudget = (e) => {
        e.preventDefault();
        if (parseFloat(budget) > 0) {
            setBudgetSet(true);
        }
    };

    const handleResetBudget = () => {
        setBudgetSet(false);
        setBudget('');
        setSelectedProducts([]);
        setSelectedBox(null);
    };

    const handleCheckout = () => {
        if (selectedProducts.length === 0) {
            alert('Please add at least one product to your hamper');
            return;
        }

        // Create a custom hamper product object
        const customHamper = {
            id: `custom-hamper-${Date.now()}`, // Unique ID for the custom hamper
            name: `Custom Hamper${selectedBox ? ` with ${selectedBox.name}` : ''}`,
            description: `Custom hamper with ${selectedProducts.length} product${selectedProducts.length > 1 ? 's' : ''}${selectedBox ? ` and ${selectedBox.name} gift box` : ''}`,
            price: calculateTotal(),
            category: 'Custom Hamper',
            images: [selectedProducts[0]?.images?.[0] || 'https://via.placeholder.com/400'],
            customHamper: true, // Flag to identify custom hampers
            hamperDetails: {
                products: selectedProducts.map(p => ({
                    id: p.id,
                    name: p.name,
                    quantity: p.quantity,
                    price: p.price,
                    image: p.images?.[0]
                })),
                box: selectedBox ? {
                    id: selectedBox.id,
                    name: selectedBox.name,
                    price: selectedBox.price,
                    image: selectedBox.image
                } : null,
                budget: budget
            }
        };

        // Add to cart
        addToCart(customHamper, 1);

        // Show success message
        const confirmGoToCart = window.confirm(
            `Custom hamper added to cart!\n\nTotal: ₹${calculateTotal().toLocaleString()}\n\nWould you like to view your cart?`
        );

        if (confirmGoToCart) {
            navigate('/cart');
        } else {
            // Reset the builder
            setSelectedProducts([]);
            setSelectedBox(null);
            setBudgetSet(false);
            setBudget('');
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
        const notSales = p.category?.toLowerCase() !== 'sales';
        return matchesSearch && matchesCategory && notSales;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-gold-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    // Budget Setting Screen
    if (!budgetSet) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-gold-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 text-purple-600 mb-6">
                            <Wallet className="w-10 h-10" />
                        </div>
                        <h1 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                            Set Your Budget
                        </h1>
                        <p className="text-gray-600">
                            Tell us your budget and we'll help you create the perfect hamper within your range
                        </p>
                    </div>

                    <form onSubmit={handleSetBudget} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Choose Your Budget
                            </label>
                            
                            {/* Preset Budget Options */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                {[500, 1000, 2000, 3000, 5000, 10000].map((amount) => (
                                    <button
                                        key={amount}
                                        type="button"
                                        onClick={() => setBudget(amount.toString())}
                                        className={`p-4 border-2 rounded-xl transition-all ${
                                            budget === amount.toString()
                                                ? 'border-purple-600 bg-purple-50 text-purple-600'
                                                : 'border-gray-200 hover:border-purple-300 text-gray-700'
                                        }`}
                                    >
                                        <div className="flex items-center justify-center font-bold text-lg">
                                            <IndianRupee className="w-5 h-5" />
                                            {amount.toLocaleString()}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Custom Budget Input */}
                            <div className="pt-4 border-t border-gray-200">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Or Enter Custom Amount
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                        <IndianRupee className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="number"
                                        value={budget}
                                        onChange={(e) => setBudget(e.target.value)}
                                        placeholder="Enter custom budget"
                                        min="100"
                                        step="1"
                                        className="w-full pl-12 pr-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <p className="mt-2 text-sm text-gray-500">
                                    Minimum budget: ₹100
                                </p>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={!budget || parseFloat(budget) < 100}
                            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                        >
                            Continue to Build Hamper
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <button
                            onClick={() => navigate('/hamper-options')}
                            className="w-full text-gray-600 hover:text-gray-900 font-medium"
                        >
                            ← Back to Options
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-gold-50 py-8 md:py-16">
            <div className="container mx-auto px-4">
                {/* Header with Budget Info */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h1 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                Build Your Custom Hamper
                            </h1>
                            <p className="text-gray-600">
                                Select products within your budget
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <div className="bg-purple-50 px-6 py-3 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Total Budget</p>
                                <p className="text-2xl font-bold text-purple-600 flex items-center">
                                    <IndianRupee className="w-6 h-6" />
                                    {parseFloat(budget).toLocaleString()}
                                </p>
                            </div>
                            <button
                                onClick={handleResetBudget}
                                className="text-sm text-gray-600 hover:text-purple-600 font-medium"
                            >
                                Change Budget
                            </button>
                        </div>
                    </div>

                    {/* Budget Progress Bar */}
                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600">Budget Used</span>
                            <span className={`text-sm font-bold ${getRemainingBudget() < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                {((calculateTotal() / parseFloat(budget)) * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className={`h-3 rounded-full transition-all ${
                                    getRemainingBudget() < 0 
                                        ? 'bg-red-500' 
                                        : getRemainingBudget() < parseFloat(budget) * 0.1 
                                        ? 'bg-yellow-500' 
                                        : 'bg-gradient-to-r from-purple-600 to-purple-500'
                                }`}
                                style={{ width: `${Math.min((calculateTotal() / parseFloat(budget)) * 100, 100)}%` }}
                            />
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-gray-600">
                                Spent: <span className="font-semibold">₹{calculateTotal().toLocaleString()}</span>
                            </span>
                            <span className={`text-sm font-semibold ${getRemainingBudget() < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                Remaining: ₹{getRemainingBudget().toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Budget Warning Alert */}
                {showBudgetWarning && (
                    <div className="fixed top-4 right-4 z-50 animate-bounce">
                        <div className="bg-red-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
                            <AlertCircle className="w-6 h-6" />
                            <div>
                                <p className="font-bold">Budget Exceeded!</p>
                                <p className="text-sm">Cannot add item - exceeds your budget</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Product Selection */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                            <h2 className="font-heading text-2xl font-bold text-gray-900 mb-4">
                                Select Products
                            </h2>
                            
                            {/* Category Selection */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Select Category
                                </label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white font-medium"
                                >
                                    <option value="all">All Categories</option>
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Search Input */}
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                                {filteredProducts.map((product) => {
                                    const wouldExceedBudget = (calculateTotal() + parseFloat(product.price)) > parseFloat(budget);
                                    const isAdded = selectedProducts.some(p => p.id === product.id);
                                    
                                    return (
                                        <div 
                                            key={product.id} 
                                            className={`border rounded-lg p-4 transition-all ${
                                                wouldExceedBudget && !isAdded
                                                    ? 'border-gray-200 bg-gray-50 opacity-60'
                                                    : 'border-gray-200 hover:shadow-md hover:border-purple-200'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <img
                                                    src={getImageUrl(product.images?.[0])}
                                                    alt={product.name}
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                                                        {product.name}
                                                    </h3>
                                                    <p className={`font-bold flex items-center text-sm ${
                                                        wouldExceedBudget && !isAdded ? 'text-gray-400' : 'text-purple-600'
                                                    }`}>
                                                        <IndianRupee className="w-3 h-3" />
                                                        {parseFloat(product.price).toLocaleString()}
                                                    </p>
                                                    {isAdded && (
                                                        <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                                            Added
                                                        </span>
                                                    )}
                                                    {wouldExceedBudget && !isAdded ? (
                                                        <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" />
                                                            Exceeds budget
                                                        </p>
                                                    ) : (
                                                        <button
                                                            onClick={() => addProduct(product)}
                                                            className="mt-2 text-purple-600 hover:text-purple-700 text-sm font-semibold flex items-center gap-1"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                            {isAdded ? 'Add More' : 'Add'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Box Selection */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="font-heading text-2xl font-bold text-gray-900 mb-4">
                                Select Gift Box (Optional)
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {boxes.map((box) => {
                                    const wouldExceedBudget = !selectedBox && (calculateTotal() + parseFloat(box.price)) > parseFloat(budget);
                                    const isSelected = selectedBox?.id === box.id;
                                    return (
                                        <button
                                            key={box.id}
                                            onClick={() => handleSelectBox(box)}
                                            disabled={wouldExceedBudget && !isSelected}
                                            className={`relative overflow-hidden rounded-xl border-2 transition-all text-left ${
                                                isSelected
                                                    ? 'border-purple-600 bg-purple-50 shadow-lg'
                                                    : wouldExceedBudget
                                                    ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                                                    : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                                            }`}
                                        >
                                            {/* Box Image */}
                                            <div className="relative h-32 bg-gray-100">
                                                <img
                                                    src={getImageUrl(box.image)}
                                                    alt={box.name}
                                                    className="w-full h-full object-cover"
                                                />
                                                {isSelected && (
                                                    <div className="absolute top-2 right-2 bg-purple-600 text-white rounded-full p-1">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Box Details */}
                                            <div className="p-3">
                                                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{box.name}</h3>
                                                {box.description && (
                                                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{box.description}</p>
                                                )}
                                                
                                                {/* Box Attributes */}
                                                <div className="flex flex-wrap gap-1 mb-2 text-xs">
                                                    {box.dimensions && (
                                                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                                            📏 {box.dimensions}
                                                        </span>
                                                    )}
                                                    {box.color && (
                                                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                                            🎨 {box.color}
                                                        </span>
                                                    )}
                                                    {box.material && (
                                                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                                            ✨ {box.material}
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <div className={`font-bold flex items-center ${
                                                    wouldExceedBudget && !isSelected ? 'text-gray-400' : 'text-purple-600'
                                                }`}>
                                                    <IndianRupee className="w-4 h-4" />
                                                    {parseFloat(box.price).toLocaleString()}
                                                </div>
                                                
                                                {wouldExceedBudget && !isSelected && (
                                                    <p className="text-xs text-red-600 mt-1">Exceeds budget</p>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Summary Sidebar */}
                    <div>
                        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-heading text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <Package className="w-6 h-6 text-purple-600" />
                                    Your Hamper
                                </h2>
                                <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                                    {selectedProducts.length} items
                                </div>
                            </div>

                            {selectedProducts.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">
                                    No products added yet
                                </p>
                            ) : (
                                <>
                                    <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                                        {selectedProducts.map((product) => (
                                            <div key={product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <img
                                                    src={getImageUrl(product.images?.[0])}
                                                    alt={product.name}
                                                    className="w-12 h-12 object-cover rounded"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 text-sm truncate">
                                                        {product.name}
                                                    </p>
                                                    <p className="text-purple-600 text-sm flex items-center">
                                                        <IndianRupee className="w-3 h-3" />
                                                        {parseFloat(product.price).toLocaleString()} × {product.quantity}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => updateQuantity(product.id, -1)}
                                                        className="p-1 hover:bg-gray-200 rounded"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => updateQuantity(product.id, 1)}
                                                        className="p-1 hover:bg-gray-200 rounded"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => removeProduct(product.id)}
                                                        className="p-1 hover:bg-red-100 text-red-600 rounded"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {selectedBox && (
                                        <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-gray-900">Gift Box: {selectedBox.name}</span>
                                                <span className="text-purple-600 font-bold flex items-center">
                                                    <IndianRupee className="w-4 h-4" />
                                                    {parseFloat(selectedBox.price).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="border-t pt-4 mb-4">
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center justify-between text-gray-600">
                                                <span>Subtotal</span>
                                                <span className="font-semibold flex items-center">
                                                    <IndianRupee className="w-4 h-4" />
                                                    {calculateTotal().toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-gray-600">
                                                <span>Budget</span>
                                                <span className="font-semibold flex items-center">
                                                    <IndianRupee className="w-4 h-4" />
                                                    {parseFloat(budget).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-xl font-bold pt-3 border-t">
                                            <span>Remaining</span>
                                            <span className={`flex items-center ${
                                                getRemainingBudget() < 0 ? 'text-red-600' : 'text-green-600'
                                            }`}>
                                                <IndianRupee className="w-6 h-6" />
                                                {getRemainingBudget().toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleCheckout}
                                        disabled={selectedProducts.length === 0}
                                        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <ShoppingCart className="w-5 h-5" />
                                        Add to Cart
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomHamperBuilder;
