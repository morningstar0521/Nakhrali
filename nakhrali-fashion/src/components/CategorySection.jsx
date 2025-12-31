import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CategorySection = () => {
    const navigate = useNavigate();
    
    const categories = [
        {
            id: 1,
            name: 'Shop by Price',
            description: 'Find jewelry that fits your budget',
            image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400',
            link: '/products?category=Sales',
            icon: '₹',
            type: 'navigate'
        },
        {
            id: 2,
            name: 'Shop by Occasion',
            description: 'Perfect pieces for every celebration',
            image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400',
            link: '/products?category=Gift Hampers',
            icon: '🎉',
            type: 'navigate'
        },
        {
            id: 3,
            name: 'Special Offers',
            description: 'Exclusive deals and discounts',
            image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400',
            link: '/products?category=Sales',
            icon: '🎁',
            type: 'navigate'
        }
    ];

    const handleClick = (e, category) => {
        e.preventDefault();
        if (category.type === 'navigate') {
            navigate(category.link);
        } else if (category.type === 'scroll') {
            // Scroll to the occasion section on the homepage
            const occasionSection = document.querySelector('.gift-hampers-section');
            if (occasionSection) {
                occasionSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } else {
            // Default hash link behavior
            window.location.hash = category.link;
        }
    };

    return (
        <section className="py-16 bg-cream">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Shop by Category
                    </h2>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Browse our curated collections of exquisite jewelry pieces
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            onClick={(e) => handleClick(e, category)}
                            className="group card overflow-hidden cursor-pointer"
                        >
                            <div className="relative h-64 overflow-hidden">
                                <img
                                    src={category.image}
                                    alt={category.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                {category.icon && (
                                    <div className="absolute top-4 right-4 bg-gold-500 text-gray-900 w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold">
                                        {category.icon}
                                    </div>
                                )}
                            </div>
                            <div className="p-6">
                                <h3 className="font-heading text-2xl font-semibold text-gray-900 mb-2 group-hover:text-purple-500 transition-colors">
                                    {category.name}
                                </h3>
                                <p className="text-gray-600 mb-4">{category.description}</p>
                                <span className="inline-flex items-center text-purple-500 font-semibold group-hover:text-gold-500 transition-colors">
                                    Explore
                                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategorySection;
