"use client"; // Swiper, client-side rendering gerektirir

import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';

// Swiper stillerini içe aktarıyoruz
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

interface ImageSliderProps {
    images: string[];
}

const ImageSlider: React.FC<ImageSliderProps> = ({ images }) => {
    const [imageLoaded, setImageLoaded] = useState<boolean[]>(new Array(images.length).fill(false));
    const [error, setError] = useState(false);

    const handleImageLoad = (index: number) => {
        setImageLoaded(prev => {
            const newArray = [...prev];
            newArray[index] = true;
            return newArray;
        });
    };

    const handleImageError = () => {
        setError(true);
    };

    if (error) {
        return <div className="text-center text-red-500">Resimler yüklenirken bir hata oluştu.</div>;
    }

    return (
        <Swiper
            modules={[Pagination, Navigation, Autoplay]}
            spaceBetween={50}
            slidesPerView={1}
            navigation={true}
            pagination={{ clickable: true }}
            loop={true}
            autoplay={{
                delay: 2500,
                disableOnInteraction: false,
            }}
            className="mySwiper"
        >
            {images.map((src, index) => (
                <SwiperSlide key={index}>
                    {!imageLoaded[index] && (
                        <div className="flex justify-center items-center h-96 text-lg">
                            Yükleniyor...
                        </div>
                    )}
                    <img
                        src={src}
                        alt={`Slider Resim ${index + 1}`}
                        onLoad={() => handleImageLoad(index)}
                        onError={handleImageError}
                        className="w-full h-auto object-cover rounded-lg shadow-lg"
                        style={{ display: imageLoaded[index] ? 'block' : 'none', minHeight: '384px' }}
                    />
                </SwiperSlide>
            ))}
        </Swiper>
    );
};

export default ImageSlider;
