// src/app/admin/(panel)/icerik/BlogDurumRozeti.tsx
import { BLOG_DURUMLARI, type BlogDurumu } from "@/lib/schemas/icerik";
import { cn } from "@/lib/utils";

// Yayında ama yayın tarihi gelmemiş yazı "Zamanlandı" olarak gösterilir.
export default function BlogDurumRozeti({ durum, yayinTarihi }: { durum: BlogDurumu; yayinTarihi: string | null }) {
    const zamanlandi = durum === "yayinda" && !!yayinTarihi && new Date(yayinTarihi) > new Date();
    const { etiket, renk } = zamanlandi ? { etiket: "Zamanlandı", renk: "bg-blue-50 text-blue-700" } : BLOG_DURUMLARI[durum];
    return <span className={cn("whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium", renk)}>{etiket}</span>;
}
