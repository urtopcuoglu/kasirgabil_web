"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Header = () => {
    return (
        <header className="site-header bg-[var(--color-secondary)]  text-primary p-4 shadow-md">
            <nav className="container mx-auto flex justify-between items-center">
                <div className="logo text-2xl font-bold">
                    <Link href="/">
                        <Image
                            src="/logo/logo-beyaz.png"
                            alt="Site Logosu"
                            width={150} // Logonuzun genişliğini buradan ayarlayabilirsiniz
                            height={50} // Logonuzun yüksekliğini buradan ayarlayabilirsiniz
                            priority // Sayfa yüklendiğinde öncelikli olarak yüklenmesini sağlar
                        />
                    </Link>
                </div>
                <ul className="flex space-x-4">
                    <li>
                        <Link href="/" className="hover:text-gray-300">Anasayfa</Link>
                    </li>
                    <li>
                        <Link href="../public/about" className="hover:text-gray-300">Hakkımızda</Link>
                    </li>
                    <li>
                        <Link href="../public/products" className="hover:text-gray-300">Ürünler</Link>
                    </li>
                    <li>
                        <Link href="../public/contact" className="hover:text-gray-300">İletişim</Link>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
