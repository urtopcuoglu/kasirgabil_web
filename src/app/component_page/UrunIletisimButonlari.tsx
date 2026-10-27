// src/app/component_page/UrunIletisimButonlari.tsx
// Ürün kartı ve detay sayfasındaki iletişim butonları. Sitede fiyat gösterilmez; ziyaretçi WhatsApp'tan
// ya da canlı destekten ürün adı hazır yazılmış mesajla ulaşır.
"use client";

import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { canliSohbetiAc } from "./CanliSohbet";

type Props = {
    urunAdi: string;
    stokKodu: string;
    whatsapp?: string | null; // ülke koduyla rakamlar (site içeriklerinden); yoksa buton gösterilmez
    buyuk?: boolean;
};

function WhatsAppIkonu({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
            <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.48.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.57.94.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.24-9.44 9.45-9.44a9.4 9.4 0 0 1 9.44 9.45c0 5.21-4.24 9.44-9.46 9.44m8.04-17.48A11.3 11.3 0 0 0 12.05.7C5.78.7.68 5.8.68 12.07c0 2 .52 3.96 1.52 5.68L.58 23.7l6.08-1.6a11.3 11.3 0 0 0 5.39 1.38h.01c6.27 0 11.37-5.1 11.37-11.38 0-3.04-1.18-5.9-3.34-8.05" />
        </svg>
    );
}

export default function UrunIletisimButonlari({ urunAdi, stokKodu, whatsapp, buyuk = false }: Props) {
    const mesaj = `Merhaba, "${urunAdi}" (ürün kodu: ${stokKodu}) hakkında bilgi almak istiyorum.`;
    const buton = cn(
        "flex flex-1 items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 active:scale-95",
        buyuk ? "px-6 py-3 text-base" : "px-3 py-2 text-sm"
    );

    return (
        <div className={cn("flex gap-2", buyuk ? "flex-col sm:flex-row" : "flex-col min-[380px]:flex-row")}>
            {whatsapp && (
                <a
                    href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(mesaj)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(buton, "bg-[#25D366] text-white hover:bg-[#1ebe5a] hover:shadow-lg")}
                >
                    <WhatsAppIkonu className={buyuk ? "size-5" : "size-4"} />
                    WhatsApp
                </a>
            )}
            <button
                type="button"
                onClick={() => canliSohbetiAc(mesaj)}
                className={cn(buton, "bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)] hover:shadow-lg")}
            >
                <MessageCircle className={buyuk ? "size-5" : "size-4"} />
                Canlı Destek
            </button>
        </div>
    );
}
