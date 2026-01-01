"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Code, ArrowLeft } from 'lucide-react';

export default function WebTasarimPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-1 flex flex-col">
                {/* Back Button */}
                <div className="bg-gray-50 px-4 py-4">
                    <div className="container mx-auto max-w-4xl">
                        <Link
                            href="/services"
                            className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors font-semibold"
                        >
                            <ArrowLeft size={20} />
                            Hizmetlere Dön
                        </Link>
                    </div>
                </div>

                {/* Top Banner with Title */}
                <div
                    className="relative w-full h-[400px] bg-cover bg-center flex items-center justify-center p-8"
                    style={{ backgroundImage: "url('/services/web-design.jpg')" }}
                >
                    <div className="absolute inset-0 bg-black opacity-30"></div>
                    <div className="relative text-white text-center z-10 flex items-center gap-4">
                        <h1 className="text-5xl font-bold drop-shadow-md">Web Tasarım Çözümleri</h1>
                        <Code size={48} className="text-white drop-shadow-md" />
                    </div>
                </div>

                {/* Content Section */}
                <section className="py-16 px-4 bg-white">
                    <div className="container mx-auto max-w-4xl">
                        <div className="mb-12">
                            <h2 className="text-3xl font-bold mb-6 text-gray-900">Web Tasarım ve Dijital Çözümler</h2>
                            <p className="text-lg text-gray-700 mb-4">
                                Kasırga Bilgisayar, işletmenizin dijital varlığını güçlendirmek için profesyonel web tasarım, e-ticaret ve dijital pazarlama çözümleri sunmaktadır.
                            </p>
                            <p className="text-lg text-gray-700 mb-4">
                                Modern tasarım prensipleri ve en son teknolojiler kullanarak, sizin için en uygun web çözümü oluştururuz.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                            <div className="relative h-64 rounded-lg overflow-hidden shadow-lg">
                                <Image
                                    src="/services/web-design.jpg"
                                    alt="Web Tasarım"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex flex-col justify-center">
                                <h3 className="text-2xl font-bold mb-4 text-gray-900">Sunduğumuz Hizmetler</h3>
                                <ul className="space-y-3 text-gray-700">
                                    <li className="flex items-start">
                                        <span className="text-[var(--color-primary)] mr-3">✓</span>
                                        <span>Kurumsal Web Tasarım</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-[var(--color-primary)] mr-3">✓</span>
                                        <span>E-Ticaret Platformu Kurulumu</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-[var(--color-primary)] mr-3">✓</span>
                                        <span>SEO Optimizasyonu</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-[var(--color-primary)] mr-3">✓</span>
                                        <span>Dijital Pazarlama Stratejisi</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-[var(--color-primary)] mr-3">✓</span>
                                        <span>Mobil Uyumlu Tasarım</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-8 rounded-lg">
                            <h3 className="text-2xl font-bold mb-4 text-gray-900">Neden Biz?</h3>
                            <p className="text-gray-700 mb-4">
                                Kasırga Bilgisayar, web tasarım alanında profesyonel ekibiyle hizmet sunmaktadır.
                            </p>
                            <ul className="space-y-2 text-gray-700">
                                <li>• Modern ve Responsive Tasarım</li>
                                <li>• Hızlı Yükleme Süresi</li>
                                <li>• SEO Dostu Yapı</li>
                                <li>• Sürekli Teknik Destek</li>
                                <li>• Uygun Fiyatlandırma</li>
                            </ul>
                        </div>

                        <div className="mt-12 text-center">
                            <a
                                href="tel:+905551234567"
                                className="inline-block px-8 py-3 bg-[var(--color-primary)] text-white rounded-full font-semibold hover:bg-[var(--color-secondary)] transition-colors"
                            >
                                İletişime Geçin
                            </a>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
