"use client";
import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Wrench, ScanBarcode } from 'lucide-react'; // Wrench ikonu eklendi

import Header from "./components/header";
import Footer from "./components/footer";
import ProductCard from "./components/ProductCard";
import ServiceCard from "./components/ServicesCard";

const sliderImages = [
    '/slider_image/slider-1.jpg',
    '/slider_image/slider-2.jpg',
    '/slider_image/slider-3.jpg',
];


const productCategories = [
    {
        imageSrc: '/product_image/pc-oem.jpg',
        imageAlt: 'PC OEM Bileşenleri',
        title: 'PC OEM Ekipmanları',
        description: 'Masaüstü bilgisayarlarınız için en yeni ve en kaliteli OEM bileşenleri burada.',
        buttonText: 'Daha Fazla',
        buttonLink: '#',
    },
    {
        imageSrc: '/product_image/laptop_1.jpg',
        imageAlt: 'Laptop Parçaları',
        title: 'Laptop',
        description: 'Laptoplarınız için uyumlu ve dayanıklı yedek parçalar ve aksesuarlar.',
        buttonText: 'Daha Fazla',
        buttonLink: '#',
    },
    {
        imageSrc: '/product_image/nbook_yedek.jpg',
        imageAlt: 'Notebook Yedek Parça',
        title: 'Notebook Yedek Parça',
        description: 'Seçili ürünlerde kaçırılmayacak fırsatlar ve büyük indirimler sizi bekliyor.',
        buttonText: 'İncele',
        buttonLink: '#',
    },
    {
        imageSrc: '/product_image/gaming.jpg',
        imageAlt: 'Gaming PC',
        title: 'Gaming',
        description: 'Yüksek performanslı oyun deneyimi için tasarlanmış ekipmanlar.',
        buttonText: 'Daha Fazla',
        buttonLink: '#',
    },
    {
        imageSrc: '/product_image/sunucu_network.jpg',
        imageAlt: 'Sunucu ve Network Ürünleri',
        title: 'Sunucu ve Network Ürünleri',
        description: 'Ofisinizin verimliliğini artıracak son teknoloji ofis ekipmanları.',
        buttonText: 'Daha Fazla',
    },
    {
        imageSrc: '/product_images/different_products.jpg',
        imageAlt: 'Değişik Ürünler',
        title: 'Değişik Ürünler',
        description: 'Hayatınızı kolaylaştıracak ilginç ve sıradışı teknolojik ürünleri keşfedin.',
        buttonText: 'Göz At',
        buttonLink: '#',
    },
];

const services = [
    {
        imageSrc: '/services/technical-services.jpg',
        title: 'Tamir ve Bakım',
        description: 'Cihazlarınız için profesyonel tamir, bakım ve onarım hizmetleri.',
        buttonText: 'Daha Fazlası',
        buttonLink: '#',
    },
    {
        imageSrc: '/services/web-design.jpg',
        title: 'Yazılım Çözümleri',
        description: 'İhtiyaçlarınıza özel yazılım geliştirme ve danışmanlık hizmetleri.',
        buttonText: 'Daha Fazlası',
        buttonLink: '#',
    },
    {
        imageSrc: '/services/server-network.jpg',
        title: 'Kurumsal Destek',
        description: 'İşletmeler için IT altyapı çözümleri ve 7/24 teknik destek.',
        buttonText: 'Daha Fazlası',
        buttonLink: '#',
    },
];

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-zinc-800">
            <main className="flex-1 flex flex-col items-center">
                <div className="p-8 pb-20 gap-16 sm:p-20 flex flex-col items-center">
                    {/* Image Slider Component */}
                    <div className="w-full max-w-4xl mx-auto relative mb-12">
                        <Swiper
                            modules={[Navigation, Pagination]}
                            spaceBetween={30}
                            slidesPerView={1}
                            navigation
                            pagination={{ clickable: true }}
                            onSlideChange={() => console.log('slide change')}
                            onSwiper={(swiper) => console.log(swiper)}
                            className="mySwiper"
                        >
                            {sliderImages.map((image, index) => (
                                <SwiperSlide key={index}>
                                    <Image
                                        src={image}
                                        alt={`Slider Image ${index + 1}`}
                                        width={1000}
                                        height={500}
                                        layout="responsive"
                                        objectFit="cover"
                                        className="rounded-lg shadow-lg"
                                    />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>

                    {/* Product Categories Grid */}
                    <section className="w-full max-w-6xl mx-auto py-8">
                        <h2 className="text-3xl font-bold text-center mb-8 text-[var(--color-secondary)] dark:text-white">Ürün Kategorileri</h2>
                        <ScanBarcode size={32} className="text-[var(--color-secondary)]" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {productCategories.map((card, index) => (
                                <ProductCard
                                    key={index}
                                    imageSrc={card.imageSrc}
                                    imageAlt={card.imageAlt}
                                    title={card.title}
                                    description={card.description}
                                    buttonText={card.buttonText}
                                    buttonLink='#'
                                />
                            ))}
                        </div>
                    </section>
                </div>

                {/* Hizmetlerimiz Section with Background */}
                <div className="w-full bg-[var(--color-primary)] py-16 px-8">
                    <section className="container mx-auto">
                        <div className="flex justify-center items-center gap-2 mb-8">
                            <h2 className="text-3xl font-bold text-center text-white">Hizmetlerimiz</h2>
                            <Wrench size={32} className="text-white" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {services.map((service, index) => (
                                <ServiceCard
                                    key={index}
                                    imageSrc={service.imageSrc}
                                    title={service.title}
                                    description={service.description}
                                    buttonText={service.buttonText}
                                    buttonLink={service.buttonLink}
                                />
                            ))}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}