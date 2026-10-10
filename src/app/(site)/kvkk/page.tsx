// src/app/(site)/kvkk/page.tsx
// Metin panelden düzenlenir (site_icerikleri: kvkk).
import type { Metadata } from "next";
import { ShieldHalf } from "lucide-react";
import YasalSayfa from "@/app/component_page/YasalSayfa";
import { siteIcerigi } from "@/lib/icerik";

export const metadata: Metadata = {
    title: "KVKK Aydınlatma Metni | Kasırga Bilgisayar",
    description: "Kasırga Bilgisayar KVKK (Kişisel Verilerin Korunması Kanunu) kapsamında hazırlanan aydınlatma metni.",
};

export default async function KvkkPage() {
    return <YasalSayfa sayfa={await siteIcerigi("kvkk")} Ikon={ShieldHalf} />;
}
