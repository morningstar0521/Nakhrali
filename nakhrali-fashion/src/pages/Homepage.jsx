import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroBanner from '../components/HeroBanner';
import CategorySection from '../components/CategorySection';
import FeaturedCollections from '../components/FeaturedCollections';
import WhyChooseUs from '../components/WhyChooseUs';
import Testimonials from '../components/Testimonials';
import { occasionsAPI } from '../utils/api';
import { Gift, ArrowRight } from 'lucide-react';

const Homepage = () => {
    const navigate = useNavigate();
    const [occasions, setOccasions] = useState([]);

    useEffect(() => {
        fetchOccasions();
    }, []);

    const fetchOccasions = async () => {
        try {
            const response = await occasionsAPI.getActive();
            console.log('Fetched occasions:', response.occasions);
            if (response.occasions && response.occasions.length > 0) {
                console.log('First occasion ID:', response.occasions[0].id);
                console.log('First occasion title:', response.occasions[0].title);
            }
            setOccasions(response.occasions || []);
        } catch (error) {
            console.error('Error fetching occasions:', error);
        }
    };

    const handleOccasionClick = (occasionId) => {
        console.log('Clicking occasion with ID:', occasionId);
        navigate(`/hamper-options/${occasionId}`);
    };

    return (
        <>
            <HeroBanner />
            <CategorySection />
            
            {/* Gift Hampers by Occasion Section */}
            <section className="gift-hampers-section py-16 bg-gradient-to-br from-purple-50 to-gold-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            <Gift className="inline-block w-10 h-10 mb-2 text-purple-600" />
                            <br />
                            Gift Hampers by Occasion
                        </h2>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            Select an occasion to explore our curated gift hampers
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        {occasions.map((occasion) => (
                            <button
                                key={occasion.id}
                                onClick={() => handleOccasionClick(occasion.id)}
                                className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center group"
                            >
                                {occasion.icon && (
                                    <div className="text-4xl mb-3">{occasion.icon}</div>
                                )}
                                <h3 className="font-heading text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                                    {occasion.title}
                                </h3>
                                <div className="flex items-center justify-center text-purple-600 text-sm font-semibold group-hover:gap-1 transition-all">
                                    <span>View</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <FeaturedCollections />
            <WhyChooseUs />
            <Testimonials />
        </>
    );
};

export default Homepage;
