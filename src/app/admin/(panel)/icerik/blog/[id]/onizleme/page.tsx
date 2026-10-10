// src/app/admin/(panel)/icerik/blog/[id]/onizleme/page.tsx
// Taslak dahil kaydedilmiş son hali vitrindeki görünümüyle gösterir (vitrin taslakları okuyamaz).
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { BlogKategori, BlogYazisi } from "@/lib/schemas/icerik";
import BlogMakale from "@/app/component_page/BlogMakale";

export const metadata: Metadata = {
    title: "Yazı Önizleme",
};

export default async function BlogOnizlemeSayfasi({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data } = await supabase.from("blog_yazilari").select("*, blog_kategorileri(ad, slug)").eq("id", id).maybeSingle();
    if (!data) notFound();
    const yazi = data as BlogYazisi & { blog_kategorileri: Pick<BlogKategori, "ad" | "slug"> | null };

    return (
        <div>
            <p className="mb-6 rounded-md bg-amber-50 px-4 py-2 text-sm text-amber-800">
                Önizleme: kaydedilmiş son hali gösteriliyor{yazi.durum === "taslak" ? " (taslak, sitede görünmüyor)" : ""}.
            </p>
            <div className="rounded-xl bg-white px-4 py-10 shadow-sm">
                <BlogMakale yazi={yazi} kategori={yazi.blog_kategorileri} />
            </div>
        </div>
    );
}
