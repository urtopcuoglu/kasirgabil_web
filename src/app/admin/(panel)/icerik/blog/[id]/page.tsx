// src/app/admin/(panel)/icerik/blog/[id]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Eye } from "lucide-react";
import { blogYazisiSil } from "@/actions/icerik";
import { createClient } from "@/lib/supabase/server";
import type { BlogKategori, BlogYazisi } from "@/lib/schemas/icerik";
import { Button } from "@/components/ui/button";
import { SayfaBasligi } from "../../../../_components/form";
import SilButonu from "../../../../_components/SilButonu";
import BlogDurumRozeti from "../../BlogDurumRozeti";
import BlogFormu from "../BlogFormu";

export const metadata: Metadata = {
    title: "Blog Yazısını Düzenle",
};

export default async function BlogYazisiDuzenleSayfasi({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const [{ data }, { data: kategoriler }] = await Promise.all([
        supabase.from("blog_yazilari").select("*").eq("id", id).maybeSingle(),
        supabase.from("blog_kategorileri").select("id, ad, slug").order("ad"),
    ]);
    if (!data) notFound();
    const yazi = data as BlogYazisi;
    const sitede = yazi.durum === "yayinda" && !!yazi.yayin_tarihi && new Date(yazi.yayin_tarihi) <= new Date();

    return (
        <div>
            <SayfaBasligi baslik="Blog Yazısını Düzenle" aciklama={yazi.baslik}>
                <BlogDurumRozeti durum={yazi.durum} yayinTarihi={yazi.yayin_tarihi} />
                <Button variant="outline" asChild>
                    <Link href={`/admin/icerik/blog/${yazi.id}/onizleme`} target="_blank">
                        <Eye /> Önizle
                    </Link>
                </Button>
                {sitede && (
                    <Button variant="outline" asChild>
                        <a href={`/blog/${yazi.slug}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink /> Sitede gör
                        </a>
                    </Button>
                )}
                <SilButonu onay={`"${yazi.baslik}" yazısı silinsin mi? Bu işlem geri alınamaz.`} sil={blogYazisiSil.bind(null, yazi.id)} etiket="Sil" />
            </SayfaBasligi>
            <BlogFormu yazi={yazi} kategoriler={(kategoriler ?? []) as BlogKategori[]} />
        </div>
    );
}
