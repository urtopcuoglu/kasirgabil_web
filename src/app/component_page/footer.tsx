"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { Phone, Mail, MapPin, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);


    const dropdownContent: { [key: string]: { title: string; content: string } } = {
        'mesafeli-satis': {
            title: 'Mesafeli Satış Sözleşmesi',
            content: 'Kasırga Bilgisayar olarak sunduğumuz tüm ürünler ve hizmetlerde mesafeli satış yönetmeliğine uygun olarak işlem yapmaktayız. Ürün ve hizmetleri satın almadan önce lütfen mesafeli satış sözleşmemizi dikkatle okuyunuz. Müşteri hakları ve sorumluluklarımız bu sözleşmede belirtilmiştir.'
        },
        'gizlilik-politikasi': {
            title: 'Gizlilik Politikası',
            content: 'Kasırga Bilgisayar, kişisel verilerinizin gizliliğine ve korunmasına önem vermektedir. Web sitemizi ziyaret ettiğinizde veya ürünlerimizi satın aldığınızda toplanan bilgiler, yalnızca belirtilen amaçlar için kullanılır ve üçüncü şahıslarla paylaşılmaz. Detaylı bilgi için gizlilik politikamızı okuyunuz.'
        },
        'iptal-iade': {
            title: 'İptal ve İade',
            content: 'Kasırga Bilgisayar\'dan satın aldığınız ürünleri, teslim aldığınız tarihten itibaren 14 gün içerisinde hiçbir sebep göstermeksizin iade edebilirsiniz. İade işlemi için lütfen müşteri hizmetlerimiz ile iletişime geçiniz. İade edilen ürünler kontrol edildikten sonra ödemeniz iade edilecektir.'
        },
        'kisisel-veriler': {
            title: 'Kişisel Veriler Politikası',
            content: 'KVKK (Kişisel Verilerin Korunması Kanunu) uyarınca, sizden toplanan kişisel veriler gizli tutulmakta ve yalnızca belirtilen amaçlar doğrultusunda kullanılmaktadır. Verilerinize erişim, düzeltme veya silme talebinde bulunabilirsiniz. İhtiyaç duydukça bizimle iletişime geçebilirsiniz.'
        }
    };

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

                    {/* Alışveriş */}
                    <div>
                        <h4 className="font-bold text-lg mb-4 hover:text-[var(--color-primary)] transition-colors">Alışveriş</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <button
                                    onClick={() => setOpenDropdown('mesafeli-satis')}
                                    className="hover:text-[var(--color-primary)] transition-colors w-full text-left"
                                >
                                    Mesafeli Satış Sözleşmesi
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setOpenDropdown('gizlilik-politikasi')}
                                    className="hover:text-[var(--color-primary)] transition-colors w-full text-left"
                                >
                                    Gizlilik Politikası
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setOpenDropdown('iptal-iade')}
                                    className="hover:text-[var(--color-primary)] transition-colors w-full text-left"
                                >
                                    İptal ve İade
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setOpenDropdown('kisisel-veriler')}
                                    className="hover:text-[var(--color-primary)] transition-colors w-full text-left"
                                >
                                    Kişisel Veriler Politikası
                                </button>
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
                                    <p className="font-semibold">0 (312) 311 93 39</p>
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
                        Design by <a href="http://urtopcuoglu.github.io" target="_blank" rel="noopener noreferrer" className="hover:underline">urtdigital</a>
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

            {/* Dropdown Content Modal */}
            {openDropdown && ['mesafeli-satis', 'gizlilik-politikasi', 'iptal-iade', 'kisisel-veriler'].includes(openDropdown) && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4"
                    onClick={() => setOpenDropdown(null)}
                >
                    <div
                        className="bg-white dark:bg-zinc-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl animate-fadeIn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white p-6 flex justify-between items-center">
                            <h2 className="text-2xl font-bold">{dropdownContent[openDropdown]?.title}</h2>
                            <button
                                onClick={() => setOpenDropdown(null)}
                                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 text-zinc-800 dark:text-zinc-200">
                            <p className="text-lg leading-relaxed whitespace-pre-wrap">
                                {dropdownContent[openDropdown]?.content}
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-100 dark:bg-zinc-700 p-6 border-t border-gray-300 dark:border-zinc-600 flex justify-end">
                            <button
                                onClick={() => setOpenDropdown(null)}
                                className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-secondary)] transition-colors font-semibold"
                            >
                                Kapat
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </footer>
    );
};

export default Footer;