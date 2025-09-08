// src/app/component_page/ServiceCard.tsx
import React from 'react';
import Image from 'next/image';

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
    return (
        <div className="flex flex-col items-center p-4 border border-gray-200 rounded-lg shadow-sm bg-white hover:shadow-lg transition-shadow duration-300">
            {/* Resim Kısmı */}
            <div className="relative w-full h-48 mb-4 rounded-md overflow-hidden">
                <Image
                    src={imageSrc}
                    alt={title}
                    layout="fill"
                    objectFit="cover"
                />
            </div>

            {/* İçerik Kısmı */}
            <div className="text-center">
                <h3 className="text-xl font-bold mb-2 text-secondary-900">
                    {title}
                </h3>
                <p className="text-sm text-secondary-600 mb-4">
                    {description}
                </p>
            </div>

            {/* Buton */}
            <a
                href={buttonLink}
                className="inline-block px-6 py-2 bg-[var(--color-tertiary)] text-white rounded-full font-semibold hover:bg-[var(--color-secondary)] transition-colors"
            >
                {buttonText}
            </a>
        </div>
    );
};

export default ServiceCard;