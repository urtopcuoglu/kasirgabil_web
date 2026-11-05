// src/app/admin/(panel)/stok/markalar/page.tsx
// Marka & Model paneli: ürün formundaki marka/model listelerinin yönetimi.
// Solda markalar, sağda seçili markanın modelleri; her satırda kaç üründe/kutuda kullanıldığı ve stok adedi.
// Yeniden adlandırma ürün ve kutulardaki adı da değiştirir; mevcut bir adla aynı yazılırsa iki kayıt birleşir.
// Yalnızca hiçbir ürün veya kutuda kullanılmayan kayıt silinebilir.
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Info, Lock, Search, Tags } from "lucide-react";
import { markaEkle, markaSil, markaYenidenAdlandir, modelEkle, modelSil, modelYenidenAdlandir } from "@/actions/stok";
import { izinVar } from "@/lib/izinler";
import { panelAramasiOku } from "@/lib/panel-arama";
import { adAnahtari, aramaMetni } from "@/lib/schemas/ortak";
import type { UrunMarkasi, UrunModeli } from "@/lib/schemas/stok";
import { markaModelListesi } from "@/lib/stok";
import { createClient } from "@/lib/supabase/server";
import { oturum } from "@/lib/supabase/yetkili";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { inputSinifi, SayfaBasligi } from "../../../_components/form";
import { FiltreOzeti, FiltreSecimi, linkOlustur, secenekOku, uuidMi } from "../../../_components/liste";
import OtomatikFiltreFormu from "../../../_components/OtomatikFiltreFormu";
import SilButonu from "../../../_components/SilButonu";
import StokSekmeleri from "../StokSekmeleri";
import { AdEkleFormu, YenidenAdlandir } from "./MarkaModelIslemleri";

export const metadata: Metadata = {
    title: "Marka & Model",
};

const YOL = "/admin/stok/markalar";

const KULLANIM_FILTRELERI = ["", "kullanilan", "kullanilmayan"] as const;
const SIRALAMALAR = {
    ad: "Ad (A → Z)",
    urun: "En çok ürün",
    stok: "En çok stok",
    model: "En çok model",
} as const;
type Siralama = keyof typeof SIRALAMALAR;

type Kullanim = { urun: number; adet: number; kutu: number };
const bosKullanim = (): Kullanim => ({ urun: 0, adet: 0, kutu: 0 });

// Ürün ve kutulardaki marka/model metinleri (PostgREST tek istekte en fazla 1000 satır döndürür).
async function kullanimlariOku(supabase: Awaited<ReturnType<typeof createClient>>) {
    const oku = async <T,>(tablo: string, sutunlar: string) => {
        const sonuc: T[] = [];
        for (let bas = 0; ; bas += 1000) {
            const { data } = await supabase.from(tablo).select(sutunlar).not("marka", "is", null).order("id").range(bas, bas + 999);
            sonuc.push(...((data ?? []) as T[]));
            if (!data || data.length < 1000) return sonuc;
        }
    };
    const [urunler, kutular] = await Promise.all([
        oku<{ marka: string; model: string | null; stok_adedi: number }>("urunler", "marka, model, stok_adedi"),
        oku<{ marka: string; model: string }>("kutular", "marka, model"),
    ]);

    // Anahtarlar veritabanındaki ad_anahtari() ile aynı: büyük/küçük harf ve boşluk farkı yok sayılır.
    const marka = new Map<string, Kullanim>();
    const model = new Map<string, Kullanim>();
    const al = (harita: Map<string, Kullanim>, anahtar: string) => {
        let k = harita.get(anahtar);
        if (!k) harita.set(anahtar, (k = bosKullanim()));
        return k;
    };
    for (const u of urunler) {
        const mk = al(marka, adAnahtari(u.marka));
        mk.urun++;
        mk.adet += u.stok_adedi;
        if (u.model?.trim()) {
            const md = al(model, `${adAnahtari(u.marka)}|${adAnahtari(u.model)}`);
            md.urun++;
            md.adet += u.stok_adedi;
        }
    }
    for (const k of kutular) {
        al(marka, adAnahtari(k.marka)).kutu++;
        al(model, `${adAnahtari(k.marka)}|${adAnahtari(k.model)}`).kutu++;
    }
    return { marka, model };
}

