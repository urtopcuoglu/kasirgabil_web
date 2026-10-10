// src/app/admin/(panel)/icerik/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Pencil, Plus, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { dbHataMesaji } from "@/lib/supabase/yetkili";
import { BLOG_DURUMLARI, type BlogKategori, type BlogYazisi } from "@/lib/schemas/icerik";
import { tarihSaatYaz } from "@/lib/tarih";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { anaButonSinifi, FormHatasi, inputSinifi, SayfaBasligi } from "../../_components/form";
import { FiltreOzeti, FiltreSecimi, linkOlustur, secenekOku } from "../../_components/liste";
import OtomatikFiltreFormu from "../../_components/OtomatikFiltreFormu";
import BlogDurumRozeti from "./BlogDurumRozeti";
import IcerikSekmeleri from "./IcerikSekmeleri";

export const metadata: Metadata = {
    title: "İçerik / Blog",
};

type YaziSatiri = Pick<BlogYazisi, "id" | "baslik" | "slug" | "durum" | "yayin_tarihi" | "updated_at"> & {
    blog_kategorileri: Pick<BlogKategori, "ad"> | null;
};

const DURUM_FILTRELERI = ["", "taslak", "yayinda"] as const;

export default async function BlogYazilariSayfasi({ searchParams }: { searchParams: Promise<{ q?: string; durum?: string }> }) {
    const p = await searchParams;
    const q = (p.q ?? "").trim();
    const durum = secenekOku(p.durum, DURUM_FILTRELERI, "");

    const supabase = await createClient();
    let sorgu = supabase
        .from("blog_yazilari")
        .select("id, baslik, slug, durum, yayin_tarihi, updated_at, blog_kategorileri(ad)")
        .order("updated_at", { ascending: false })
        .limit(300);
    if (q) sorgu = sorgu.ilike("baslik", `%${q.replace(/[\\%_]/g, (k) => `\\${k}`)}%`);
    if (durum) sorgu = sorgu.eq("durum", durum);

    const { data, error } = await sorgu;
    const yazilar = (data ?? []) as unknown as YaziSatiri[];
    const aktifFiltre = [q, durum].filter(Boolean).length;

    return (
        <div>
            <SayfaBasligi baslik="İçerik / Blog" aciklama="Blog yazıları, kategoriler ve sitedeki düzenlenebilir metinler.">
                <Button asChild className={anaButonSinifi}>
                    <Link href="/admin/icerik/blog/yeni">
                        <Plus /> Yeni Yazı
                    </Link>
                </Button>
            </SayfaBasligi>

            <IcerikSekmeleri aktif="/admin/icerik" />

            <OtomatikFiltreFormu
                action="/admin/icerik"
                className="mb-3 grid gap-3 rounded-xl border bg-white p-3 shadow-sm sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
            >
                <label className="flex min-w-0 flex-col gap-1 text-xs font-medium text-gray-500">
                    Ara
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                            <input name="q" type="search" defaultValue={q} placeholder="Başlık..." className={cn(inputSinifi, "py-1.5 pl-9")} />
                        </div>
                        <Button type="submit" variant="outline" className="h-[34px]">
                            Ara
                        </Button>
                    </div>
                </label>
                <FiltreSecimi
                    etiket="Durum"
                    name="durum"
                    deger={durum}
                    secenekler={[
                        { deger: "", etiket: "Tümü" },
                        ...Object.entries(BLOG_DURUMLARI).map(([deger, { etiket }]) => ({ deger, etiket })),
                    ]}
                />
            </OtomatikFiltreFormu>

            <FiltreOzeti sonucSayisi={yazilar.length} aktifFiltre={aktifFiltre} temizleLinki={linkOlustur("/admin/icerik", {})} />

            {error && <FormHatasi mesaj={dbHataMesaji(error)} />}

            {!error && yazilar.length === 0 && (
                <div className="rounded-xl border border-dashed bg-white p-10 text-center text-sm text-gray-500">
                    {aktifFiltre > 0 ? "Filtrelere uygun yazı yok." : "Henüz blog yazısı yok."}
                </div>
            )}

            {yazilar.length > 0 && (
                <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-4 py-3 font-medium">Başlık</th>
                                <th className="px-4 py-3 font-medium">Kategori</th>
                                <th className="px-4 py-3 font-medium">Durum</th>
                                <th className="px-4 py-3 font-medium">Yayın</th>
                                <th className="px-4 py-3 font-medium">Son Düzenleme</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {yazilar.map((y) => (
                                <tr key={y.id} className="hover:bg-gray-50">
                                    <td className="max-w-[340px] px-4 py-3">
                                        <Link href={`/admin/icerik/blog/${y.id}`} className="block truncate font-medium hover:underline">
                                            {y.baslik}
                                        </Link>
                                        <p className="truncate font-mono text-xs text-gray-400">/blog/{y.slug}</p>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{y.blog_kategorileri?.ad ?? <span className="text-gray-400">—</span>}</td>
                                    <td className="px-4 py-3">
                                        <BlogDurumRozeti durum={y.durum} yayinTarihi={y.yayin_tarihi} />
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                                        {y.yayin_tarihi ? tarihSaatYaz(y.yayin_tarihi) : <span className="text-gray-400">—</span>}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">{tarihSaatYaz(y.updated_at)}</td>
                                    <td className="whitespace-nowrap px-4 py-3 text-right">
                                        {y.durum === "yayinda" && (
                                            <Button variant="ghost" size="icon" asChild title="Sitede gör">
                                                <a href={`/blog/${y.slug}`} target="_blank" rel="noopener noreferrer" aria-label="Sitede gör">
                                                    <ExternalLink />
                                                </a>
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="icon" asChild title="Düzenle">
                                            <Link href={`/admin/icerik/blog/${y.id}`} aria-label="Düzenle">
                                                <Pencil />
                                            </Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
