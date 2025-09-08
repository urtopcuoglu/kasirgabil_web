"use client";
import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Wrench, ScanBarcode } from 'lucide-react';

import Header from "@/app/component_page/header";
import Footer from "@/app/component_page/footer";
import ProductCard from "@/app/component_page/ProductCard";
import ServiceCard from "@/app/component_page/ServicesCard";
import BrandCard from "@/app/component_page/BrandCard";

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
        imageSrc: '/product_image/cevrebirimler.jpg',
        imageAlt: 'Çevre Birimler',
        title: 'Çevre Birimleri',
        description: 'Hayatınızı kolaylaştıracak ilginç ve sıradışı teknolojik ürünleri keşfedin.',
        buttonText: 'Daha Fazla',
        buttonLink: '#',
    },
];

const services = [
    {
        imageSrc: '/services/technical-services.jpg',
        title: 'Tamir ve Bakım',
        description: 'Tüm bilgisayar ve bileşenleri için profesyonel tamir, bakım ve onarım hizmeti.',
        buttonText: 'Daha Fazlası',
        buttonLink: '#',
    },
    {
        imageSrc: '/services/web-design.jpg',
        title: 'Web Tasarım Çözümleri',
        description: 'İhtiyaçlarınıza uygun web tasarım, e-ticaret ve dijital pazarlama çözümleri.',
        buttonText: 'Daha Fazlası',
        buttonLink: 'http://urtopcuoglu.github.io',
    },
    {
        imageSrc: '/services/server-network.jpg',
        title: 'Kurumsal Destek',
        description: 'İşletmeler için IT altyapı çözümleri ve 7/24 teknik destek.',
        buttonText: 'Daha Fazlası',
        buttonLink: '#',
    },
    {
        imageSrc: '/services/alisveris.jpg', // Örnek dördüncü resim
        title: 'Sıfır ve İkinci El Alışveriş',
        description: 'Tüm bilgisayar, donanım ve cihazlarda sıfır ve ikinci el alışveriş imkanı.',
        buttonText: 'Alışveriş Sayfasına Git',
        buttonLink: 'https://kasirgabilgisayar.sahibinden.com/',
    },
];

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

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-zinc-800">

            <main className="flex-1 flex flex-col items-center">
                {/* Image Slider Component (Full-width) */}
                <div className="w-full relative h-[500px] mb-12">
                    <Swiper
                        modules={[Navigation, Pagination]}
                        spaceBetween={30}
                        slidesPerView={1}
                        navigation
                        pagination={{ clickable: true }}
                        onSlideChange={() => console.log('slide change')}
                        onSwiper={(swiper) => console.log(swiper)}
                        className="mySwiper w-full h-full"
                    >
                        {sliderImages.map((image, index) => (
                            <SwiperSlide key={index}>
                                <Image
                                    src={image}
                                    alt={`Slider Image ${index + 1}`}
                                    fill
                                    objectFit="cover"
                                    className="rounded-none shadow-none"
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                {/* Main Content Sections (p-8 ve p-20 buraya taşındı) */}
                <div className="p-8 pb-20 gap-16 sm:p-20 flex flex-col items-center">
                    {/* Product Categories Grid */}
                    <section className="w-full max-w-6xl mx-auto py-8">
                        <div className="flex justify-center items-center gap-2 mb-8">
                            <h2 className="text-3xl font-bold text-center text-[var(--color-secondary)] dark:text-white">Ürün Kategorileri</h2>
                            <ScanBarcode size={32} className="text-[var(--color-secondary)] dark:text-white" />
                        </div>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

                {/* Brands Section */}
                <section className="w-full py-16 px-8">
                    <div className="container mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-12 text-[var(--color-secondary)] dark:text-white">Markalarımız</h2>
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                            {brands.map((brand, index) => (
                                <BrandCard key={index} brandName={brand.brandName} logoSrc={brand.logoSrc} />
                            ))}
                        </div>
                        <p className="text-lg mt-8 text-gray-600 dark:text-gray-300">
                            Ve Diğer Tüm Markalarla Hizmetinizdeyiz...
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
}