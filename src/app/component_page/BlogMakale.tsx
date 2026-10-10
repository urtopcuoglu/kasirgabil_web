// src/app/component_page/BlogMakale.tsx
// Blog yazısının gövdesi: vitrindeki /blog/[slug] ve paneldeki taslak önizlemesi aynı görünümü kullanır.
import Image from "next/image";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { htmlTemizle } from "@/lib/html";
import type { BlogKategori, BlogYazisi } from "@/lib/schemas/icerik";

type Props = {
    yazi: Pick<BlogYazisi, "baslik" | "ozet" | "kapak_gorsel_url" | "icerik" | "yayin_tarihi">;
    kategori: Pick<BlogKategori, "ad" | "slug"> | null;
};

export const blogTarihi = (iso: string | null) =>
    iso ? new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "long", year: "numeric" }).format(new Date(iso)) : "";

export default function BlogMakale({ yazi, kategori }: Props) {
    return (
        <article className="mx-auto max-w-3xl">
            <header className="mb-8 space-y-4 text-center">
                <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-gray-500">
                    {kategori && (
                        <Link
                            href={`/blog?kategori=${kategori.slug}`}
                            className="rounded-full bg-[var(--color-primary)]/10 px-3 py-1 font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20"
                        >
                            {kategori.ad}
                        </Link>
                    )}
                    {yazi.yayin_tarihi && (
                        <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="size-4" />
                            <time dateTime={yazi.yayin_tarihi}>{blogTarihi(yazi.yayin_tarihi)}</time>
                        </span>
                    )}
                </div>
                <h1 className="text-3xl font-bold text-[var(--color-secondary)] sm:text-4xl dark:text-white">{yazi.baslik}</h1>
                {yazi.ozet && <p className="text-lg text-gray-600 dark:text-gray-300">{yazi.ozet}</p>}
            </header>

            {yazi.kapak_gorsel_url && (
                <div className="relative mb-10 aspect-video overflow-hidden rounded-xl shadow-lg">
                    <Image src={yazi.kapak_gorsel_url} alt={yazi.baslik} fill priority sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
                </div>
            )}

            <div
                className="prose prose-lg max-w-none prose-headings:text-[var(--color-secondary)] prose-a:text-[var(--color-primary)] prose-img:rounded-lg dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: htmlTemizle(yazi.icerik) }}
            />
        </article>
    );
}
