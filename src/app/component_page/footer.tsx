"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Phone, Mail, MapPin, Linkedin, Instagram } from 'lucide-react';

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
                                    className="w-full pl-4 pr-4 py-3 rounded-2xl bg-white dark:bg-zinc-800 border-2 border-white dark:border-zinc-700 hover:border-[var(--color-primary)] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all duration-300"
                                />
                            </div>
                            <button className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-white to-gray-100 dark:from-zinc-100 dark:to-white text-[var(--color-primary)] hover:from-[var(--color-primary)] hover:to-[var(--color-secondary)] hover:text-white rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 transform active:scale-95 border-2 border-transparent hover:border-white">
                                Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer Links */}
            <div className="container mx-auto py-12 px-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                    {/* Logo */}
                    <div className="col-span-2 md:col-span-1 flex justify-center md:justify-start items-center">
                        <div className="relative w-40 h-12">
                            <Image
                                src="/logo/logo.png"
                                alt="Kasırga Bilgisayar Logo"
                                layout="fill"
                                objectFit="contain"
                            />
                        </div>
                    </div>

                    {/* Kurumsal */}
                    <div>
                        <h4 className="font-bold text-lg mb-4 hover:text-[var(--color-primary)] transition-colors">Kurumsal</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="/public/about" className="hover:text-[var(--color-primary)] transition-colors">Hakkımızda</a>
                            </li>
                            <li>
                                <a href="/services" className="hover:text-[var(--color-primary)] transition-colors">Hizmetlerimiz</a>
                            </li>
                            <li>
                                <a href="/public/contact" className="hover:text-[var(--color-primary)] transition-colors">İletişim Bilgilerimiz</a>
                            </li>
                            <li>
                                <a href="/services/teknik-servis" className="hover:text-[var(--color-primary)] transition-colors">Teknik Servis</a>
                            </li>
                        </ul>
                    </div>

                    {/* Çalışma Saatlerimiz */}
                    <div>
                        <h4 className="font-bold text-lg mb-4 hover:text-[var(--color-primary)] transition-colors">Çalışma Saatlerimiz</h4>
                        <ul className="space-y-2 text-sm">
                            <li>Pazartesi: 09:30 - 18:00</li>
                            <li>Salı: 09:30 - 18:00</li>
                            <li>Çarşamba: 09:30 - 18:00</li>
                            <li>Perşembe: 09:30 - 18:00</li>
                            <li>Cuma: 09:30 - 18:00</li>
                            <li>Cumartesi: 09:30 - 18:00</li>
                            <li>Pazar: Kapalı</li>
                        </ul>
                    </div>

                    {/* Yasal */}
                    <div>
                        <h4 className="font-bold text-lg mb-4 hover:text-[var(--color-primary)] transition-colors">Yasal</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/mesafeli-satis-sozlesmesi" className="hover:text-[var(--color-primary)] transition-colors">
                                    Mesafeli Satış Sözleşmesi
                                </Link>
                            </li>
                            <li>
                                <Link href="/gizlilik-politikasi" className="hover:text-[var(--color-primary)] transition-colors">
                                    Gizlilik Politikası
                                </Link>
                            </li>
                            <li>
                                <Link href="/iade-ve-degisim-politikasi" className="hover:text-[var(--color-primary)] transition-colors">
                                    İade ve Değişim
                                </Link>
                            </li>
                            <li>
                                <Link href="/kvkk" className="hover:text-[var(--color-primary)] transition-colors">
                                    KVKK Aydınlatma Metni
                                </Link>
                            </li>
                            <li>
                                <a href="https://kasirgabilgisayar.sahibinden.com/" target="_blank" rel="noopener noreferrer" className="mt-4 inline-block w-36">
                                    <Image
                                        src="/brand/sahibinden.svg"
                                        alt="Sahibinden.com"
                                        width={144}
                                        height={48}
                                        className="rounded-md hover:opacity-80 transition-opacity"
                                    />
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Bize Ulaşın */}
                    <div>
                        <h4 className="font-bold text-lg mb-4 hover:text-[var(--color-primary)] transition-colors">Bize Ulaşın</h4>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-center space-x-2">
                                <Phone size={16} className="text-zinc-500" />
                                <div>
                                    <p className="font-semibold">0 (312) 431 02 64</p>
                                    <p className="font-semibold">0 (312) 312 60 11</p>
                                    <p className="font-semibold">0 (505) 387 79 39</p>
                                </div>
                            </li>
                            <li className="flex items-center space-x-2">
                                <Mail size={16} className="text-zinc-500" />
                                <a href="mailto:info@kasirgabilgisayar.com" className="hover:text-[var(--color-primary)] transition-colors">info@kasirgabilgisayar.com</a>
                            </li>
                            <li className="flex items-start space-x-2">
                                <MapPin size={16} className="text-zinc-500" />
                                <p>Cumhuriyet Mh. Bayındır-1 Sk. No:5/10 Kızılay - Çankaya - Ankara</p>
                            </li>
                        </ul>
                        {/* Sosyal Medya İkonları */}
                        <div className="flex space-x-4 mt-6">
                            <a href="https://www.linkedin.com/company/kasirgabilgisayar" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-[var(--color-primary)] transition-colors">
                                <Linkedin size={24} />
                            </a>
                            <a href="https://www.instagram.com/kasirgabilgisayar" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-[var(--color-primary)] transition-colors">
                                <Instagram size={24} />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Copyright and Design Section */}
            <div className="bg-[var(--color-secondary)] text-white py-4 px-4">
                <div className="container mx-auto text-center md:text-left text-xs flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
                    <p>&copy; 2025 Kasırga Bilgisayar Tüm Hakları Saklıdır.</p>
                    <p>
                        Design by <a href="https://www.ortisoft.com.tr" target="_blank" rel="noopener noreferrer" className="hover:underline">Ortisoft</a>
                    </p>
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