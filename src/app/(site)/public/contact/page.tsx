import type { Metadata } from 'next';
import Image from 'next/image';
import { Mail, MapPin, Phone, Instagram, Linkedin } from 'lucide-react';
import { siteIcerigi } from '@/lib/icerik';
import { telLinki } from '@/lib/schemas/icerik';
import IletisimFormu from './IletisimFormu';

export const metadata: Metadata = {
    title: 'İletişim | Kasırga Bilgisayar',
    description: 'Kasırga Bilgisayar adres, telefon, e-posta ve konum bilgileri.',
};

// İletişim bilgileri panelden düzenlenir (site_icerikleri: iletisim).
export default async function ContactPage() {
    const iletisim = await siteIcerigi('iletisim');
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
                            <IletisimFormu />
                        </div>
                        {/* Sağ Kısım: Harita */}
                        <div className="relative w-full h-[600px] rounded-lg shadow-lg overflow-hidden">
                            {iletisim?.harita_url && <iframe
                                title="Kasırga Bilgisayar konumu"
                                src={iletisim.harita_url}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen={true}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>}
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
                                <p className="whitespace-pre-line text-sm text-gray-600">{iletisim?.adres}</p>
                            </div>
                            {/* Telefon Kartı */}
                            <div className="group bg-white p-6 rounded-lg shadow-lg text-center flex flex-col items-center gap-4 border-b-4 border-transparent hover:border-[var(--color-primary)] transition-all duration-300">
                                <Phone size={48} className="text-gray-400 group-hover:text-[var(--color-primary)] transition-colors" />
                                <h3 className="text-xl font-semibold text-[var(--color-secondary)]">Telefon Numaralarımız</h3>
                                <div className="space-y-1">
                                    {iletisim?.telefonlar.map((tel) => (
                                        <a key={tel} href={telLinki(tel)} className="block font-semibold text-[var(--color-secondary)] hover:text-[var(--color-primary)]">
                                            {tel}
                                        </a>
                                    ))}
                                </div>
                            </div>
                            {/* E-mail Kartı */}
                            <div className="group bg-white p-6 rounded-lg shadow-lg text-center flex flex-col items-center gap-4 border-b-4 border-transparent hover:border-[var(--color-primary)] transition-all duration-300">
                                <Mail size={48} className="text-gray-400 group-hover:text-[var(--color-primary)] transition-colors" />
                                <h3 className="text-xl font-semibold text-[var(--color-secondary)]">E-mail Adresimiz</h3>
                                {iletisim?.eposta && (
                                    <a href={`mailto:${iletisim.eposta}`} className="text-sm text-gray-600 hover:text-[var(--color-primary)]">
                                        {iletisim.eposta}
                                    </a>
                                )}
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
                                <a href={iletisim?.sahibinden || 'https://kasirgabilgisayar.sahibinden.com/'} target="_blank" rel="noopener noreferrer">
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
                                {iletisim?.instagram && (
                                    <a href={iletisim.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-colors">
                                        <Instagram size={32} />
                                    </a>
                                )}
                                {iletisim?.linkedin && (
                                    <a href={iletisim.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-colors">
                                        <Linkedin size={32} />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}