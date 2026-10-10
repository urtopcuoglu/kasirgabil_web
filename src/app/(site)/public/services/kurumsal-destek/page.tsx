"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Network, ArrowLeft } from 'lucide-react';

export default function KurumsalDestekPage() {
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
                    style={{ backgroundImage: "url('/services/server-network.jpg')" }}
                >
                    <div className="absolute inset-0 bg-black opacity-30"></div>
                    <div className="relative text-white text-center z-10 flex items-center gap-4">
                        <h1 className="text-5xl font-bold drop-shadow-md">Kurumsal Destek</h1>
                        <Network size={48} className="text-white drop-shadow-md" />
                    </div>
                </div>

                {/* Content Section */}
                <section className="py-16 px-4 bg-white">
                    <div className="container mx-auto max-w-4xl">
                        <div className="mb-12">
                            <h2 className="text-3xl font-bold mb-6 text-gray-900">Kurumsal IT Çözümleri</h2>
                            <p className="text-lg text-gray-700 mb-4">
                                Kasırga Bilgisayar, işletmelerin IT altyapısı ihtiyaçlarını karşılamak ve 7/24 teknik destek hizmeti sunmak için uzmanlaşmıştır.
                            </p>
                            <p className="text-lg text-gray-700 mb-4">
                                Ağ tasarımından sunucu kurulumuna, güvenlik çözümlerinden yedeklemeye kadar, tüm IT ihtiyaçlarınıza profesyonel çözümler sağlıyoruz.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                            <div className="relative h-64 rounded-lg overflow-hidden shadow-lg">
                                <Image
                                    src="/services/server-network.jpg"
                                    alt="Kurumsal Destek"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex flex-col justify-center">
                                <h3 className="text-2xl font-bold mb-4 text-gray-900">Sunduğumuz Hizmetler</h3>
                                <ul className="space-y-3 text-gray-700">
                                    <li className="flex items-start">
                                        <span className="text-[var(--color-primary)] mr-3">✓</span>
                                        <span>Ağ Tasarımı ve Kurulumu</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-[var(--color-primary)] mr-3">✓</span>
                                        <span>Sunucu Kurulumu ve Yönetimi</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-[var(--color-primary)] mr-3">✓</span>
                                        <span>Bilgi Güvenliği Çözümleri</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-[var(--color-primary)] mr-3">✓</span>
                                        <span>Yedekleme ve Felaket Kurtarma</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-[var(--color-primary)] mr-3">✓</span>
                                        <span>7/24 Teknik Destek</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-8 rounded-lg">
                            <h3 className="text-2xl font-bold mb-4 text-gray-900">Neden Biz?</h3>
                            <p className="text-gray-700 mb-4">
                                Kasırga Bilgisayar, birçok kurumsal müşteriye hizmet vermektedir ve her zaman yanlarında olmaktadır.
                            </p>
                            <ul className="space-y-2 text-gray-700">
                                <li>• Deneyimli Profesyonel Ekip</li>
                                <li>• 7/24 Kesintisiz Hizmet</li>
                                <li>• Güvenilir ve Stabil Çözümler</li>
                                <li>• Hızlı Müdahale Süresi</li>
                                <li>• Kurumsal Fiyatlandırma</li>
                            </ul>
                        </div>

                        <div className="mt-12 text-center">
                            <a
                                href="tel:+905551234567"
                                className="inline-block px-8 py-3 bg-[var(--color-primary)] text-white rounded-full font-semibold hover:bg-[var(--color-secondary)] transition-colors"
                            >
                                Teklif İsteyin
                            </a>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

