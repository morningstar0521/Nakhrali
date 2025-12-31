import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { hampersAPI, occasionsAPI } from '../utils/api';
import { Package, IndianRupee, Filter } from 'lucide-react';

const SuggestedHampers = () => {
    const navigate = useNavigate();
    const { occasionId: pathOccasionId } = useParams();
    const [searchParams] = useSearchParams();
    const occasionId = pathOccasionId || searchParams.get('occasion');
    const [hampers, setHampers] = useState([]);
    const [occasions, setOccasions] = useState([]);
    const [selectedOccasion, setSelectedOccasion] = useState('all');
    const [occasionName, setOccasionName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (occasionId) {
            fetchData();
        }
    }, [occasionId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            console.log('Fetching hampers for occasion ID:', occasionId);
            const [hampersRes, occasionsRes] = await Promise.all([
                hampersAPI.getByOccasion(occasionId),
                occasionsAPI.getActive()
            ]);
            console.log('Hampers response:', hampersRes);
            setHampers(hampersRes.hampers || []);
            const occasion = occasionsRes.occasions?.find(o => o.id === occasionId);
            setOccasionName(occasion?.title || '');
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return 'https://via.placeholder.com/400';
        if (imagePath.startsWith('http')) return imagePath;
        return `http://localhost:5001${imagePath}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-gold-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    // Redirect to home if no occasion selected
    if (!occasionId) {
        navigate('/');
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-gold-50 py-16">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="font-heading text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        {occasionName} Hampers
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Discover our curated hampers for {occasionName}
                    </p>
                    <button
                        onClick={() => navigate(`/hamper-options/${occasionId}`)}
                        className="mt-4 text-purple-600 hover:text-purple-700 font-semibold"
                    >
                        ← Back to Options
                    </button>
                </div>

                {/* Hampers Grid */}
                {hampers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {hampers.map((hamper) => (
                            <div
                                key={hamper.id}
                                onClick={() => navigate(`/hamper/${hamper.id}`)}
                                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
                            >
                                <div className="relative h-64">
                                    <img
                                        src={getImageUrl(hamper.image)}
                                        alt={hamper.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-6">
                                    <h3 className="font-heading text-xl font-bold text-gray-900 mb-2">
                                        {hamper.name}
                                    </h3>
                                    {hamper.occasion_name && (
                                        <p className="text-sm text-purple-600 mb-2">
                                            {hamper.occasion_name}
                                        </p>
                                    )}
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        {hamper.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                                            <Package className="w-4 h-4" />
                                            <span>{hamper.products?.length || 0} items</span>
                                        </div>
                                        <div className="flex items-center text-purple-600 font-bold text-xl">
                                            <IndianRupee className="w-5 h-5" />
                                            <span>{parseFloat(hamper.total_price).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">No hampers found for this occasion</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuggestedHampers;
