// src/app/components/ProductCard.tsx
import React from 'react';
import Image from 'next/image';

interface ProductCardProps {
    imageSrc: string;
    imageAlt: string;
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
                                                     imageSrc,
                                                     imageAlt,
                                                     title,
                                                     description,
                                                     buttonText,
                                                     buttonLink,
                                                 }) => {
    return (
        <div className="flex border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden group hover:shadow-md transition-shadow duration-300 w-full h-full">
            {/* Sol Kısmı: Resim */}
            <div className="relative w-1/3 flex-shrink-0">
                <Image
                    src={imageSrc}
                    alt={imageAlt}
                    layout="fill"
                    objectFit="cover"
                    className="group-hover:scale-105 transition-transform duration-300"
                />
            </div>

            {/* Sağ Kısmı: İçerik */}
            <div className="p-4 flex flex-col justify-between flex-grow w-2/3">
                <div>
                    {/* Başlık */}
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">
                        {title}
                    </h3>
                    {/* Paragraf Açıklaması */}
                    <p className="text-sm text-gray-600 mb-4">
                        {description}
                    </p>
                </div>

                {/* Buton (İsteğe bağlı, görselde olmasa da ekliyorum) */}
                <a
                    href={buttonLink}
                    className="inline-block self-start px-4 py-2 bg-[var(--color-primary)] text-white rounded-full hover:bg-[var(--color-secondary)] transition-colors text-sm font-medium mt-auto"
                >
                    {buttonText}
                </a>
            </div>
        </div>
    );
};

export default ProductCard;