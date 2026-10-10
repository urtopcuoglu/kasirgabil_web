// src/app/admin/(panel)/icerik/blog/yeni/page.tsx
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { BlogKategori } from "@/lib/schemas/icerik";
import { SayfaBasligi } from "../../../../_components/form";
import BlogFormu from "../BlogFormu";

export const metadata: Metadata = {
    title: "Yeni Blog Yazısı",
};

export default async function YeniBlogYazisiSayfasi() {
    const supabase = await createClient();
    const { data } = await supabase.from("blog_kategorileri").select("id, ad, slug").order("ad");

    return (
        <div>
            <SayfaBasligi baslik="Yeni Blog Yazısı" aciklama="Taslak olarak kaydedip önizleyebilir, hazır olunca yayına alabilirsiniz." />
            <BlogFormu kategoriler={(data ?? []) as BlogKategori[]} />
        </div>
    );
}
