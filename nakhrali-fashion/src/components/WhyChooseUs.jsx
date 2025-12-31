import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { Truck, Shield, RotateCcw, Headphones, ChevronLeft, ChevronRight } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

const WhyChooseUs = () => {
    const swiperRef = useRef(null);

    const features = [
        {
            icon: Truck,
            title: 'Free Shipping',
            description: 'Free delivery on orders above ₹5,000 across India'
        },
        {
            icon: Shield,
            title: 'Certified Jewelry',
            description: 'All products come with authenticity certificates'
        },
        {
            icon: RotateCcw,
            title: 'Easy Returns',
            description: '30-day hassle-free return and exchange policy'
        },
        {
            icon: Headphones,
            title: 'Lifetime Support',
            description: 'Dedicated customer support for all your queries'
        },
        {
            icon: Shield,
            title: 'Secure Payments',
            description: '100% secure payment gateway with encryption'
        },
        {
            icon: Truck,
            title: 'Fast Delivery',
            description: 'Express shipping available for urgent orders'
        }
    ];

    return (
        <section className="py-16 bg-gradient-to-br from-purple-50 to-gold-50 relative">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Why Choose Us
                    </h2>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Experience luxury shopping with unmatched quality and service
                    </p>
                </div>

                <div className="relative">
                    {/* Swiper Slider */}
                    <Swiper
                        ref={swiperRef}
                        modules={[Navigation, Autoplay]}
                        spaceBetween={30}
                        slidesPerView={1}
                        navigation={{
                            nextEl: '.why-choose-button-next',
                            prevEl: '.why-choose-button-prev',
                        }}
                        autoplay={{
                            delay: 3000,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true,
                        }}
                        loop={true}
                        breakpoints={{
                            640: {
                                slidesPerView: 2,
                            },
                            1024: {
                                slidesPerView: 4,
                            },
                        }}
                        className="pb-4"
                    >
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <SwiperSlide key={index}>
                                    <div className="bg-white rounded-xl p-6 text-center hover:shadow-purple-lg transition-all duration-300 hover:-translate-y-2 h-full">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-purple-gold rounded-full mb-4">
                                            <Icon className="w-8 h-8 text-white" />
                                        </div>
                                        <h3 className="font-heading text-xl font-semibold text-gray-900 mb-2">
                                            {feature.title}
                                        </h3>
                                        <p className="text-gray-600">
                                            {feature.description}
                                        </p>
                                    </div>
                                </SwiperSlide>
                            );
                        })}
                    </Swiper>

                    {/* Custom Navigation Buttons */}
                    <button className="why-choose-button-prev absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 bg-white hover:bg-purple-500 text-purple-500 hover:text-white p-3 rounded-full shadow-lg transition-all duration-300 group">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button className="why-choose-button-next absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 bg-white hover:bg-purple-500 text-purple-500 hover:text-white p-3 rounded-full shadow-lg transition-all duration-300 group">
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;
