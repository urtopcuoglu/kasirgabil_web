// src/app/components/BrandCard.tsx
import React from 'react';
import Image from 'next/image';

interface BrandCardProps {
    brandName: string;
    logoSrc: string;
}

const BrandCard: React.FC<BrandCardProps> = ({ brandName, logoSrc }) => {
    return (
        <div className="relative w-full h-16 p-2 md:h-20 lg:h-24 flex items-center justify-center border border-zinc-300 rounded-lg shadow-sm hover:border-violet-600 transition-colors duration-300">
            <Image
                src={logoSrc}
                alt={`${brandName} Logo`}
                layout="fill"
                objectFit="contain"
                className="p-2"
            />
        </div>
    );
};

export default BrandCard;