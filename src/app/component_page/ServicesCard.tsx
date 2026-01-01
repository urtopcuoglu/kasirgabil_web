// src/app/component_page/ServiceCard.tsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface ServiceCardProps {
    imageSrc: string;
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
                                                     imageSrc,
                                                     title,
                                                     description,
                                                     buttonText,
                                                     buttonLink,
                                                 }) => {
    // Check if link is external
    const isExternal = buttonLink.startsWith('http');

    return (
        <div className="group flex flex-col items-center p-6 border-2 border-gray-200 hover:border-[var(--color-primary)] rounded-2xl shadow-md hover:shadow-2xl bg-white transition-all duration-300 ease-out transform hover:-translate-y-2 animate-fadeIn">
            {/* Resim Kısmı */}
            <div className="relative w-full h-48 mb-4 rounded-xl overflow-hidden">
                <Image
                    src={imageSrc}
                    alt={title}
                    layout="fill"
                    objectFit="cover"
                    className="group-hover:scale-110 transition-transform duration-300"
                />
            </div>

            {/* İçerik Kısmı */}
            <div className="text-center">
                <h3 className="text-xl font-bold mb-2 text-secondary-900 group-hover:text-[var(--color-primary)] transition-colors duration-300">
                    {title}
                </h3>
                <p className="text-sm text-secondary-600 mb-4">
                    {description}
                </p>
            </div>

            {/* Buton */}
            {isExternal ? (
                <a
                    href={buttonLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-8 py-3 bg-gradient-to-r from-[var(--color-tertiary)] to-[var(--color-primary)] text-white rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 transform active:scale-95"
                >
                    {buttonText}
                </a>
            ) : (
                <Link
                    href={buttonLink}
                    className="inline-block px-8 py-3 bg-gradient-to-r from-[var(--color-tertiary)] to-[var(--color-primary)] text-white rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 transform active:scale-95"
                >
                    {buttonText}
                </Link>
            )}
        </div>
    );
};

export default ServiceCard;