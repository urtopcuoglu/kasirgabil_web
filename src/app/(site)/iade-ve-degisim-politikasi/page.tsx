// src/app/(site)/iade-ve-degisim-politikasi/page.tsx
// Metin panelden düzenlenir (site_icerikleri: iade).
import type { Metadata } from "next";
import { RefreshCw } from "lucide-react";
import YasalSayfa from "@/app/component_page/YasalSayfa";
import { siteIcerigi } from "@/lib/icerik";

export const metadata: Metadata = {
    title: "İade ve Değişim Politikası | Kasırga Bilgisayar",
    description: "Kasırga Bilgisayar iade ve değişim politikası — ürün iade, değişim koşulları ve süreçleri hakkında bilgi.",
};

export default async function IadeVeDegisimPolitikasiPage() {
    return <YasalSayfa sayfa={await siteIcerigi("iade")} Ikon={RefreshCw} />;
}
