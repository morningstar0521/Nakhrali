import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const Testimonials = () => {
    const testimonials = [
        {
            id: 1,
            name: 'Priya Sharma',
            location: 'Mumbai',
            rating: 5,
            text: 'Absolutely stunning jewelry! The quality is exceptional and the designs are unique. I received so many compliments on my necklace.',
            image: 'https://i.pravatar.cc/150?img=1'
        },
        {
            id: 2,
            name: 'Anjali Patel',
            location: 'Delhi',
            rating: 5,
            text: 'Best online jewelry shopping experience! Fast delivery, beautiful packaging, and the earrings are even more gorgeous in person.',
            image: 'https://i.pravatar.cc/150?img=5'
        },
        {
            id: 3,
            name: 'Sneha Reddy',
            location: 'Bangalore',
            rating: 5,
            text: 'I love the personalized service and attention to detail. The team helped me choose the perfect gift for my mother. Highly recommended!',
            image: 'https://i.pravatar.cc/150?img=9'
        },
        {
            id: 4,
            name: 'Kavita Desai',
            location: 'Pune',
            rating: 5,
            text: 'The craftsmanship is outstanding! Every piece feels premium and the customer service is top-notch. Will definitely shop again.',
            image: 'https://i.pravatar.cc/150?img=10'
        },
        {
            id: 5,
            name: 'Meera Iyer',
            location: 'Chennai',
            rating: 5,
            text: 'Beautiful collection with authentic designs. The mangalsutra I bought is exactly what I was looking for. Thank you Nakhrali Fashion!',
            image: 'https://i.pravatar.cc/150?img=16'
        }
    ];

    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        What Our Customers Say
                    </h2>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Don't just take our word for it - hear from our happy customers
                    </p>
                </div>

                <div className="relative max-w-6xl mx-auto">
                    {/* Swiper Slider */}
                    <Swiper
                        modules={[Navigation, Pagination, Autoplay]}
                        spaceBetween={30}
                        slidesPerView={1}
                        navigation={{
                            nextEl: '.testimonials-button-next',
                            prevEl: '.testimonials-button-prev',
                        }}
                        pagination={{
                            clickable: true,
                            el: '.testimonials-pagination',
                        }}
                        autoplay={{
                            delay: 4000,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true,
                        }}
                        loop={true}
                        breakpoints={{
                            768: {
                                slidesPerView: 2,
                            },
                            1024: {
                                slidesPerView: 3,
                            },
                        }}
                        className="pb-12"
                    >
                        {testimonials.map((testimonial) => (
                            <SwiperSlide key={testimonial.id}>
                                <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-6 border border-purple-100 hover:shadow-purple-lg transition-all duration-300 h-full">
                                    <div className="flex items-center gap-4 mb-4">
                                        <img
                                            src={testimonial.image}
                                            alt={testimonial.name}
                                            className="w-16 h-16 rounded-full border-2 border-gold-500"
                                        />
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                                            <p className="text-sm text-gray-600">{testimonial.location}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-1 mb-4">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="w-5 h-5 fill-gold-500 text-gold-500" />
                                        ))}
                                    </div>

                                    <div className="relative">
                                        <Quote className="absolute -top-2 -left-2 w-8 h-8 text-purple-200" />
                                        <p className="text-gray-700 italic pl-6">
                                            "{testimonial.text}"
                                        </p>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Custom Navigation Buttons */}
                    <button className="testimonials-button-prev absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 bg-white hover:bg-purple-500 text-purple-500 hover:text-white p-3 rounded-full shadow-lg transition-all duration-300">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button className="testimonials-button-next absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 bg-white hover:bg-purple-500 text-purple-500 hover:text-white p-3 rounded-full shadow-lg transition-all duration-300">
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Custom Pagination */}
                    <div className="testimonials-pagination flex justify-center gap-2 mt-8"></div>
                </div>

                <div className="text-center mt-12">
                    <p className="text-gray-600 mb-4">Join thousands of satisfied customers</p>
                    <div className="flex items-center justify-center gap-2">
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-6 h-6 fill-gold-500 text-gold-500" />
                            ))}
                        </div>
                        <span className="text-gray-900 font-semibold text-lg">4.9/5</span>
                        <span className="text-gray-600">(2,450+ reviews)</span>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .testimonials-pagination :global(.swiper-pagination-bullet) {
          width: 12px;
          height: 12px;
          background: #6B46C1;
          opacity: 0.3;
          transition: all 0.3s;
        }
        .testimonials-pagination :global(.swiper-pagination-bullet-active) {
          opacity: 1;
          width: 32px;
          border-radius: 6px;
          background: linear-gradient(to right, #D4AF37, #6B46C1);
        }
      `}</style>
        </section>
    );
};

export default Testimonials;
