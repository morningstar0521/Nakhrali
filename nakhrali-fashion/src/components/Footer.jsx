import React from 'react';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import InstagramFeed from './InstagramFeed';

const Footer = () => {
    return (
        <footer className="bg-purple-900 text-white">
            {/* Instagram Section */}
            <InstagramFeed />

            {/* Main Footer */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* About */}
                    <div>
                        <h4 className="font-heading text-xl font-bold mb-4 text-gold-300">About Nakhrali Fashion</h4>
                        <p className="text-purple-200 mb-4">
                            Crafting exquisite jewelry pieces that celebrate your unique style and elegance since 2024.
                        </p>
                        <div className="flex gap-3">
                            <a href="#" className="bg-purple-800 p-2 rounded-full hover:bg-gold-500 hover:text-gray-900 transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="https://www.instagram.com/nakhrali.fashion/" target="_blank" rel="noopener noreferrer" className="bg-purple-800 p-2 rounded-full hover:bg-gold-500 hover:text-gray-900 transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="bg-purple-800 p-2 rounded-full hover:bg-gold-500 hover:text-gray-900 transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="bg-purple-800 p-2 rounded-full hover:bg-gold-500 hover:text-gray-900 transition-colors">
                                <Youtube className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-heading text-xl font-bold mb-4 text-gold-300">Quick Links</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-purple-200 hover:text-gold-300 transition-colors">About Us</a></li>
                            <li><a href="#" className="text-purple-200 hover:text-gold-300 transition-colors">Collections</a></li>
                            <li><a href="#" className="text-purple-200 hover:text-gold-300 transition-colors">New Arrivals</a></li>
                            <li><a href="#" className="text-purple-200 hover:text-gold-300 transition-colors">Sale</a></li>
                            <li><a href="#" className="text-purple-200 hover:text-gold-300 transition-colors">Blog</a></li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h4 className="font-heading text-xl font-bold mb-4 text-gold-300">Customer Service</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-purple-200 hover:text-gold-300 transition-colors">Contact Us</a></li>
                            <li><a href="#" className="text-purple-200 hover:text-gold-300 transition-colors">Shipping & Delivery</a></li>
                            <li><a href="#" className="text-purple-200 hover:text-gold-300 transition-colors">Returns & Exchanges</a></li>
                            <li><a href="#" className="text-purple-200 hover:text-gold-300 transition-colors">Size Guide</a></li>
                            <li><a href="#" className="text-purple-200 hover:text-gold-300 transition-colors">FAQs</a></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-heading text-xl font-bold mb-4 text-gold-300">Contact Us</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-gold-500 flex-shrink-0 mt-1" />
                                <span className="text-purple-200">123 Jewelry Street, Mumbai, Maharashtra 400001</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-gold-500 flex-shrink-0" />
                                <span className="text-purple-200">+91 98765 43210</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-gold-500 flex-shrink-0" />
                                <span className="text-purple-200">info@nakhralifashion.com</span>
                            </li>
                            <br/>
                             <li className="flex items-center gap-3">
                                <text className="w-5 h-5 text-gold-500 flex-shrink-0" />
                                <span className="text-purple-200"><i>~made with ❤️ by Morningstar</i></span>
                            </li>

                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-purple-800">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-purple-300 text-sm">
                            © 2024 Nakhrali Fashion. All rights reserved.
                        </p>
                        <div className="flex gap-6 text-sm">
                            <a href="#" className="text-purple-300 hover:text-gold-300 transition-colors">Privacy Policy</a>
                            <a href="#" className="text-purple-300 hover:text-gold-300 transition-colors">Terms of Service</a>
                            <a href="#" className="text-purple-300 hover:text-gold-300 transition-colors">Cookie Policy</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
