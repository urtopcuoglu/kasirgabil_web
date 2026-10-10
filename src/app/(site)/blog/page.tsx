// src/app/(site)/blog/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { blogKategorileri, blogYazilari } from "@/lib/icerik";
import { blogTarihi } from "@/app/component_page/BlogMakale";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
    title: "Blog | Kasırga Bilgisayar",
    description: "Bilgisayar tamiri, donanım, yedek parça ve teknoloji üzerine Kasırga Bilgisayar'dan rehberler ve haberler.",
};

const ADET = 12;

type Props = { searchParams: Promise<{ kategori?: string; sayfa?: string }> };

export default async function BlogSayfasi({ searchParams }: Props) {
    const p = await searchParams;
    const kategoriSlug = p.kategori && /^[a-z0-9-]+$/.test(p.kategori) ? p.kategori : undefined;
    const sayfa = Math.max(1, Number.parseInt(p.sayfa ?? "1", 10) || 1);

    const [{ yazilar, toplam }, kategoriler] = await Promise.all([
        blogYazilari({ kategoriSlug, sayfa, adet: ADET }),
        blogKategorileri(),
    ]);
    const sayfaSayisi = Math.max(1, Math.ceil(toplam / ADET));
    const link = (s: number) => {
        const q = new URLSearchParams();
        if (kategoriSlug) q.set("kategori", kategoriSlug);
        if (s > 1) q.set("sayfa", String(s));
        const metin = q.toString();
        return metin ? `/blog?${metin}` : "/blog";
    };

    return (
        <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-zinc-800">
            <div className="bg-gradient-to-r from-[#2C2262] to-[#362C68] px-4 py-16 text-white">
                <div className="container mx-auto flex items-center justify-center gap-4">
                    <BookOpen size={48} className="drop-shadow-md" />
                    <h1 className="text-4xl font-bold drop-shadow-md">Blog</h1>
                </div>
            </div>

            <div className="container mx-auto max-w-6xl px-4 py-12">
                {kategoriler.length > 0 && (
                    <nav aria-label="Blog kategorileri" className="mb-8 flex flex-wrap justify-center gap-2">
                        <KategoriLinki href="/blog" aktif={!kategoriSlug}>
                            Tümü
                        </KategoriLinki>
                        {kategoriler.map((k) => (
                            <KategoriLinki key={k.id} href={`/blog?kategori=${k.slug}`} aktif={kategoriSlug === k.slug}>
                                {k.ad}
                            </KategoriLinki>
                        ))}
                    </nav>
                )}

                {yazilar.length === 0 ? (
                    <p className="rounded-xl bg-white p-10 text-center text-gray-500 shadow-sm">Henüz yazı yok. Yakında burada olacağız.</p>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {yazilar.map((y) => (
                            <Link
                                key={y.id}
                                href={`/blog/${y.slug}`}
                                className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl dark:bg-zinc-900"
                            >
                                <div className="relative aspect-video bg-gray-100">
                                    {y.kapak_gorsel_url ? (
                                        <Image
                                            src={y.kapak_gorsel_url}
                                            alt={y.baslik}
                                            fill
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            className="object-cover transition duration-300 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex size-full items-center justify-center bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-tertiary)]">
                                            <BookOpen className="size-10 text-white/60" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-1 flex-col gap-2 p-5">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        {y.blog_kategorileri && (
                                            <span className="font-medium text-[var(--color-primary)]">{y.blog_kategorileri.ad}</span>
                                        )}
                                        {y.yayin_tarihi && <time dateTime={y.yayin_tarihi}>{blogTarihi(y.yayin_tarihi)}</time>}
                                    </div>
                                    <h2 className="text-lg font-bold text-[var(--color-secondary)] group-hover:text-[var(--color-primary)] dark:text-white">
                                        {y.baslik}
                                    </h2>
                                    {y.ozet && <p className="line-clamp-3 text-sm text-gray-600 dark:text-gray-300">{y.ozet}</p>}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {sayfaSayisi > 1 && (
                    <nav aria-label="Sayfalar" className="mt-10 flex items-center justify-center gap-3 text-sm">
                        {sayfa > 1 ? (
                            <Link href={link(sayfa - 1)} className="inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 shadow hover:text-[var(--color-primary)]">
                                <ChevronLeft className="size-4" /> Önceki
                            </Link>
                        ) : (
                            <span />
                        )}
                        <span className="text-gray-500">
                            {sayfa} / {sayfaSayisi}
                        </span>
                        {sayfa < sayfaSayisi && (
                            <Link href={link(sayfa + 1)} className="inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 shadow hover:text-[var(--color-primary)]">
                                Sonraki <ChevronRight className="size-4" />
                            </Link>
                        )}
                    </nav>
                )}
            </div>
        </div>
    );
}

function KategoriLinki({ href, aktif, children }: { href: string; aktif: boolean; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            aria-current={aktif ? "page" : undefined}
            className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition",
                aktif ? "bg-[var(--color-primary)] text-white" : "bg-white text-gray-700 shadow-sm hover:text-[var(--color-primary)]"
            )}
        >
            {children}
        </Link>
    );
}
