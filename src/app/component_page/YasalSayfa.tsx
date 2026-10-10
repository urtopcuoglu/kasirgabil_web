// src/app/component_page/YasalSayfa.tsx
// KVKK, gizlilik, iade ve mesafeli satış sayfalarının ortak görünümü. Metinler panelden düzenlenir.
import type { LucideIcon } from "lucide-react";
import { htmlTemizle } from "@/lib/html";
import type { YasalSayfa as YasalSayfaIcerigi } from "@/lib/schemas/icerik";

export default function YasalSayfa({ sayfa, Ikon }: { sayfa: YasalSayfaIcerigi | null; Ikon: LucideIcon }) {
    return (
        <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-zinc-800">
            {/* Banner */}
            <div className="bg-gradient-to-r from-[#2C2262] to-[#362C68] px-4 py-16 text-white">
                <div className="container mx-auto flex items-center justify-center gap-4">
                    <Ikon size={48} className="shrink-0 text-white drop-shadow-md" />
                    <h1 className="text-center text-4xl font-bold drop-shadow-md">{sayfa?.baslik}</h1>
                </div>
            </div>

            {/* İçerik */}
            <main className="container mx-auto max-w-4xl px-4 py-16">
                <div
                    className="prose max-w-none rounded-lg bg-white p-8 shadow-lg prose-headings:text-[var(--color-secondary)] prose-a:text-[var(--color-primary)] prose-blockquote:rounded prose-blockquote:border-blue-400 prose-blockquote:bg-blue-50 prose-blockquote:py-1 prose-blockquote:not-italic prose-blockquote:text-blue-800 dark:bg-zinc-900 dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: htmlTemizle(sayfa?.icerik ?? "") }}
                />
            </main>
        </div>
    );
}
