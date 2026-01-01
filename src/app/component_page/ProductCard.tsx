// src/app/component_page/ProductCard.tsx
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
        <div className="flex border-2 border-gray-200 hover:border-[var(--color-primary)] rounded-2xl shadow-md hover:shadow-2xl bg-white overflow-hidden group transition-all duration-300 ease-out transform hover:-translate-y-2 w-full h-full animate-fadeIn">
            {/* Sol Kısmı: Resim */}
            <div className="relative w-1/3 flex-shrink-0 overflow-hidden">
                <Image
                    src={imageSrc}
                    alt={imageAlt}
                    layout="fill"
                    objectFit="cover"
                    className="group-hover:scale-110 transition-transform duration-300"
                />
            </div>

            {/* Sağ Kısmı: İçerik */}
            <div className="p-4 flex flex-col justify-between flex-grow w-2/3">
                <div>
                    {/* Başlık */}
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 group-hover:text-[var(--color-primary)] transition-colors duration-300">
                        {title}
                    </h3>
                    {/* Paragraf Açıklaması */}
                    <p className="text-sm text-gray-600 mb-4">
                        {description}
                    </p>
                </div>

                {/* Buton */}
                <a
                    href={buttonLink}
                    className="inline-block self-start px-6 py-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm font-medium mt-auto transform active:scale-95"
                >
                    {buttonText}
                </a>
            </div>
        </div>
    );
};

export default ProductCard;