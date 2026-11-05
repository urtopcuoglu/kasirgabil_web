// src/app/admin/(panel)/donanim/page.tsx
// Tüm donanım puanları: tür, arama ve sıralama ile listelenir; yıldızla takip listesine eklenir.
import type { Metadata } from "next";
import { Search } from "lucide-react";
import { DONANIM_SUTUNLARI, DONANIM_TURLERI, DONANIM_TUR_LISTESI, donanimEtiketi, type DonanimPuani, type DonanimTuru } from "@/lib/donanim-puanlari";
import { izinVar } from "@/lib/izinler";
import { panelAramasiOku } from "@/lib/panel-arama";
import { aramaMetni } from "@/lib/schemas/ortak";
import { createClient } from "@/lib/supabase/server";
import { dbHataMesaji, oturum } from "@/lib/supabase/yetkili";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FormHatasi, inputSinifi } from "../../_components/form";
import { FiltreOzeti, FiltreSecimi, linkOlustur, sayfaAraligi, Sayfalama, sayfaOku, secenekOku } from "../../_components/liste";
import OtomatikFiltreFormu from "../../_components/OtomatikFiltreFormu";
import DonanimBasligi from "./DonanimBasligi";
import { puanYaz, sayiYaz, TurRozeti, UbLinki } from "./DonanimParcalari";
import TakipButonu from "./TakipButonu";

export const metadata: Metadata = {
    title: "Donanım Puanları",
};

const SIRALAMALAR = {
    populer: { etiket: "En çok test edilen", sutun: "ornek", artan: false },
    sira: { etiket: "Sıra (en iyiden)", sutun: "sira", artan: true },
    puan: { etiket: "Puan (yüksekten)", sutun: "puan", artan: false },
} as const;
type Siralama = keyof typeof SIRALAMALAR;

const YOL = "/admin/donanim";

