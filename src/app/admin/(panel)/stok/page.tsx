// src/app/admin/(panel)/stok/page.tsx
import type { Metadata } from "next";
import { izinVar } from "@/lib/izinler";
import { dbHataMesaji, oturum } from "@/lib/supabase/yetkili";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Eye, Plus, ScanBarcode } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { kategoriAgaci, URUN_DURUMLARI, type Kutu, type Urun, type UrunKategori } from "@/lib/schemas/stok";
import { paraYaz } from "@/lib/tarih";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { anaButonSinifi, FormHatasi, inputSinifi, SayfaBasligi } from "../../_components/form";
import { aramaDeseni, FiltreOzeti, FiltreSecimi, linkOlustur, sayfaAraligi, Sayfalama, sayfaOku, secenekOku, uuidMi } from "../../_components/liste";
import OtomatikFiltreFormu from "../../_components/OtomatikFiltreFormu";
import StokSekmeleri from "./StokSekmeleri";
import { DurumRozeti, StokAdedi } from "./UrunRozetleri";

export const metadata: Metadata = {
    title: "Stok",
};

type Props = {
    searchParams: Promise<{ q?: string; sayfa?: string; kategori?: string; durum?: string; stok?: string; sirala?: string }>;
};

type UrunSatiri = Urun & { kutular: Pick<Kutu, "kutu_no" | "marka" | "model"> | null };

const DURUM_FILTRELERI = ["", "sifir", "ikinci_el"] as const;
const STOK_FILTRELERI = ["", "var", "yok", "kritik"] as const;
const SIRALAMALAR = {
    yeni: { etiket: "En yeni eklenen", sutun: "created_at", artan: false },
    kod: { etiket: "Stok kodu", sutun: "stok_kodu", artan: true },
    ad: { etiket: "Ürün adı (A → Z)", sutun: "ad", artan: true },
    adet_az: { etiket: "Stok adedi (azdan çoğa)", sutun: "stok_adedi", artan: true },
} as const;
type Siralama = keyof typeof SIRALAMALAR;

