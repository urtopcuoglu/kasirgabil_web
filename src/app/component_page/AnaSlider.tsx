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
import type { SlaytOdagi, Slider } from "@/lib/schemas/icerik";
import { cn } from "@/lib/utils";

// Eski kayıtlarda odak alanı olmayabilir; o zaman ortadan kırpılır.
const ODAK_SINIFI: Record<SlaytOdagi, string> = { ust: "object-top", orta: "object-center", alt: "object-bottom" };

export default function AnaSlider({ slaytlar }: { slaytlar: Slider["slaytlar"] }) {
    if (slaytlar.length === 0) return null;

    return (
        // Yükseklik genişlikle orantılı: mobilde görselin tamamı (3:2), geniş ekranda 21:9, en fazla 640 px.
        // Kırpılan kısım slaytın odağına göre seçilir (panelde "Görsel odağı").
        <div className="relative mb-12 aspect-[3/2] max-h-[640px] w-full sm:aspect-[2/1] lg:aspect-[21/9]">
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
                            className={cn("object-cover", ODAK_SINIFI[slayt.odak ?? "orta"])}
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
