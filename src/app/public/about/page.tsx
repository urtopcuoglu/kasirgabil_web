"use client";
import React from "react";
import Image from "next/image";
import { Wrench, Handshake, MapPin, Phone, Instagram, Linkedin, PawPrint, ShieldHalf } from 'lucide-react';

// Bileşenlerin doğru yollarını import edin
import Header from "@/app/component_page/header";
import Footer from "@/app/component_page/footer";
import ServiceCard from "@/app/component_page/ServicesCard";
import BrandCard from "@/app/component_page/BrandCard";

// Hizmetler bölümü için placeholder verisi
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
        imageSrc: '/services/alisveris.jpg',
        title: 'Sıfır ve İkinci El Alışveriş',
        description: 'Tüm bilgisayar, donanım ve cihazlarda sıfır ve ikinci el alışveriş imkanı.',
        buttonText: 'Alışveriş Sayfasına Git',
        buttonLink: 'https://kasirgabilgisayar.sahibinden.com/',
    },
];

// Markalar bölümü için placeholder verisi
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


export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-zinc-800">
            <main className="flex-1 flex flex-col items-center p-8 pb-20 gap-16 sm:p-20">
                {/* Hakkımızda Section */}
                <section className="w-full max-w-6xl mx-auto py-8">
                    <div className="flex justify-center items-center gap-2 mb-12">
                        <h1 className="text-4xl font-bold text-center text-[var(--color-secondary)]">Hakkımızda</h1>
                        <ShieldHalf size={32} className="text-[var(--color-secondary)]" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Sol Kısım: Yazı */}
                        <div>
                            <h2 className="text-2xl font-semibold mb-4 text-[var(--color-secondary)]">Biz Kimiz?</h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                Kasırga Bilgisayar, 1999 yılında Ankara Adil Han İş Hanında, Babaros Er tarafından küçük bir dükkan içerisinde kuruldu. Uzun yıllar Adil Han İş hanında hizmet veren Kasırga Bilgisayar, kalitesi ve profesyonel hizmeti ile her zaman bir ileri giderek büyümüştür.
                                Ankara'nın en köklü en eski ve en başarılı Bilgisayar hizmetleri veren bir yer olma konumundadır. Kasırga Bilgisayar deneyimi ve profesyonel ekibi ile siz değerli müşterilere hizmet vermeye ve büyümeye devam edecektir.
                            </p>
                        </div>
                        {/* Sağ Kısım: Resim */}
                        <div className="relative w-full h-72">
                            <Image
                                src="/about/kasirga-pc-dis-cekim.png"
                                alt="Kasırga Bilgisayar"
                                layout="fill"
                                objectFit="cover"
                                className="rounded-lg shadow-lg"
                            />
                        </div>
                    </div>
                </section>

                {/* Misyon & Vizyon Section */}
                <section className="w-full max-w-6xl mx-auto py-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Misyonumuz */}
                        <div className="bg-[var(--color-primary)] text-white p-6 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-bold mb-4">Misyonumuz</h2>
                            <p className="text-sm">
                                1999 yılından beri Ankara'da edindiğimiz tecrübeyle, müşterilerimize en kaliteli ve profesyonel bilgisayar hizmetlerini sunmak. Her geçen gün büyüyen ve gelişen bir firma olarak, teknolojiyi yakından takip ederek kaliteden ödün vermeden güvenilir bir çözüm ortağı olmayı hedefliyoruz.
                            </p>
                        </div>
                        {/* Vizyonumuz */}
                        <div className="bg-[var(--color-primary)] text-white p-6 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-bold mb-4">Vizyonumuz</h2>
                            <p className="text-sm">
                                Ankara'nın en köklü ve başarılı bilgisayar hizmeti veren firması olma konumumuzu koruyarak, profesyonel ekibimizle sürekli büyüyen bir müşteri kitlesine hitap etmek. Müşteri memnuniyetini daima ön planda tutarak sektördeki liderliğimizi sürdürmek ve yenilikçi çözümlerimizle geleceğin teknolojisine yön veren bir marka olmaktır.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Hizmetlerimiz Section */}
                <section className="w-full max-w-6xl mx-auto py-8">
                    <div className="flex justify-center items-center gap-2 mb-8">
                        <h2 className="text-3xl font-bold text-center text-[var(--color-secondary)]">Hizmetlerimiz</h2>
                        <Wrench size={32} className="text-[var(--color-secondary)]" />
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

                {/* Çözüm Ortaklarımız Section */}
                <section className="w-full max-w-6xl mx-auto py-8">
                    <div className="flex justify-center items-center gap-2 mb-12">
                        <h2 className="text-3xl font-bold text-center text-[var(--color-secondary)]">Çözüm Ortaklarımız</h2>
                        <Handshake size={32} className="text-[var(--color-secondary)]" />
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                        {brands.map((brand, index) => (
                            <BrandCard key={index} brandName={brand.brandName} logoSrc={brand.logoSrc} />
                        ))}
                    </div>
                </section>

                {/* Harita & İletişim Section */}
                <section className="w-full max-w-6xl mx-auto py-8 bg-white rounded-lg shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Sol Kısım: Harita */}
                        <div className="relative h-96 rounded-lg overflow-hidden">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3059.9040725714985!2d32.8548301805978!3d39.921162882348305!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14d34e55abbc6c7d%3A0xa2355776a7dcc283!2sKas%C4%B1rga%20Bilgisayar!5e0!3m2!1str!2str!4v1757334064887!5m2!1str!2str"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen={true}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                        {/* Sağ Kısım: İletişim Bilgileri */}
                        <div className="p-4 space-y-8">
                            {/* Adres */}
                            <div>
                                <h3 className="text-lg font-bold mb-2 text-[var(--color-secondary)]">Adresimiz</h3>
                                <div className="flex items-center space-x-2">
                                    <MapPin size={16} className="text-[var(--color-primary)]" />
                                    <p className="text-gray-600">
                                        Cumhuriyet Mh. Bayındır-1 Sk. 5/10<br />
                                        Kızılay / Çankaya - Ankara
                                    </p>
                                </div>
                            </div>
                            {/* İletişim Numaraları */}
                            <div>
                                <h3 className="text-lg font-bold mb-2 text-[var(--color-secondary)]">İletişim Numaralarımız</h3>
                                <div className="space-y-1">
                                    <div className="flex items-center space-x-2">
                                        <Phone size={16} className="text-[var(--color-primary)]" />
                                        <p className="text-gray-600">0 (312) 431 02 64</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Phone size={16} className="text-[var(--color-primary)]" />
                                        <p className="text-gray-600">0 (505) 387 79 39</p>
                                    </div>
                                </div>
                            </div>
                            {/* Sosyal Medya */}
                            <div>
                                <h3 className="text-lg font-bold mb-2 text-[var(--color-secondary)]">Sosyal Medya Hesaplarımız</h3>
                                <div className="flex space-x-4">
                                    <a href="#" className="text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors">
                                        <Linkedin size={24} />
                                    </a>
                                    <a href="#" className="text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors">
                                        <Instagram size={24} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}