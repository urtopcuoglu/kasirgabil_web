// src/app/component_page/AnaSlider.tsx
// Anasayfanın üstündeki kayan görseller. Slaytlar panelden düzenlenir (site_icerikleri: anasayfa_slider).
"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import type { Slider } from "@/lib/schemas/icerik";

export default function AnaSlider({ slaytlar }: { slaytlar: Slider["slaytlar"] }) {
    if (slaytlar.length === 0) return null;

    return (
        <div className="relative mb-12 h-[500px] w-full">
            <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={30}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                loop={slaytlar.length > 1}
                className="mySwiper h-full w-full"
            >
                {slaytlar.map((slayt, i) => {
                    const gorsel = (
                        <Image
                            src={slayt.gorsel}
                            alt={slayt.aciklama || `Kasırga Bilgisayar ${i + 1}`}
                            fill
                            priority={i === 0}
                            sizes="100vw"
                            className="object-cover"
                        />
                    );
                    return (
                        <SwiperSlide key={`${slayt.gorsel}-${i}`}>
                            {slayt.link ? (
                                <Link href={slayt.link} className="relative block size-full">
                                    {gorsel}
                                </Link>
                            ) : (
                                gorsel
                            )}
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </div>
    );
}