export default async function MarkaModelSayfasi({
    searchParams,
}: {
    searchParams: Promise<{ marka?: string; kullanim?: string; sirala?: string }>;
}) {
    const p = await searchParams;
    const q = await panelAramasiOku(YOL); // adreste değil çerezde (src/lib/panel-arama.ts)
    const kullanim = secenekOku(p.kullanim, KULLANIM_FILTRELERI, "");
    const sirala = secenekOku<Siralama>(p.sirala, Object.keys(SIRALAMALAR) as Siralama[], "ad");
    const seciliId = uuidMi(p.marka) ? p.marka : undefined;
    const filtreler = { kullanim: kullanim || undefined, sirala: sirala === "ad" ? undefined : sirala };
    const aktifFiltre = [q, kullanim].filter(Boolean).length;

    const supabase = await createClient();
    const [o, { markalar, modeller }, kullanimlar] = await Promise.all([oturum(), markaModelListesi(supabase), kullanimlariOku(supabase)]);
    const yonetici = izinVar(o?.rol, "stok_yonet");

    const markaKullanimi = (m: UrunMarkasi) => kullanimlar.marka.get(adAnahtari(m.ad)) ?? bosKullanim();
    const modelKullanimi = (marka: UrunMarkasi, m: UrunModeli) =>
        kullanimlar.model.get(`${adAnahtari(marka.ad)}|${adAnahtari(m.ad)}`) ?? bosKullanim();
    const kullaniliyor = (k: Kullanim) => k.urun + k.kutu > 0;

    const modellerByMarka = new Map<string, UrunModeli[]>();
    for (const m of modeller) modellerByMarka.set(m.marka_id, [...(modellerByMarka.get(m.marka_id) ?? []), m]);

    // Arama marka adında veya o markanın modellerinde yapılır (Türkçe harf duyarsız).
    const aranan = aramaMetni(q.trim());
    const markaEslesir = (m: UrunMarkasi) => !aranan || aramaMetni(m.ad).includes(aranan);
    const modelEslesir = (m: UrunModeli) => !aranan || aramaMetni(m.ad).includes(aranan);

    const listelenen = markalar
        .filter((m) => markaEslesir(m) || (modellerByMarka.get(m.id) ?? []).some(modelEslesir))
        .filter((m) => !kullanim || (kullanim === "kullanilan") === kullaniliyor(markaKullanimi(m)))
        .toSorted((a, b) => {
            if (sirala === "urun") return markaKullanimi(b).urun - markaKullanimi(a).urun || a.ad.localeCompare(b.ad, "tr");
            if (sirala === "stok") return markaKullanimi(b).adet - markaKullanimi(a).adet || a.ad.localeCompare(b.ad, "tr");
            if (sirala === "model")
                return (modellerByMarka.get(b.id)?.length ?? 0) - (modellerByMarka.get(a.id)?.length ?? 0) || a.ad.localeCompare(b.ad, "tr");
            return a.ad.localeCompare(b.ad, "tr");
        });

    // Seçili marka: adresteki ya da listedeki ilk marka.
    const secili = markalar.find((m) => m.id === seciliId) ?? listelenen[0];
    // Arama marka adına uyuyorsa tüm modelleri, yalnızca modele uyuyorsa eşleşen modeller gösterilir.
    const seciliModeller = secili
        ? (modellerByMarka.get(secili.id) ?? [])
              .filter((m) => markaEslesir(secili) || modelEslesir(m))
              .filter((m) => !kullanim || (kullanim === "kullanilan") === kullaniliyor(modelKullanimi(secili, m)))
        : [];
    const markaLinki = (id: string) => linkOlustur(YOL, { ...filtreler, marka: id });

    return (
        <div>
            <SayfaBasligi
                baslik="Stok"
                aciklama="Ürün formundaki marka ve model listeleri. Formdan eklenen yeni marka/modeller ürün kaydedilince buraya otomatik eklenir."
            />

            <StokSekmeleri aktif={YOL} />

            <OtomatikFiltreFormu
                action={YOL}
                className="mb-3 grid gap-3 rounded-xl border bg-white p-3 shadow-sm sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(2,minmax(0,1fr))]"
            >
                {secili && <input type="hidden" name="marka" value={secili.id} />}
                <label className="flex min-w-0 flex-col gap-1 text-xs font-medium text-gray-500 sm:col-span-2 lg:col-span-1">
                    Ara
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                            <input
                                name="q"
                                type="search"
                                defaultValue={q}
                                placeholder="Marka veya model adı..."
                                className={cn(inputSinifi, "py-1.5 pl-9")}
                            />
                        </div>
                        <Button type="submit" variant="outline" className="h-[34px]">
                            Ara
                        </Button>
                    </div>
                </label>
                <FiltreSecimi
                    etiket="Kullanım"
                    name="kullanim"
                    deger={kullanim}
                    secenekler={[
                        { deger: "", etiket: "Tümü" },
                        { deger: "kullanilan", etiket: "Ürün/kutuda kullanılan" },
                        { deger: "kullanilmayan", etiket: "Kullanılmayan" },
                    ]}
                />
                <FiltreSecimi
                    etiket="Sıralama"
                    name="sirala"
                    deger={sirala}
                    secenekler={Object.entries(SIRALAMALAR).map(([deger, etiket]) => ({ deger, etiket }))}
                />
            </OtomatikFiltreFormu>

            <FiltreOzeti sonucSayisi={listelenen.length} aktifFiltre={aktifFiltre} temizleLinki={YOL} />

            {yonetici && (
                <p className="mb-3 flex items-start gap-1.5 text-xs text-gray-500">
                    <Info className="mt-0.5 size-3.5 shrink-0" />
                    Yeniden adlandırınca ürün ve kutulardaki ad da değişir. Mevcut bir adla aynı yazarsanız (örn. “LENOVO” → “Lenovo”) iki kayıt
                    birleşir. Kullanılan kayıtlar silinemez.
                </p>
            )}

            <div className="grid items-start gap-4 lg:grid-cols-2">
                {/* ─── Markalar ─── */}
                <section className="rounded-xl border bg-white shadow-sm">
                    <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
                        <h2 className="flex items-center gap-2 font-semibold text-[var(--color-secondary)]">
                            <Tags className="size-4" /> Markalar <span className="font-normal text-gray-500">({listelenen.length})</span>
                        </h2>
                    </div>
                    {yonetici && (
                        <div className="border-b p-3">
                            <AdEkleFormu ekle={markaEkle} yerTutucu="Yeni marka adı" etiket="Marka Ekle" enFazla={60} />
                        </div>
                    )}
                    {listelenen.length === 0 ? (
                        <p className="p-6 text-center text-sm text-gray-500">{markalar.length === 0 ? "Henüz marka yok." : "Filtreye uygun marka yok."}</p>
                    ) : (
                        <div className="max-h-[70vh] overflow-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="sticky top-0 border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                                    <tr>
                                        <th className="px-3 py-2 font-medium">Marka</th>
                                        <th className="px-2 py-2 text-right font-medium">Model</th>
                                        <th className="px-2 py-2 text-right font-medium">Ürün</th>
                                        <th className="px-2 py-2 text-right font-medium">Stok</th>
                                        <th className="px-2 py-2 text-right font-medium">Kutu</th>
                                        <th className="px-2 py-2" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {listelenen.map((m) => {
                                        const k = markaKullanimi(m);
                                        const aktif = m.id === secili?.id;
                                        return (
                                            <tr key={m.id} className={cn("hover:bg-gray-50", aktif && "bg-[var(--color-secondary)]/5")}>
                                                <td className="px-3 py-1.5">
                                                    <Link
                                                        href={markaLinki(m.id)}
                                                        scroll={false}
                                                        aria-current={aktif ? "true" : undefined}
                                                        className="flex items-center gap-1 font-medium hover:underline"
                                                    >
                                                        {m.ad}
                                                        <ChevronRight className={cn("size-3.5 text-gray-400", aktif && "text-[var(--color-secondary)]")} />
                                                    </Link>
                                                </td>
                                                <td className="px-2 py-1.5 text-right tabular-nums">{modellerByMarka.get(m.id)?.length ?? 0}</td>
                                                <td className="px-2 py-1.5 text-right tabular-nums">{k.urun}</td>
                                                <td className="px-2 py-1.5 text-right tabular-nums">{k.adet}</td>
                                                <td className="px-2 py-1.5 text-right tabular-nums">{k.kutu}</td>
                                                <td className="whitespace-nowrap px-2 py-1 text-right">
                                                    {yonetici && (
                                                        <div className="flex items-start justify-end">
                                                            <YenidenAdlandir
                                                                ad={m.ad}
                                                                kaydet={markaYenidenAdlandir.bind(null, m.id)}
                                                                enFazla={60}
                                                                etkilenen={{ urun: k.urun, kutu: k.kutu }}
                                                            />
                                                            {kullaniliyor(k) ? (
                                                                <KilitIkonu metin="Ürün veya kutuda kullanıldığı için silinemez" />
                                                            ) : (
                                                                <SilButonu onay={`“${m.ad}” markası ve modelleri silinsin mi?`} sil={markaSil.bind(null, m.id)} />
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* ─── Seçili markanın modelleri ─── */}
                <section className="rounded-xl border bg-white shadow-sm">
                    <div className="border-b px-4 py-3">
                        <h2 className="font-semibold text-[var(--color-secondary)]">
                            {secili ? (
                                <>
                                    {secili.ad} modelleri <span className="font-normal text-gray-500">({seciliModeller.length})</span>
                                </>
                            ) : (
                                "Modeller"
                            )}
                        </h2>
                    </div>
                    {!secili ? (
                        <p className="p-6 text-center text-sm text-gray-500">Modellerini görmek için soldan bir marka seçin.</p>
                    ) : (
                        <>
                            {yonetici && (
                                <div className="border-b p-3">
                                    <AdEkleFormu
                                        ekle={modelEkle.bind(null, secili.id)}
                                        yerTutucu={`${secili.ad} için yeni model`}
                                        etiket="Model Ekle"
                                        enFazla={100}
                                    />
                                </div>
                            )}
                            {seciliModeller.length === 0 ? (
                                <p className="p-6 text-center text-sm text-gray-500">
                                    {(modellerByMarka.get(secili.id)?.length ?? 0) === 0 ? "Bu markada henüz model yok." : "Filtreye uygun model yok."}
                                </p>
                            ) : (
                                <div className="max-h-[70vh] overflow-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="sticky top-0 border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                                            <tr>
                                                <th className="px-3 py-2 font-medium">Model</th>
                                                <th className="px-2 py-2 text-right font-medium">Ürün</th>
                                                <th className="px-2 py-2 text-right font-medium">Stok</th>
                                                <th className="px-2 py-2 text-right font-medium">Kutu</th>
                                                <th className="px-2 py-2" />
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {seciliModeller.map((m) => {
                                                const k = modelKullanimi(secili, m);
                                                return (
                                                    <tr key={m.id} className="hover:bg-gray-50">
                                                        <td className="px-3 py-1.5 font-medium">{m.ad}</td>
                                                        <td className="px-2 py-1.5 text-right tabular-nums">{k.urun}</td>
                                                        <td className="px-2 py-1.5 text-right tabular-nums">{k.adet}</td>
                                                        <td className="px-2 py-1.5 text-right tabular-nums">{k.kutu}</td>
                                                        <td className="whitespace-nowrap px-2 py-1 text-right">
                                                            {yonetici && (
                                                                <div className="flex items-start justify-end">
                                                                    <YenidenAdlandir
                                                                        ad={m.ad}
                                                                        kaydet={modelYenidenAdlandir.bind(null, m.id)}
                                                                        enFazla={100}
                                                                        etkilenen={{ urun: k.urun, kutu: k.kutu }}
                                                                    />
                                                                    {kullaniliyor(k) ? (
                                                                        <KilitIkonu metin="Ürün veya kutuda kullanıldığı için silinemez" />
                                                                    ) : (
                                                                        <SilButonu onay={`“${secili.ad} ${m.ad}” modeli silinsin mi?`} sil={modelSil.bind(null, m.id)} />
                                                                    )}
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </div>
        </div>
    );
}

function KilitIkonu({ metin }: { metin: string }) {
    return (
        <span title={metin} aria-label={metin} className="inline-flex size-9 items-center justify-center text-gray-300">
            <Lock className="size-4" />
        </span>
    );
}
