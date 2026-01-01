"use client";
import React from 'react';
import Image from 'next/image';
import { Mail, MapPin, Phone, Instagram, Linkedin } from 'lucide-react';

// Ortak bileşenleri import edin
import Header from '@/app/component_page/header';
import Footer from '@/app/component_page/footer';

export default function ContactPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <main className="flex-1 flex flex-col">
                {/* Banner Section */}
                <div
                    className="relative w-full h-[500px] bg-cover bg-center flex items-center justify-center"
                    style={{ backgroundImage: "url('/services/ankara.jpg')" }}
                >
                    <div className="absolute inset-0 bg-black opacity-50"></div>
                    <div className="relative text-white text-center z-10 flex items-center gap-4">
                        <h1 className="text-5xl font-bold drop-shadow-md">İletişim</h1>
                        <Mail size={48} className="text-white drop-shadow-md" />
                    </div>
                </div>

                {/* Form and Map Section */}
                <section className="container mx-auto py-16 px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Sol Kısım: İletişim Formu */}
                        <div className="p-8 bg-white rounded-lg shadow-lg">
                            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2 text-[var(--color-secondary)]">
                                <Mail size={32} />
                                Bize Ulaşın
                            </h2>
                            <form className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="sr-only">Adınız</label>
                                    <input
                                        type="text"
                                        id="name"
                                        placeholder="Adınız*"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="surname" className="sr-only">Soyadınız</label>
                                    <input
                                        type="text"
                                        id="surname"
                                        placeholder="Soyadınız"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="sr-only">Telefon Numaranız</label>
                                    <input
                                        type="text"
                                        id="phone"
                                        placeholder="Telefon Numaranız"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="sr-only">E-mail Adresiniz</label>
                                    <input
                                        type="email"
                                        id="email"
                                        placeholder="E-mail Adresiniz*"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="message" className="sr-only">Mesajınız</label>
                                    <textarea
                                        id="message"
                                        placeholder="Mesajınız*"
                                        rows={5}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    className="w-auto px-8 py-3 bg-[var(--color-primary)] text-white font-semibold rounded-lg hover:bg-[var(--color-secondary)] transition-colors"
                                >
                                    Gönder
                                </button>
                            </form>
                        </div>
                        {/* Sağ Kısım: Harita */}
                        <div className="relative w-full h-[600px] rounded-lg shadow-lg overflow-hidden">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3059.7719635465!2d32.85353607565204!3d39.92411908547474!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14d34e55abbc6c7d%3A0xa2355776a7dcc283!2sKas%C4%B1rga%20Bilgisayar!5e0!3m2!1str!2str!4v1757352239708!5m2!1str!2str"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen={true}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </div>
                </section>

                {/* İletişim Bilgileri Cards */}
                <section className="bg-gray-100 py-16 px-4">
                    <div className="container mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-8 text-[var(--color-secondary)]">İletişim Bilgileri</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Adres Kartı */}
                            <div className="group bg-white p-6 rounded-lg shadow-lg text-center flex flex-col items-center gap-4 border-b-4 border-transparent hover:border-[var(--color-primary)] transition-all duration-300">
                                <MapPin size={48} className="text-gray-400 group-hover:text-[var(--color-primary)] transition-colors" />
                                <h3 className="text-xl font-semibold text-[var(--color-secondary)]">Adresimiz</h3>
                                <p className="text-sm text-gray-600">
                                    Cumhuriyet Mh. Bayındır-1 Sk.<br />
                                    No:5/10 Kızılay - Çankaya / Ankara
                                </p>
                            </div>
                            {/* Telefon Kartı */}
                            <div className="group bg-white p-6 rounded-lg shadow-lg text-center flex flex-col items-center gap-4 border-b-4 border-transparent hover:border-[var(--color-primary)] transition-all duration-300">
                                <Phone size={48} className="text-gray-400 group-hover:text-[var(--color-primary)] transition-colors" />
                                <h3 className="text-xl font-semibold text-[var(--color-secondary)]">Telefon Numaralarımız</h3>
                                <div className="space-y-1">
                                    <p className="font-semibold text-[var(--color-secondary)]">0 (312) 311 93 39</p>
                                    <p className="font-semibold text-[var(--color-secondary)]">0 (505) 387 79 39</p>
                                </div>
                            </div>
                            {/* E-mail Kartı */}
                            <div className="group bg-white p-6 rounded-lg shadow-lg text-center flex flex-col items-center gap-4 border-b-4 border-transparent hover:border-[var(--color-primary)] transition-all duration-300">
                                <Mail size={48} className="text-gray-400 group-hover:text-[var(--color-primary)] transition-colors" />
                                <h3 className="text-xl font-semibold text-[var(--color-secondary)]">E-mail Adresimiz</h3>
                                <p className="text-sm text-gray-600">
                                    info@kasirgabilgisayar.com
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Sahibinden.com & Socials Section */}
                <section className="bg-white py-16 px-4">
                    <div className="container mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            {/* Sahibinden.com Section */}
                            <div className="border-2 border-[var(--color-secondary)] hover:border-[var(--color-primary)] transition-colors duration-300 rounded-lg p-4 flex items-center gap-4 justify-center md:justify-start">
                                <a href="https://kasirgabilgisayar.sahibinden.com/" target="_blank" rel="noopener noreferrer">
                                    <Image
                                        src="/brand/sahibinden.svg"
                                        alt="Sahibinden.com"
                                        width={160}
                                        height={50}
                                        className="rounded-lg"
                                    />
                                </a>
                                <span className="text-lg font-bold text-[var(--color-secondary)]">Online Mağazamız</span>
                            </div>
                            {/* Sosyal Medya Section */}
                            <div className="flex items-center gap-4 justify-center md:justify-end">
                                <span className="text-lg font-bold text-[var(--color-secondary)]">Sosyal Medya Hesaplarımız</span>
                                <a href="https://www.instagram.com/kasirgabilgisayar" target="_blank" rel="noopener noreferrer" className="text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-colors">
                                    <Instagram size={32} />
                                </a>
                                <a href="https://www.linkedin.com/company/kasirgabilgisayar" target="_blank" rel="noopener noreferrer" className="text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-colors">
                                    <Linkedin size={32} />
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}