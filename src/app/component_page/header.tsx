"use client";
import React, { useId, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wrench, Home, Info, ShoppingBag, Mail, Moon, Sun, MapPin, Phone, Instagram, Linkedin, Landmark, Smartphone } from 'lucide-react';

const Header = () => {
    return (
        <header className="site-header bg-[var(--color-secondary)] text-primary shadow-md">
            {/* Top Bar for Address, Phone, and Socials */}
            <div className="bg-white text-[var(--color-secondary)] text-xs py-2 px-4 w-full">
                <div className="container mx-auto flex justify-between items-center">
                    {/* Adres ve Telefon (Sola Yaslı) */}
                    <div className="flex items-center space-x-6">
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
                        <Link href="#" className="flex items-center space-x-1 hover:text-[var(--color-primary)] transition-colors">
                            <Landmark size={16} className="text-[var(--color-secondary)]" />
                            <span>Banka Hesaplarımız</span>
                        </Link>
                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center space-x-1 hover:text-[var(--color-primary)] transition-colors text-inherit focus:outline-none">
                                <Smartphone size={16} className="text-[var(--color-secondary)]" />
                                <span>Sosyal Medya Hesaplarımız</span>
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

            <nav className="container mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 p-4">
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
                    <div className="flex w-full max-w-lg border border-gray-300 rounded-full overflow-hidden mr-12">
                        <input
                            type="text"
                            placeholder="Aradığın ürün burada?"
                            className="w-full pl-4 py-2 focus:outline-none text-sm md:text-base text-white placeholder-gray-400"
                        />
                        <button className="bg-blue-600 text-white px-6 py-2 font-semibold hover:bg-blue-700 transition-colors">
                            Arama
                        </button>
                    </div>

                    <div className="flex items-center space-x-6">
                        <ul className="flex space-x-4 text-white">
                            <li className="flex items-center space-x-1">
                                <Home size={16} />
                                <Link href="/" className="hover:text-[var(--color-primary)] transition-colors">Anasayfa</Link>
                            </li>
                            <li className="flex items-center space-x-1">
                                <Info size={16} />
                                <Link href="../public/about" className="hover:text-[var(--color-primary)] transition-colors">Hakkımızda</Link>
                            </li>
                            <li className="flex items-center space-x-1">
                                <ShoppingBag size={16} />
                                <Link href="../public/products" className="hover:text-[var(--color-primary)] transition-colors">Ürünler</Link>
                            </li>
                            <li className="flex items-center space-x-1">
                                <Wrench size={16} />
                                <Link href="../public/services" className="hover:text-[var(--color-primary)] transition-colors">Hizmetlerimiz</Link>
                            </li>
                            <li className="flex items-center space-x-1">
                                <Mail size={16} />
                                <Link href="../public/contact" className="hover:text-[var(--color-primary)] transition-colors">İletişim</Link>
                            </li>
                        </ul>
                        <div className='flex items-center space-x-4'>
                            <Moon size={16} className='text-white' />
                            <SwitchDualIconLabelDemo />
                            <Sun size={16} className='text-white' />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Banner Section below Header */}
            <div className="bg-[var(--color-primary)] text-white py-2 px-4">
                <div className="container mx-auto flex justify-between items-center text-sm font-semibold">
                    <Link href="#" className="hover:underline">Güvenin Başkenti</Link>
                    <Link href="#" className="hover:underline text-right">Kasırga Bilgisayar Teknik Servis ve Alışveriş Rehberi</Link>
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