export default async function DonanimSayfasi({ searchParams }: { searchParams: Promise<{ tur?: string; sirala?: string; sayfa?: string }> }) {
    const p = await searchParams;
    const q = await panelAramasiOku(YOL); // adreste değil çerezde (src/lib/panel-arama.ts)
    const tur = secenekOku<DonanimTuru | "">(p.tur, ["", ...DONANIM_TUR_LISTESI], "");
    // Tür seçiliyken sıraya göre, değilse en çok test edilene göre dizilir (sıra türler arasında karşılaştırılamaz).
    const sirala = secenekOku<Siralama>(p.sirala, Object.keys(SIRALAMALAR) as Siralama[], tur ? "sira" : "populer");
    const sayfa = sayfaOku(p.sayfa);
    const filtreler = { q: q || undefined, tur: tur || undefined, sirala: p.sirala ? sirala : undefined };
    const aktifFiltre = [q, tur].filter(Boolean).length;

    const supabase = await createClient();
    const o = await oturum();
    const { sutun, artan } = SIRALAMALAR[sirala];

    let sorgu = supabase
        .from("donanim_puanlari")
        .select(DONANIM_SUTUNLARI, { count: "exact" })
        .order(sutun, { ascending: artan, nullsFirst: false })
        .order("id");
    // Kelimeler ayrı ayrı aranır ("i7 8550" → "Core i7-8550U"); Türkçe harf duyarsız.
    for (const kelime of aramaMetni(q).split(/\s+/).filter(Boolean).slice(0, 5)) {
        sorgu = sorgu.like("arama", `%${kelime.replace(/[\\%_]/g, (k) => `\\${k}`)}%`);
    }
    if (tur) sorgu = sorgu.eq("tur", tur);

    const { data, count, error } = await sorgu.range(...sayfaAraligi(sayfa));
    const puanlar = (data ?? []) as DonanimPuani[];
    const toplam = count ?? 0;

    const { data: takip } = puanlar.length
        ? await supabase.from("donanim_takip").select("puan_id").in("puan_id", puanlar.map((x) => x.id))
        : { data: [] };
    const takipte = new Set((takip ?? []).map((t) => t.puan_id as string));
    const takipYetkisi = izinVar(o?.rol, "donanim");

    return (
        <div>
            <DonanimBasligi aktif="/admin/donanim" />

            <OtomatikFiltreFormu
                action={YOL}
                className="mb-3 grid gap-3 rounded-xl border bg-white p-3 shadow-sm sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(2,minmax(0,1fr))]"
            >
                <label className="flex min-w-0 flex-col gap-1 text-xs font-medium text-gray-500 sm:col-span-2 lg:col-span-1">
                    Ara
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                            <input
                                name="q"
                                type="search"
                                defaultValue={q}
                                placeholder="Model, marka veya parça no (örn. i5 8250U, RTX 3060)"
                                className={cn(inputSinifi, "py-1.5 pl-9")}
                            />
                        </div>
                        <Button type="submit" variant="outline" className="h-[34px]">
                            Ara
                        </Button>
                    </div>
                </label>
                <FiltreSecimi
                    etiket="Tür"
                    name="tur"
                    deger={tur}
                    secenekler={[{ deger: "", etiket: "Tümü" }, ...DONANIM_TUR_LISTESI.map((t) => ({ deger: t, etiket: DONANIM_TURLERI[t] }))]}
                />
                <FiltreSecimi
                    etiket="Sıralama"
                    name="sirala"
                    deger={sirala}
                    secenekler={Object.entries(SIRALAMALAR).map(([deger, { etiket }]) => ({ deger, etiket }))}
                />
            </OtomatikFiltreFormu>

            <FiltreOzeti sonucSayisi={toplam} aktifFiltre={aktifFiltre} temizleLinki={YOL} />

            {error && <FormHatasi mesaj={dbHataMesaji(error)} />}

            {!error && puanlar.length === 0 && (
                <div className="rounded-xl border border-dashed bg-white p-10 text-center text-sm text-gray-500">
                    {toplam === 0 && !q && !tur
                        ? "Henüz veri yok. \"Şimdi Güncelle\" ile UserBenchmark verilerini yükleyin."
                        : "Aramaya uygun parça bulunamadı."}
                </div>
            )}

            {puanlar.length > 0 && (
                <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="w-10 px-3 py-3" aria-label="Takip" />
                                <th className="px-3 py-3 font-medium">Parça</th>
                                <th className="px-3 py-3 text-right font-medium">Sıra</th>
                                <th className="px-3 py-3 text-right font-medium">Puan</th>
                                <th className="px-3 py-3 text-right font-medium">Test</th>
                                <th className="px-3 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {puanlar.map((x) => (
                                <tr key={x.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-2">
                                        <TakipButonu puanId={x.id} takipte={takipte.has(x.id)} pasif={!takipYetkisi} />
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <TurRozeti tur={x.tur} />
                                            <span className="font-medium">{donanimEtiketi(x)}</span>
                                        </div>
                                        {(x.parca_nolar.length > 0 || x.varyantlar.length > 0) && (
                                            <p className="mt-0.5 truncate text-xs text-gray-500" title={[...x.parca_nolar, ...x.varyantlar].join(", ")}>
                                                {x.parca_nolar.slice(0, 3).join(", ")}
                                                {x.varyantlar.length > 0 && ` · ${x.varyantlar.length} kart/varyant`}
                                            </p>
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums">{x.sira != null ? `#${sayiYaz(x.sira)}` : "—"}</td>
                                    <td className="whitespace-nowrap px-3 py-2 text-right font-semibold tabular-nums">{puanYaz(x.puan)}</td>
                                    <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-gray-600">{sayiYaz(x.ornek)}</td>
                                    <td className="whitespace-nowrap px-3 py-2 text-right">
                                        <UbLinki url={x.url} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Sayfalama sayfa={sayfa} toplam={toplam} link={(n) => linkOlustur(YOL, { ...filtreler, sayfa: n > 1 ? String(n) : undefined })} />
        </div>
    );
}
