// src/actions/urun-arama.ts
// Vitrindeki ürün araması: aranan kelime adres çubuğunda (?ara=) taşınmaz; tarayıcı geçmişine, sunucu/proxy
// kayıtlarına ve paylaşılan linklere düşmesin diye yalnızca /urunler yoluna ait, JS'in okuyamadığı bir çerezde tutulur.
"use server";

import { cookies } from "next/headers";
import { URUN_ARAMA_CEREZI } from "@/lib/site-urunleri";

// Boş metin aramayı temizler. Çerez değişince Next.js sayfayı yeni aramayla yeniden çizer.
export async function urunAramasiniAyarla(ara: string) {
    const deger = String(ara ?? "").trim().slice(0, 100);
    const cerezler = await cookies();
    if (!deger) {
        cerezler.delete({ name: URUN_ARAMA_CEREZI, path: "/urunler" });
        return;
    }
    cerezler.set(URUN_ARAMA_CEREZI, deger, {
        path: "/urunler",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 30, // 30 dakika
    });
}