export default async function StokSayfasi({ searchParams }: Props) {
    const p = await searchParams;
    const sayfa = sayfaOku(p.sayfa);
    const q = (p.q ?? "").trim();
    const kategori = uuidMi(p.kategori) ? p.kategori : undefined;
    const durum = secenekOku(p.durum, DURUM_FILTRELERI, "");
    const stok = secenekOku(p.stok, STOK_FILTRELERI, "");
    const sirala = secenekOku(p.sirala, Object.keys(SIRALAMALAR) as Siralama[], "yeni");

    const filtreler = {
        q: q || undefined,
        kategori,
        durum: durum || undefined,
        stok: stok || undefined,
        sirala: sirala === "yeni" ? undefined : sirala,
    };
    const aktifFiltre = Object.values(filtreler).filter(Boolean).length;

    const supabase = await createClient();
    const o = await oturum();

    // Barkod okuyucu / elle tam kod: stok kodu, barkod veya seri no tek ürüne denk geliyorsa doğrudan ürüne gidilir.
    // Yalnızca harf/rakam/nokta/tire içeren aramalarda denenir (PostgREST filtre sözdizimi bozulmasın).
    if (/^[\p{L}\d.-]+$/u.test(q)) {
        const { data: tam } = await supabase
            .from("urunler")
            .select("id")
            .or(`stok_kodu.eq.${q},barkod.eq.${q},seri_no.ilike.${q}`)
            .limit(2);
        if (tam?.length === 1) redirect(`/admin/stok/${tam[0].id}`);
    }

    const { data: kategoriData } = await supabase.from("urun_kategorileri").select("id, ad, ust_id, kutu_sistemi");
    const kategoriler = (kategoriData ?? []) as UrunKategori[];
    const agac = kategoriAgaci(kategoriler);

    const { sutun, artan } = SIRALAMALAR[sirala];
    let sorgu = supabase
        .from("urunler")
        .select("*, kutular(kutu_no, marka, model)", { count: "exact" })
        .order(sutun, { ascending: artan })
        .range(...sayfaAraligi(sayfa));

    if (q) sorgu = sorgu.ilike("arama", aramaDeseni(q));
    if (kategori) sorgu = sorgu.in("kategori_id", agac.altlariyla(kategori));
    if (durum) sorgu = sorgu.eq("durum", durum);
    if (stok === "var") sorgu = sorgu.gt("stok_adedi", 0);
    if (stok === "yok") sorgu = sorgu.eq("stok_adedi", 0);
    if (stok === "kritik") sorgu = sorgu.eq("kritik", true);

    const { data, error, count } = await sorgu;
    const toplam = count ?? 0;
    const urunler = (data ?? []) as UrunSatiri[];

    return (
        <div>
            <SayfaBasligi baslik="Stok" aciklama="Ürünler, notebook yedek parça kutuları ve stok hareketleri.">
{izinVar(o?.rol, "stok_yonet") && (
                <Button asChild className={anaButonSinifi}>
                    <Link href="/admin/stok/yeni">
                        <Plus /> Yeni Ürün
                    </Link>
                </Button>
)}
            </SayfaBasligi>

            <StokSekmeleri aktif="/admin/stok" />

            <OtomatikFiltreFormu
                action="/admin/stok"
                className="mb-3 grid gap-3 rounded-xl border bg-white p-3 shadow-sm sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))]"
            >
                <label className="flex min-w-0 flex-col gap-1 text-xs font-medium text-gray-500 sm:col-span-2 lg:col-span-1">
                    Ara / Barkod okut
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <ScanBarcode className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                            <input
                                name="q"
                                type="search"
                                defaultValue={q}
                                autoFocus
                                placeholder="Stok kodu, ürün, marka/model, seri no, barkod..."
                                className={cn(inputSinifi, "py-1.5 pl-9")}
                            />
                        </div>
                        <Button type="submit" variant="outline" className="h-[34px]">
                            Ara
                        </Button>
                    </div>
                </label>
                <FiltreSecimi
                    etiket="Kategori"
                    name="kategori"
                    deger={kategori ?? ""}
                    secenekler={[{ deger: "", etiket: "Tümü" }, ...agac.sirali.map((k) => ({ deger: k.id, etiket: k.yol }))]}
                />
                <FiltreSecimi
                    etiket="Durum"
                    name="durum"
                    deger={durum}
                    secenekler={[
                        { deger: "", etiket: "Tümü" },
                        ...Object.entries(URUN_DURUMLARI).map(([deger, { etiket }]) => ({ deger, etiket })),
                    ]}
                />
                <FiltreSecimi
                    etiket="Stok"
                    name="stok"
                    deger={stok}
                    secenekler={[
                        { deger: "", etiket: "Tümü" },
                        { deger: "var", etiket: "Stokta olanlar" },
                        { deger: "yok", etiket: "Stokta olmayanlar" },
                        { deger: "kritik", etiket: "Kritik stok" },
                    ]}
                />
                <FiltreSecimi
                    etiket="Sıralama"
                    name="sirala"
                    deger={sirala}
                    secenekler={Object.entries(SIRALAMALAR).map(([deger, { etiket }]) => ({ deger, etiket }))}
                />
            </OtomatikFiltreFormu>

            <FiltreOzeti sonucSayisi={toplam} aktifFiltre={aktifFiltre} temizleLinki={linkOlustur("/admin/stok", {})} />

            {error && <FormHatasi mesaj={dbHataMesaji(error)} />}

            {!error && urunler.length === 0 && (
                <div className="rounded-xl border border-dashed bg-white p-10 text-center text-sm text-gray-500">
                    {aktifFiltre > 0 ? "Filtrelere uygun ürün bulunamadı." : "Henüz ürün eklenmemiş."}
                </div>
            )}

            {urunler.length > 0 && (
                <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-4 py-3 font-medium">Stok Kodu</th>
                                <th className="px-4 py-3 font-medium">Ürün</th>
                                <th className="px-4 py-3 font-medium">Kategori</th>
                                <th className="px-4 py-3 font-medium">Durum</th>
                                <th className="px-4 py-3 text-right font-medium">Stok</th>
                                <th className="px-4 py-3 text-right font-medium">Satış Fiyatı</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {urunler.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50">
                                    <td className="whitespace-nowrap px-4 py-3 font-mono font-semibold text-[var(--color-secondary)]">
                                        {u.stok_kodu}
                                    </td>
                                    <td className="max-w-[280px] px-4 py-3">
                                        <p className="truncate font-medium" title={u.ad}>
                                            {u.ad}
                                        </p>
                                        <p className="truncate text-xs text-gray-500">
                                            {[u.marka, u.model].filter(Boolean).join(" ") || "—"}
                                            {u.kutular && ` · Kutu ${u.kutular.kutu_no}`}
                                        </p>
                                    </td>
                                    <td className="max-w-[220px] truncate px-4 py-3 text-gray-600" title={agac.yol(u.kategori_id)}>
                                        {agac.yol(u.kategori_id)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <DurumRozeti durum={u.durum} />
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-right">
                                        <StokAdedi adet={u.stok_adedi} />
                                        {u.kritik && <p className="text-[10px] font-semibold uppercase text-[var(--color-primary)]">Kritik</p>}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                                        {u.satis_fiyati != null ? paraYaz(Number(u.satis_fiyati)) : <span className="text-gray-400">—</span>}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Button variant="ghost" size="icon" asChild title="Görüntüle">
                                            <Link href={`/admin/stok/${u.id}`} aria-label="Görüntüle">
                                                <Eye />
                                            </Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Sayfalama
                sayfa={sayfa}
                toplam={toplam}
                link={(n) => linkOlustur("/admin/stok", { ...filtreler, sayfa: n > 1 ? String(n) : undefined })}
            />
        </div>
    );
}
