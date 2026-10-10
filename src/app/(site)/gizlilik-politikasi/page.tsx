// src/app/(site)/gizlilik-politikasi/page.tsx
// Metin panelden düzenlenir (site_icerikleri: gizlilik).
import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import YasalSayfa from "@/app/component_page/YasalSayfa";
import { siteIcerigi } from "@/lib/icerik";

export const metadata: Metadata = {
    title: "Gizlilik Politikası | Kasırga Bilgisayar",
    description: "Kasırga Bilgisayar gizlilik politikası — kişisel verilerinizin nasıl toplandığı, kullanıldığı ve korunduğu hakkında bilgi.",
};

export default async function GizlilikPolitikasiPage() {
    return <YasalSayfa sayfa={await siteIcerigi("gizlilik")} Ikon={ShieldCheck} />;
}
