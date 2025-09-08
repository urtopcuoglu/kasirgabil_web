"use client";
import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import {
    Wrench, Handshake, Trophy, Target, ShieldCheck, Rocket, ScanBarcode
} from 'lucide-react';

// Ortak bileşenleri import edin
import Header from "@/app/component_page/header";
import Footer from "@/app/component_page/footer";
import BrandCard from "@/app/component_page/BrandCard";

// Hizmet slider'ı için prop tipleri
interface ServiceSliderCardProps {
    imageSrc: string;
    title: string;
    description: string;
    buttonText: string;
}

// Hizmet slider'ı için özel bir kart bileşeni
const ServiceSliderCard: React.FC<ServiceSliderCardProps> = ({ imageSrc, title, description, buttonText }) => (
    <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        <div className="relative w-full md:w-1/2 h-64 md:h-auto flex-shrink-0">
            <Image
                src={imageSrc}
                alt={title}
                layout="fill"
                objectFit="cover"
            />
        </div>
        <div className="flex flex-col p-6 w-full md:w-1/2 justify-center">
            <h3 className="text-2xl font-bold mb-2 text-gray-900">{title}</h3>
            <p className="text-gray-600 mb-4">{description}</p>
            <a href="#" className="inline-block self-start px-6 py-2 bg-[var(--color-primary)] text-white rounded-full font-semibold hover:bg-[var(--color-secondary)] transition-colors">
                {buttonText}
            </a>
        </div>
    </div>
);

// Hizmet slider'ı için örnek veriler
const servicesSliderData = [
    {
        imageSrc: '/services/technical-services.jpg',
        title: 'Tamir ve Bakım',
        description: 'Tüm bilgisayar ve bileşenleri için profesyonel tamir, bakım ve onarım hizmeti.',
        buttonText: 'Daha Fazlası',
    },
    {
        imageSrc: '/services/web-design.jpg',
        title: 'Web Tasarım Çözümleri',
        description: 'İhtiyaçlarınıza uygun web tasarım, e-ticaret ve dijital pazarlama çözümleri.',
        buttonText: 'Daha Fazlası',
    },
    {
        imageSrc: '/services/server-network.jpg',
        title: 'Kurumsal Destek',
        description: 'İşletmeler için IT altyapı çözümleri ve 7/24 teknik destek.',
        buttonText: 'Daha Fazlası',
    },
    {
        imageSrc: '/services/alisveris.jpg', // Örnek dördüncü resim
        title: 'Sıfır ve İkinci El Alışveriş',
        description: 'Tüm bilgisayar, donanım ve cihazlarda sıfır ve ikinci el alışveriş imkanı.',
        buttonText: 'Alışveriş Sayfasına Git',
        buttonLink: 'https://kasirgabilgisayar.sahibinden.com/',
    },
];

// İkonlu özellikler için örnek veriler
const featuresData = [
    {
        icon: Trophy,
        title: 'Profesyonel Hizmet',
        description: 'Yüksek standartlarda ve uzman ekiple hizmet garantisi.',
    },
    {
        icon: Target,
        title: 'Müşteri Memnuniyeti',
        description: 'Müşterilerimizin memnuniyeti her zaman önceliğimizdir.',
    },
    {
        icon: ShieldCheck,
        title: 'Güvenli Alışveriş',
        description: 'Güvenli ödeme ve sorunsuz teslimat çözümleri.',
    },
    {
        icon: Rocket,
        title: 'Hızlı Teslimat',
        description: 'Ürünleriniz en kısa sürede kapınızda.',
    },
];

