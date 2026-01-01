// src/app/component_page/BrandCard.tsx
import React from 'react';
import Image from 'next/image';

interface BrandCardProps {
    brandName: string;
    logoSrc: string;
    index?: number;
}

const BrandCard: React.FC<BrandCardProps> = ({ brandName, logoSrc, index = 0 }) => {
    return (
        <div
            className="group relative w-full h-24 md:h-28 lg:h-32 flex items-center justify-center bg-white rounded-2xl border-2 border-gray-200 hover:border-[var(--color-primary)] shadow-md hover:shadow-2xl transition-all duration-300 ease-out transform hover:scale-110 hover:-translate-y-1 animate-fadeIn overflow-hidden"
            style={{ animationDelay: `${index * 0.05}s` }}
        >
            {/* Gradient background on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Brand logo container */}
            <div className="relative z-10 w-full h-full flex items-center justify-center p-3 group-hover:scale-105 transition-transform duration-300">
                <Image
                    src={logoSrc}
                    alt={`${brandName} Logo`}
                    layout="fill"
                    objectFit="contain"
                    className="p-3 group-hover:brightness-110 transition-all duration-300"
                />
            </div>
        </div>
    );
};

export default BrandCard;