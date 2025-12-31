import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Gift, Sparkles, Package } from 'lucide-react';
import { occasionsAPI } from '../utils/api';

const HamperOptions = () => {
    const navigate = useNavigate();
    const { occasionId: pathOccasionId } = useParams();
    const [searchParams] = useSearchParams();
    const occasionId = pathOccasionId || searchParams.get('occasion');
    const [occasionName, setOccasionName] = useState('');

    useEffect(() => {
        if (occasionId) {
            fetchOccasionName();
        }
    }, [occasionId]);

    const fetchOccasionName = async () => {
        try {
            const response = await occasionsAPI.getActive();
            const occasion = response.occasions?.find(o => o.id === occasionId);
            setOccasionName(occasion?.title || '');
        } catch (error) {
            console.error('Error fetching occasion:', error);
        }
    };

    const handleSuggestedHampersClick = () => {
        if (occasionId) {
            navigate(`/suggested-hampers/${occasionId}`);
        } else {
            navigate('/suggested-hampers');
        }
    };

    const options = [
        {
            id: 'suggested',
            title: 'Suggested Hampers',
            description: 'Browse our curated collection of pre-made hampers for every occasion',
            icon: <Gift className="w-12 h-12" />,
            color: 'purple',
            onClick: handleSuggestedHampersClick
        },
        {
            id: 'custom',
            title: 'Build Your Own Hamper',
            description: 'Create a personalized hamper by selecting your favorite products',
            icon: <Sparkles className="w-12 h-12" />,
            color: 'gold',
            onClick: () => navigate('/custom-hamper')
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-gold-50 py-16">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="font-heading text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        {occasionId ? `${occasionName} Gift Hampers` : 'Gift Hamper Options'}
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Choose how you'd like to create your perfect gift hamper
                    </p>
                    {occasionId && (
                        <button
                            onClick={() => navigate('/')}
                            className="mt-4 text-purple-600 hover:text-purple-700 font-semibold"
                        >
                            ← Back to Home
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {options.map((option) => (
                        <button
                            key={option.id}
                            onClick={option.onClick}
                            className={`bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-left group`}
                        >
                            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-${option.color}-100 text-${option.color}-600 mb-6 group-hover:scale-110 transition-transform`}>
                                {option.icon}
                            </div>
                            <h2 className="font-heading text-2xl font-bold text-gray-900 mb-3">
                                {option.title}
                            </h2>
                            <p className="text-gray-600">
                                {option.description}
                            </p>
                            <div className={`mt-6 flex items-center text-${option.color}-600 font-semibold group-hover:gap-2 transition-all`}>
                                <span>Get Started</span>
                                <span className="transform group-hover:translate-x-2 transition-transform">→</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HamperOptions;
