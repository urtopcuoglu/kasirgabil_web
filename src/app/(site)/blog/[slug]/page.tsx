// src/app/(site)/blog/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import BlogMakale from "@/app/component_page/BlogMakale";
import { blogYazisi } from "@/lib/icerik";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const yazi = await blogYazisi((await params).slug);
    if (!yazi) return { title: "Yazı bulunamadı | Kasırga Bilgisayar" };

    const baslik = yazi.seo_baslik || yazi.baslik;
    const aciklama = yazi.seo_aciklama || yazi.ozet || undefined;
    return {
        title: `${baslik} | Kasırga Bilgisayar`,
        description: aciklama,
        alternates: { canonical: `/blog/${yazi.slug}` },
        openGraph: {
            type: "article",
            title: baslik,
            description: aciklama,
            publishedTime: yazi.yayin_tarihi ?? undefined,
            images: yazi.kapak_gorsel_url ? [yazi.kapak_gorsel_url] : undefined,
        },
    };
}

export default async function BlogYazisiSayfasi({ params }: Props) {
    const yazi = await blogYazisi((await params).slug);
    if (!yazi) notFound();

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-12 dark:bg-zinc-800">
            <div className="mx-auto mb-6 max-w-3xl">
                <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[var(--color-primary)]">
                    <ArrowLeft className="size-4" /> Tüm yazılar
                </Link>
            </div>
            <div className="mx-auto max-w-4xl rounded-2xl bg-white px-4 py-10 shadow-sm sm:px-10 dark:bg-zinc-900">
                <BlogMakale yazi={yazi} kategori={yazi.blog_kategorileri} />
            </div>
        </div>
    );
}
