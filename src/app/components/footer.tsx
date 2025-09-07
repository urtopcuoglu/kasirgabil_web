"use client";
import React from 'react';
import Image from 'next/image';
import { Phone } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="w-full bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
            {/* Newsletter Section */}
            <div className="bg-gradient-to-r from-[#2C2262] to-[#362C68] text-white py-12 px-4">
                <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
                    <div className="text-center md:text-left mb-6 md:mb-0">
                        <h3 className="text-xl font-bold mb-2">KAMPANYA HABERCİSİ</h3>
                        <p className="text-sm max-w-lg">
                            Hemen e-posta listemize kayıt ol, en güncel kampanyalar, yenilikler ve duyurulardan ilk öğrenen sen ol.
                        </p>
                    </div>
                    <div className="w-full md:w-auto">
                        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <div className="relative w-full sm:w-80">
                                <input
                                    type="email"
                                    placeholder="E-Mail adresinizi yazınız"
                                    className="w-full pl-4 pr-4 py-2 rounded-full bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                />
                            </div>
                            <button className="w-full sm:w-auto px-8 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] transition-colors rounded-full font-semibold">
                                Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer Links */}
            <div className="container mx-auto py-12 px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {/* Logo */}
                    <div className="col-span-2 md:col-span-1 flex justify-center md:justify-start items-center">
                        <div className="relative w-40 h-12">
                            <Image
                                src="/logo/logo.png" // Buraya logo dosyanızın yolunu yazın
                                alt="Kasırga Bilgisayar Logo"
                                layout="fill"
                                objectFit="contain"
                            />
                        </div>
                    </div>

                    {/* Kurumsal */}
                    <div>
                        <h4 className="font-bold text-lg mb-4">Kurumsal</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="../public/about" className="hover:text-[var(--color-primary)] transition-colors">Hakkımızda</a></li>
                            <li><a href="../public/contact" className="hover:text-[var(--color-primary)] transition-colors">Ürünlerimiz</a></li>
                            <li><a href="../public/products" className="hover:text-[var(--color-primary)] transition-colors">İletişim Bilgilerimiz</a></li>
                        </ul>
                    </div>

                    {/* Alışveriş */}
                    <div>
                        <h4 className="font-bold text-lg mb-4">Alışveriş</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">Mesafeli Satış Sözleşmesi</a></li>
                            <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">Gizlilik Politikası</a></li>
                            <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">İptal ve İade</a></li>
                            <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">Kişisel Veriler Politikası</a></li>

                        </ul>
                    </div>

                    {/* Bize Ulaşın */}
                    <div>
                        <h4 className="font-bold text-lg mb-4">Bize Ulaşın</h4>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-center space-x-2">
                                <div>
                                    <p className="font-semibold">0 (312) 311 93 39</p>
                                    <p className="font-semibold">0 (505) 387 79 39</p>
                                </div>
                            </li>
                            <li className="flex items-center space-x-2">
                                <a href="mailto:info@kasirgabilgisayar.com" className="hover:text-[var(--color-primary)] transition-colors">info@kasirgabilgisayar.com</a>
                            </li>
                            <li className="flex items-start space-x-2">
                                <p>Cumhuriyet Mh. Bayındır-1 Sk. No:5/10 Kızılay - Çankaya - Ankara</p>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* WhatsApp Button */}
            <a
                href="https://wa.me/905053877939"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
                aria-label="WhatsApp"
            >
                <Phone size={24} />
            </a>
        </footer>
    );
};

export default Footer;