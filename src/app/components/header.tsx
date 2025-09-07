"use client";
import React, { useId, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Home, Info, ShoppingBag, Mail, Moon, Sun } from 'lucide-react';

const Header = () => {
    return (
        <header className="site-header bg-[var(--color-secondary)] text-primary p-4 shadow-md">
            <nav className="container mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
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

                {/* Search Box */}
                <div className="flex-grow max-w-lg mx-auto w-full md:w-auto px-4 md:px-0">
                    <div className="flex w-full border border-gray-300 rounded-full overflow-hidden">
                        <input
                            type="text"
                            placeholder="Aradığın ürün burada?"
                            className="w-full pl-4 py-2 focus:outline-none text-sm md:text-base text-zinc-800 placeholder-gray-400"
                        />
                        <button className="bg-blue-600 text-white px-6 py-2 font-semibold hover:bg-blue-700 transition-colors">
                            Arama
                        </button>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
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
                            <Mail size={16} />
                            <Link href="../public/contact" className="hover:text-[var(--color-primary)] transition-colors">İletişim</Link>
                        </li>
                    </ul>
                    <div className='flex items-center space-x-2'>
                        <Moon size={16} className='text-white' />
                        <SwitchDualIconLabelDemo />
                        <Sun size={16} className='text-white' />
                    </div>
                </div>
            </nav>
        </header>
    );
};

const SwitchDualIconLabelDemo = () => {
    const id = useId();
    const [checked, setChecked] = useState(false); // Varsayılanı false olarak değiştirdim

    const toggleSwitch = () => setChecked(prev => !prev);

    return (
        <div className='group inline-flex items-center gap-2' data-state={checked ? 'checked' : 'unchecked'}>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-labelledby={`${id}-dark ${id}-light`}
                data-state={checked ? 'checked' : 'unchecked'}
                className="inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-zinc-700"
                onClick={toggleSwitch}
            >
                <span className="sr-only">Toggle theme</span>
                <span
                    data-state={checked ? 'checked' : 'unchecked'}
                    className="pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
                />
            </button>
        </div>
    );
};

export default Header;