// Markalar için örnek veriler (Ana sayfadan alınabilir)
const brands = [
    { brandName: 'Asus', logoSrc: '/brand/asus.png' },
    { brandName: 'Lenovo', logoSrc: '/brand/lenovo.svg' },
    { brandName: 'Apple', logoSrc: '/brand/apple.svg' },
    { brandName: 'ThinkPad', logoSrc: '/brand/thinkpad.png' },
    { brandName: 'Kingston', logoSrc: '/brand/kingston.jpg' },
    { brandName: 'SteelSeries', logoSrc: '/brand/steelseries.png' },
    { brandName: 'HP', logoSrc: '/brand/hp.svg' },
    { brandName: 'AMD', logoSrc: '/brand/amd.svg' },
    { brandName: 'Nvidia', logoSrc: '/brand/nvidia.svg' },
    { brandName: 'Logitech', logoSrc: '/brand/logitech.svg' },
    { brandName: 'Philips', logoSrc: '/brand/philips.svg' },
    { brandName: 'Corsair', logoSrc: '/brand/corsair.png' },
    { brandName: 'Dell', logoSrc: '/brand/dell.png' },
    { brandName: 'Acer', logoSrc: '/brand/acer.svg' },
    { brandName: 'TP-Link', logoSrc: '/brand/tplink.jpg' },
    { brandName: 'Cisco', logoSrc: '/brand/cisco.svg' },
    { brandName: 'MSI', logoSrc: '/brand/msi.jpg' },
    { brandName: 'Hikvision', logoSrc: '/brand/hikvision.jpg' },
    { brandName: 'Intel', logoSrc: '/brand/intel.svg' },
    { brandName: 'Huawei', logoSrc: '/brand/huawei.svg' },
    { brandName: 'Razer', logoSrc: '/brand/razer.svg' },
    { brandName: 'Gigabyte', logoSrc: '/brand/gigabyte.svg' },
    { brandName: 'Seagate', logoSrc: '/brand/seagate.png' },
    { brandName: 'Fujitsu', logoSrc: '/brand/fujitsu.svg' },
];

export default function ServicesPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-1 flex flex-col">
                {/* Top Banner with Title */}
                <div
                    className="relative w-full h-[500px] bg-cover bg-center flex items-center justify-center p-8"
                    style={{ backgroundImage: "url('/services/handshake.jpg')" }}
                >
                    <div className="absolute inset-0 bg-black opacity-30"></div>
                    <div className="relative text-white text-center z-10 flex items-center gap-4">
                        <h1 className="text-5xl font-bold drop-shadow-md">Hizmetlerimiz</h1>
                        <Wrench size={48} className="text-white drop-shadow-md" />
                    </div>
                </div>

                {/* Service Slider Section */}
                <div className="py-16 px-4 bg-gray-100">
                    <div className="container mx-auto max-w-5xl relative">
                        <Swiper
                            modules={[Navigation, Pagination]}
                            spaceBetween={30}
                            slidesPerView={1}
                            navigation
                            pagination={{ clickable: true }}
                            className="service-slider"
                        >
                            {servicesSliderData.map((service, index) => (
                                <SwiperSlide key={index}>
                                    <ServiceSliderCard {...service} />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </div>

                {/* Features Section */}
                <section className="py-16 px-4 bg-white">
                    <div className="container mx-auto max-w-6xl">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                            {featuresData.map((feature, index) => (
                                <div key={index} className="flex flex-col items-center p-6">
                                    <feature.icon size={64} className="text-[var(--color-primary)] mb-4" />
                                    <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
                                    <p className="text-gray-600 text-sm">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Çözüm Ortaklarımız Section */}
                <section className="w-full py-16 px-8 bg-gray-100">
                    <div className="container mx-auto text-center">
                        <div className="flex justify-center items-center gap-2 mb-12">
                            <h2 className="text-3xl font-bold text-[var(--color-secondary)]">Çözüm Ortaklarımız</h2>
                            <Handshake size={32} className="text-[var(--color-secondary)]" />
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                            {brands.map((brand, index) => (
                                <BrandCard key={index} brandName={brand.brandName} logoSrc={brand.logoSrc} />
                            ))}
                        </div>
                        <p className="text-lg mt-8 text-gray-600">
                            Ve Diğer Tüm Markalarla Hizmetinizdeyiz...
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
}