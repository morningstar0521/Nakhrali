import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { ArrowRight } from 'lucide-react';
import { bannersAPI } from '../utils/api';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const HeroBanner = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const data = await bannersAPI.getActive();
            setBanners(data.banners || []);
        } catch (error) {
            console.error('Error fetching banners:', error);
            // Fallback to default banner if API fails
            setBanners([{
                id: 'default',
                image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200',
                title: 'Designed for You',
                subtitle: 'Handcrafted Luxury',
                description: 'Discover our exquisite collection of handcrafted jewelry that celebrates your unique style and elegance.',
                primary_cta: 'Shop Collection',
                secondary_cta: 'Explore Categories'
            }]);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200';
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }
        return `http://localhost:5001${imageUrl}`;
    };

    if (loading) {
        return (
            <section className="relative h-[500px] md:h-[600px] bg-gradient-to-r from-purple-900 to-purple-600 flex items-center justify-center">
                <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                    <p>Loading banners...</p>
                </div>
            </section>
        );
    }

    if (banners.length === 0) {
        return (
            <section className="relative h-[500px] md:h-[600px] bg-gradient-to-r from-purple-900 to-purple-600 flex items-center justify-center">
                <div className="container mx-auto px-4 text-center text-white">
                    <h2 className="font-heading text-4xl md:text-6xl font-bold mb-6">Welcome to Nakhrali Fashion</h2>
                    <p className="text-lg md:text-xl text-purple-100 mb-8">Handcrafted Luxury Jewelry</p>
                    <button className="btn-primary">Shop Collection</button>
                </div>
            </section>
        );
    }

    return (
        <section className="relative h-[500px] md:h-[600px] overflow-hidden">
            <Swiper
                modules={[Navigation, Pagination, Autoplay, EffectFade]}
                navigation={{
                    nextEl: '.hero-swiper-button-next',
                    prevEl: '.hero-swiper-button-prev',
                }}
                pagination={{
                    clickable: true,
                    el: '.hero-swiper-pagination',
                }}
                autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                }}
                effect="fade"
                fadeEffect={{
                    crossFade: true
                }}
                loop={banners.length > 1}
                className="h-full"
            >
                {banners.map((banner) => (
                    <SwiperSlide key={banner.id}>
                        <div className="relative h-full">
                            {/* Background with gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 to-purple-600/70">
                                <div
                                    className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-40"
                                    style={{ backgroundImage: `url(${getImageUrl(banner.image)})` }}
                                ></div>
                            </div>

                            {/* Content */}
                            <div className="relative container mx-auto px-4 h-full flex items-center">
                                <div className="max-w-2xl text-white animate-fade-in">
                                    <p className="font-script text-gold-300 text-3xl md:text-4xl mb-4">
                                        {banner.subtitle || 'Handcrafted Luxury'}
                                    </p>
                                    <h2 className="font-heading text-4xl md:text-6xl font-bold mb-6 leading-tight">
                                        {banner.title}
                                    </h2>
                                    <p className="text-lg md:text-xl text-purple-100 mb-8 max-w-xl">
                                        {banner.description}
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        {banner.redirect_link ? (
                                            <Link
                                                to={banner.redirect_link}
                                                className="btn-primary group inline-flex items-center justify-center"
                                            >
                                                {banner.primary_cta || 'Shop Collection'}
                                                <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        ) : (
                                            <button className="btn-primary group">
                                                {banner.primary_cta || 'Shop Collection'}
                                                <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        )}
                                        {banner.redirect_link ? (
                                            <Link
                                                to={banner.redirect_link}
                                                className="btn-outline bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white/20 inline-flex items-center justify-center"
                                            >
                                                {banner.secondary_cta || 'Explore Categories'}
                                            </Link>
                                        ) : (
                                            <button className="btn-outline bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white/20">
                                                {banner.secondary_cta || 'Explore Categories'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Custom Navigation Arrows - Only show if multiple banners */}
            {banners.length > 1 && (
                <>
                    <button className="hero-swiper-button-prev absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 group">
                        <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button className="hero-swiper-button-next absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 group">
                        <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Custom Pagination Dots */}
                    <div className="hero-swiper-pagination absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2"></div>
                </>
            )}

            {/* Decorative gradient at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-warm-white to-transparent pointer-events-none"></div>

            <style jsx>{`
        .hero-swiper-pagination :global(.swiper-pagination-bullet) {
          width: 12px;
          height: 12px;
          background: white;
          opacity: 0.5;
          transition: all 0.3s;
        }
        .hero-swiper-pagination :global(.swiper-pagination-bullet-active) {
          opacity: 1;
          width: 32px;
          border-radius: 6px;
          background: linear-gradient(to right, #D4AF37, #6B46C1);
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
        </section>
    );
};

export default HeroBanner;
