"use client";
import React, { useId, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Wrench, Home, Info, ShoppingBag, Hammer, Mail, Moon, Sun, MapPin, Phone, Instagram, Linkedin, Landmark, Smartphone, Copy, Check } from 'lucide-react';

// Banka Hesapları Veri Yapısı
const bankAccounts = [
    {
        id: 1,
        name: 'Garanti BBVA',
        accountNumber: '1234567890',
        iban: 'TR12 0001 0001 XXXXX',
        logo: '/bank/garanti.png',
    },
    {
        id: 2,
        name: 'İş Bankası',
        accountNumber: '9876543210',
        iban: 'TR34 0001 0002 XXXXX',
        logo: '/bank/is-bankasi.png',
    },
    {
        id: 3,
        name: 'Yapı Kredi',
        accountNumber: '5555666677',
        iban: 'TR56 0001 0003 XXXXX',
        logo: '/bank/yapi-kredi.jpg',
    },
    {
        id: 4,
        name: 'Enpara',
        accountNumber: '1111222233',
        iban: 'TR78 0001 0004 XXXXX',
        logo: '/bank/enpara.png',
    },
];

const Header = () => {
    const [exchangeRates, setExchangeRates] = useState<{ usd: string | null; eur: string | null }>({ usd: null, eur: null });
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchExchangeRates = async () => {
            try {
                const response = await fetch('https://api.exchangerate-api.com/v4/latest/TRY');
                const data = await response.json();

                // USD ve EUR'ün TRY karşılığını bul (ters işlem yapıyoruz)
                const usdRate = 1 / data.rates.USD;
                const eurRate = 1 / data.rates.EUR;

                setExchangeRates({
                    usd: usdRate.toFixed(2),
                    eur: eurRate.toFixed(2)
                });
                setLoading(false);
            } catch (error) {
                console.error('Döviz kuru alınamadı:', error);
                setLoading(false);
                // Hata durumunda varsayılan değerler
                setExchangeRates({
                    usd: '35.00',
                    eur: '37.00'
                });
            }
        };

        fetchExchangeRates();

        // Her 5 dakikada bir güncelle
        const interval = setInterval(fetchExchangeRates, 300000);
        return () => clearInterval(interval);
    }, []);

    return (
        <header className="site-header bg-[var(--color-secondary)] text-primary shadow-md">
            {/* Top Bar for Exchange Rates, Address, Phone, and Socials */}
            <div className="bg-white text-[var(--color-secondary)] text-xs py-2 px-4 w-full">
                <div className="container mx-auto flex justify-between items-center">
                    {/* Döviz Kurları (Sola Yaslı) */}
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white rounded-full font-semibold hover:shadow-md transition-all duration-300">
                            <span>1$ = </span>
                            <span>{loading ? '...' : `${exchangeRates.usd} ₺`}</span>
                        </div>
                        <div className="flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white rounded-full font-semibold hover:shadow-md transition-all duration-300">
                            <span>1€ = </span>
                            <span>{loading ? '...' : `${exchangeRates.eur} ₺`}</span>
                        </div>
                    </div>

                    {/* Adres ve Telefon (Orta) */}
                    <div className="hidden lg:flex items-center space-x-6">
                        <div className="flex items-center space-x-1">
                            <MapPin size={16} className="text-[var(--color-secondary)]" />
                            <span>Cumhuriyet Mh. Bayındır-1 Sk. 5/10 Çankaya/Ankara</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <Phone size={16} className="text-[var(--color-secondary)]" />
                            <span>0312 431 02 64</span>
                        </div>
                    </div>

                    {/* Banka Hesapları ve Sosyal Medya (Sağa Yaslı) */}
                    <div className="flex items-center space-x-4">
                        <Popover>
                            <PopoverTrigger asChild>
                                <button className="flex items-center space-x-1 hover:text-[var(--color-primary)] transition-colors text-inherit focus:outline-none cursor-pointer">
                                    <Landmark size={16} className="text-[var(--color-secondary)]" />
                                    <span className="hidden sm:inline">Banka Hesaplarımız</span>
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full md:w-96 bg-white">
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <h4 className="font-bold text-lg text-gray-800 flex items-center space-x-2">
                                            <Landmark size={20} className="text-[var(--color-primary)]" />
                                            <span>Banka Hesaplarımız</span>
                                        </h4>
                                        <p className="text-sm text-gray-600">Kasırga Bilgisayar'a ait banka hesap bilgileri</p>
                                    </div>
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {bankAccounts.map((bank) => (
                                            <div key={bank.id} className="border-2 border-gray-200 rounded-lg p-3 hover:border-[var(--color-primary)] transition-all duration-300 hover:shadow-md">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                        {bank.logo && (
                                                            <Image
                                                                src={bank.logo}
                                                                alt={bank.name}
                                                                width={40}
                                                                height={40}
                                                                className="object-contain"
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="flex-grow">
                                                        <p className="font-semibold text-gray-800 text-sm">{bank.name}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2 text-xs bg-gray-50 rounded p-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-600">Hesap No:</span>
                                                        <code className="bg-white px-2 py-1 rounded text-gray-800 font-mono text-xs break-all">{bank.accountNumber}</code>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-600">IBAN:</span>
                                                        <code className="bg-white px-2 py-1 rounded text-gray-800 font-mono text-xs break-all">{bank.iban}</code>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded text-xs text-gray-700">
                                        <p className="font-semibold mb-1">📌 Önemli Bilgi</p>
                                        <p>Lütfen ödeme yapmadan önce bize iletişim kurarak hesap bilgilerini doğrulayınız.</p>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center space-x-1 hover:text-[var(--color-primary)] transition-colors text-inherit focus:outline-none">
                                <Smartphone size={16} className="text-[var(--color-secondary)]" />
                                <span className="hidden sm:inline">Sosyal Medya</span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem asChild>
                                    <a href="https://www.instagram.com/kasirgabilgisayar" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2">
                                        <Instagram size={16} />
                                        <span>Instagram</span>
                                    </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <a href="https://www.linkedin.com/company/kasirgabilgisayar" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2">
                                        <Linkedin size={16} />
                                        <span>LinkedIn</span>
                                    </a>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            <nav className="container mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 py-6 px-4 min-h-24">
                <div className="logo text-2xl font-bold">
                    <Link href="/">
                        <Image
                            src="/logo/logo-beyaz.png"
                            alt="Site Logosu"
                            width={150}
                            height={50}
                            priority
                        />
                    </Link>
                </div>

                {/* Search Box and Navigation Container */}
                <div className="flex-grow flex items-center justify-end">
                {/* Search Box */}
                    <div className="flex w-full max-w-lg border-2 border-white hover:border-[var(--color-primary)] rounded-full overflow-hidden mr-12 transition-colors duration-300 focus-within:border-[var(--color-primary)]">
                        <input
                            type="text"
                            placeholder="Aradığın ürün burada?"
                            className="w-full pl-4 py-3 focus:outline-none text-sm md:text-base text-white placeholder-gray-300 bg-transparent transition-all duration-300"
                        />
                        <button className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white px-6 py-3 font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 transform active:scale-95">
                            Arama
                        </button>
                    </div>

                    <div className="flex items-center space-x-6">
                        <ul className="flex space-x-4 text-white">
                            <li className="flex items-center space-x-1 border-b-2 border-transparent hover:border-[var(--color-primary)] transition-all duration-300 pb-1">
                                <Home size={16} />
                                <Link href="/" className="hover:text-[var(--color-primary)] transition-colors">Anasayfa</Link>
                            </li>
                            <li className="flex items-center space-x-1 border-b-2 border-transparent hover:border-[var(--color-primary)] transition-all duration-300 pb-1">
                                <Info size={16} />
                                <Link href="../public/about" className="hover:text-[var(--color-primary)] transition-colors">Hakkımızda</Link>
                            </li>
                            <li className="flex items-center space-x-1 border-b-2 border-transparent hover:border-[var(--color-primary)] transition-all duration-300 pb-1">
                                <Wrench size={16} />
                                <Link href="/services" className="hover:text-[var(--color-primary)] transition-colors">Hizmetlerimiz</Link>
                            </li>
                            <li className="flex items-center space-x-1 border-b-2 border-transparent hover:border-[var(--color-primary)] transition-all duration-300 pb-1">
                                <Mail size={16} />
                                <Link href="../public/contact" className="hover:text-[var(--color-primary)] transition-colors">İletişim</Link>
                            </li>
                            <li className="flex items-center space-x-1 border-b-2 border-transparent hover:border-[var(--color-primary)] transition-all duration-300 pb-1"><Hammer size={16} /><Link href="/services/teknik-servis" className="hover:text-[var(--color-primary)] transition-colors">Teknik Servis</Link></li>
                        </ul>

                    </div>
                </div>
            </nav>

            {/* Banner Section below Header */}
            <div className="bg-[var(--color-primary)] text-white py-2 px-4">
                <div className="container mx-auto flex justify-between items-center text-sm font-semibold">
                    <Link href="#" className="border-b-2 border-transparent hover:border-white transition-all duration-300">Güvenin Başkenti</Link>
                    <Link href="#" className="border-b-2 border-transparent hover:border-white transition-all duration-300 text-right">Kasırga Bilgisayar Teknik Servis ve Alışveriş Rehberi</Link>
                </div>
            </div>
        </header>
    );
};

const SwitchDualIconLabelDemo = () => {
    const id = useId();
    const [checked, setChecked] = useState(false);

    const toggleSwitch = () => setChecked(prev => !prev);

    return (
        <div className='group inline-flex items-center gap-2' data-state={checked ? 'checked' : 'unchecked'}>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-labelledby={`${id}-dark-mode`}
                data-state={checked ? 'checked' : 'unchecked'}
                className="inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[var(--color-secondary)] data-[state=unchecked]:bg-[var(--color-secondary)]"
                onClick={toggleSwitch}
            >
                <span className="sr-only">Toggle theme</span>
                <span
                    data-state={checked ? 'checked' : 'unchecked'}
                    className="pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[data-state=unchecked]:translate-x-0"
                />
            </button>
        </div>
    );
};

export default Header;