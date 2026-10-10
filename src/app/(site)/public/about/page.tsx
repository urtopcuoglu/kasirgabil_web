import type { Metadata } from "next";
import Image from "next/image";
import { Wrench, MapPin, Phone, Instagram, Linkedin, ShieldHalf, Banknote } from 'lucide-react';

import ServiceCard from "@/app/component_page/ServicesCard";
import BankCard from "@/app/component_page/BankCard";
import { htmlTemizle } from "@/lib/html";
import { siteIcerigi } from "@/lib/icerik";
import { telLinki } from "@/lib/schemas/icerik";

export const metadata: Metadata = {
    title: "Hakkımızda | Kasırga Bilgisayar",
    description: "1999'dan beri Ankara'da bilgisayar satış, tamir ve teknik servis hizmeti veren Kasırga Bilgisayar hakkında.",
};

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
        buttonLink: 'https://www.ortisoft.com.tr',
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

// Metinler, banka hesapları ve iletişim bilgileri panelden düzenlenir (site_icerikleri).
export default async function AboutPage() {
    const [hakkimizda, banka, iletisim] = await Promise.all([
        siteIcerigi("hakkimizda"),
        siteIcerigi("banka_hesaplari"),
        siteIcerigi("iletisim"),
    ]);
    const hesaplar = banka?.hesaplar ?? [];

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
                            <div
                                className="prose max-w-none text-gray-600 dark:text-gray-300"
                                dangerouslySetInnerHTML={{ __html: htmlTemizle(hakkimizda?.biz_kimiz ?? "") }}
                            />
                        </div>
                        {/* Sağ Kısım: Resim */}
                        {hakkimizda?.gorsel && (
                            <div className="relative w-full h-72">
                                <Image
                                    src={hakkimizda.gorsel}
                                    alt="Kasırga Bilgisayar"
                                    fill
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    className="rounded-lg object-cover shadow-lg"
                                />
                            </div>
                        )}
                    </div>
                </section>

                {/* Misyon & Vizyon Section */}
                <section className="w-full max-w-6xl mx-auto py-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Misyonumuz */}
                        <div className="bg-[var(--color-primary)] text-white p-6 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-bold mb-4">Misyonumuz</h2>
                            <p className="whitespace-pre-line text-sm">{hakkimizda?.misyon}</p>
                        </div>
                        {/* Vizyonumuz */}
                        <div className="bg-[var(--color-primary)] text-white p-6 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-bold mb-4">Vizyonumuz</h2>
                            <p className="whitespace-pre-line text-sm">{hakkimizda?.vizyon}</p>
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

                {/* Banka Hesapları Section */}
                <section className="w-full max-w-6xl mx-auto py-8 text-center">
                    <div className="flex flex-col items-center mb-8">
                        <div className="flex items-center space-x-2">
                            <Banknote size={32} className="text-[var(--color-secondary)]" />
                            <h2 className="text-3xl font-bold text-[var(--color-secondary)]">Banka Hesapları</h2>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            Aşağıdaki hesap numaralarından ödeme yapabilirsiniz.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {hesaplar.map((hesap) => (
                            <BankCard
                                key={hesap.iban}
                                logoSrc={hesap.logo}
                                accountName={hesap.hesap_adi}
                                branch={hesap.sube || undefined}
                                accountNumber={hesap.hesap_no || undefined}
                                iban={hesap.iban}
                            />
                        ))}
                    </div>
                </section>

                {/* Harita & İletişim Section */}
                <section className="w-full max-w-6xl mx-auto py-8 bg-white rounded-lg shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Sol Kısım: Harita */}
                        <div className="relative h-96 rounded-lg overflow-hidden">
                            {iletisim?.harita_url && (
                                <iframe
                                    title="Kasırga Bilgisayar konumu"
                                    src={iletisim.harita_url}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen={true}
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            )}
                        </div>
                        {/* Sağ Kısım: İletişim Bilgileri */}
                        <div className="p-4 space-y-8">
                            {/* Adres */}
                            <div>
                                <h3 className="text-lg font-bold mb-2 text-[var(--color-secondary)]">Adresimiz</h3>
                                <div className="flex items-center space-x-2">
                                    <MapPin size={16} className="text-[var(--color-primary)]" />
                                    <p className="whitespace-pre-line text-gray-600">{iletisim?.adres}</p>
                                </div>
                            </div>
                            {/* İletişim Numaraları */}
                            <div>
                                <h3 className="text-lg font-bold mb-2 text-[var(--color-secondary)]">İletişim Numaralarımız</h3>
                                <div className="space-y-1">
                                    {iletisim?.telefonlar.map((tel) => (
                                        <div key={tel} className="flex items-center space-x-2">
                                            <Phone size={16} className="text-[var(--color-primary)]" />
                                            <a href={telLinki(tel)} className="text-gray-600 hover:text-[var(--color-primary)]">{tel}</a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Sosyal Medya */}
                            <div>
                                <h3 className="text-lg font-bold mb-2 text-[var(--color-secondary)]">Sosyal Medya Hesaplarımız</h3>
                                <div className="flex space-x-4">
                                    {iletisim?.linkedin && (
                                        <a href={iletisim.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors">
                                            <Linkedin size={24} />
                                        </a>
                                    )}
                                    {iletisim?.instagram && (
                                        <a href={iletisim.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors">
                                            <Instagram size={24} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}