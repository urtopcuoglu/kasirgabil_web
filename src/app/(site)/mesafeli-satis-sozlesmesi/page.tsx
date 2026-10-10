// src/app/(site)/mesafeli-satis-sozlesmesi/page.tsx
// Metin panelden düzenlenir (site_icerikleri: mesafeli).
import type { Metadata } from "next";
import { FileText } from "lucide-react";
import YasalSayfa from "@/app/component_page/YasalSayfa";
import { siteIcerigi } from "@/lib/icerik";

export const metadata: Metadata = {
    title: "Mesafeli Satış Sözleşmesi | Kasırga Bilgisayar",
    description: "Kasırga Bilgisayar mesafeli satış sözleşmesi — ürün ve hizmet satın alımlarında geçerli şart ve koşullar.",
};

export default async function MesafeliSatisSozlesmesiPage() {
    return <YasalSayfa sayfa={await siteIcerigi("mesafeli")} Ikon={FileText} />;
}
