// src/app/admin/(panel)/icerik/kategoriler/page.tsx
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { dbHataMesaji } from "@/lib/supabase/yetkili";
import type { BlogKategori } from "@/lib/schemas/icerik";
import { FormHatasi, SayfaBasligi } from "../../../_components/form";
import IcerikSekmeleri from "../IcerikSekmeleri";
import BlogKategoriSatiri, { YeniBlogKategoriFormu } from "./BlogKategoriSatiri";

export const metadata: Metadata = {
    title: "Blog Kategorileri",
};

type KategoriSatiri = BlogKategori & { blog_yazilari: { count: number }[] };

export default async function BlogKategorileriSayfasi() {
    const supabase = await createClient();
    const { data, error } = await supabase.from("blog_kategorileri").select("id, ad, slug, blog_yazilari(count)").order("ad");
    const kategoriler = (data ?? []) as KategoriSatiri[];

    return (
        <div className="max-w-3xl">
            <SayfaBasligi baslik="İçerik / Blog" aciklama="Blog kategorileri. Kategori adresi addan otomatik oluşur." />
            <IcerikSekmeleri aktif="/admin/icerik/kategoriler" />
            {error && <FormHatasi mesaj={dbHataMesaji(error)} />}
            <div className="divide-y rounded-xl border bg-white shadow-sm">
                {kategoriler.map((k) => (
                    <BlogKategoriSatiri key={k.id} kategori={k} yaziSayisi={k.blog_yazilari[0]?.count ?? 0} />
                ))}
                <YeniBlogKategoriFormu />
            </div>
        </div>
    );
}
