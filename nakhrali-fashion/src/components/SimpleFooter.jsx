import React from 'react';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const SimpleFooter = () => {
    return (
        <footer className="bg-purple-900 text-white">
            {/* Main Footer */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* About */}
                    <div>
                        <h3 className="font-heading text-xl font-bold mb-4">Nakhrali Fashion</h3>
                        <p className="text-purple-200 text-sm mb-4">
                            Handcrafted luxury jewelry designed to celebrate your unique style and elegance.
                        </p>
                        <div className="flex gap-3">
                            <a href="#" className="w-10 h-10 bg-purple-800 rounded-full flex items-center justify-center hover:bg-gold-500 transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="https://www.instagram.com/nakhrali.fashion/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-purple-800 rounded-full flex items-center justify-center hover:bg-gold-500 transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 bg-purple-800 rounded-full flex items-center justify-center hover:bg-gold-500 transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 bg-purple-800 rounded-full flex items-center justify-center hover:bg-gold-500 transition-colors">
                                <Youtube className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-heading text-lg font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-purple-200 text-sm">
                            <li><a href="/" className="hover:text-gold-300 transition-colors">Home</a></li>
                            <li><a href="#" className="hover:text-gold-300 transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-gold-300 transition-colors">Collections</a></li>
                            <li><a href="#" className="hover:text-gold-300 transition-colors">New Arrivals</a></li>
                            <li><a href="#" className="hover:text-gold-300 transition-colors">Sale</a></li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h3 className="font-heading text-lg font-semibold mb-4">Customer Service</h3>
                        <ul className="space-y-2 text-purple-200 text-sm">
                            <li><a href="#" className="hover:text-gold-300 transition-colors">Contact Us</a></li>
                            <li><a href="#" className="hover:text-gold-300 transition-colors">Shipping Info</a></li>
                            <li><a href="#" className="hover:text-gold-300 transition-colors">Returns</a></li>
                            <li><a href="#" className="hover:text-gold-300 transition-colors">FAQs</a></li>
                            <li><a href="#" className="hover:text-gold-300 transition-colors">Size Guide</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-heading text-lg font-semibold mb-4">Contact Us</h3>
                        <ul className="space-y-3 text-purple-200 text-sm">
                            <li className="flex items-start gap-2">
                                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <span>123 Jewelry Street, Mumbai, Maharashtra 400001</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone className="w-5 h-5 flex-shrink-0" />
                                <span>+91 98765 43210</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail className="w-5 h-5 flex-shrink-0" />
                                <span>info@nakhralifashion.com</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-purple-800">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-purple-200">
                        <p>&copy; 2025 Nakhrali Fashion. All rights reserved.</p>
                        <div className="flex gap-6">
                            <a href="#" className="hover:text-gold-300 transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-gold-300 transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-gold-300 transition-colors">Cookie Policy</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default SimpleFooter;
