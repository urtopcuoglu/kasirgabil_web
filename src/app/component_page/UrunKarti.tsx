// src/app/component_page/UrunKarti.tsx
// Vitrindeki ürün kartı: görsel ve başlık detay sayfasına gider; altında iletişim butonları (fiyat gösterilmez).
import Image from "next/image";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import { URUN_DURUMLARI } from "@/lib/schemas/stok";
import type { SiteUrunu } from "@/lib/site-urunleri";
import { cn } from "@/lib/utils";
import UrunIletisimButonlari from "./UrunIletisimButonlari";

type Props = { urun: SiteUrunu; kategori?: string; whatsapp?: string | null };

export function StokRozeti({ stokta, className }: { stokta: boolean; className?: string }) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                stokta ? "bg-green-50 text-green-700" : "bg-red-50 text-[var(--color-primary)]",
                className
            )}
        >
            <span className={cn("size-1.5 rounded-full", stokta ? "bg-green-500" : "bg-[var(--color-primary)]")} />
            {stokta ? "Stokta" : "Tükendi"}
        </span>
    );
}

export default function UrunKarti({ urun, kategori, whatsapp }: Props) {
    const href = `/urun/${urun.site_slug}`;
    const kapak = urun.site_gorseller[0];
    const durum = URUN_DURUMLARI[urun.durum];

    return (
        <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-primary)] hover:shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
            <Link href={href} className="relative block aspect-square overflow-hidden bg-gray-50 dark:bg-zinc-800" tabIndex={-1} aria-hidden>
                {kapak ? (
                    <Image
                        src={kapak}
                        alt=""
                        fill
                        sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 480px) 50vw, 100vw"
                        className={cn("object-contain p-3 transition-transform duration-500 group-hover:scale-105", !urun.site_stokta && "opacity-60")}
                    />
                ) : (
                    <span className="flex size-full items-center justify-center text-gray-300">
                        <ImageOff size={40} />
                    </span>
                )}
                <span className={cn("absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold", durum.renk)}>{durum.etiket}</span>
            </Link>

            <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2 text-xs">
                        <p className="truncate font-medium uppercase tracking-wide text-gray-500">{kategori}</p>
                        <span className="shrink-0 rounded-md bg-gray-100 px-2 py-0.5 font-mono text-gray-600 dark:bg-zinc-800 dark:text-zinc-300" title="Stok kodu">
                            {urun.stok_kodu}
                        </span>
                    </div>
                    <h3 className="line-clamp-2 font-semibold text-gray-900 transition-colors group-hover:text-[var(--color-primary)] dark:text-zinc-100">
                        <Link href={href}>{urun.site_ad}</Link>
                    </h3>
                    {(urun.marka || urun.model) && (
                        <p className="truncate text-sm text-gray-500">{[urun.marka, urun.model].filter(Boolean).join(" · ")}</p>
                    )}
                </div>
                <StokRozeti stokta={urun.site_stokta} className="self-start" />
                <UrunIletisimButonlari urunAdi={urun.site_ad} stokKodu={urun.stok_kodu} whatsapp={whatsapp} />
            </div>
        </article>
    );
}
