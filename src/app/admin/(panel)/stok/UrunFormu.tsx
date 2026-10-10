// src/app/admin/(panel)/stok/UrunFormu.tsx
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calculator, ChevronDown, Loader2, Save } from "lucide-react";
import { urunKaydet } from "@/actions/stok";
import {
    kategoriAgaci,
    KDV_ORANLARI,
    kutuEtiketi,
    maliyetHesapla,
    URUN_DURUMLARI,
    urunSemasi,
    type Kutu,
    type Urun,
    type UrunGirdisi,
    type UrunKategori,
} from "@/lib/schemas/stok";
import type { RehberKisi } from "@/lib/schemas/rehber";
import { sayiOku } from "@/lib/schemas/ortak";
import { paraYaz } from "@/lib/tarih";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Alan, anaButonSinifi, FormHatasi, inputSinifi } from "../../_components/form";
import KategoriSecici from "./KategoriSecici";

type Props = {
    kategoriler: UrunKategori[];
    kutular: Pick<Kutu, "id" | "kutu_no" | "marka" | "model">[];
    tedarikciler: Pick<RehberKisi, "id" | "ad_soyad_unvan" | "firma">[];
    urun?: Urun; // verilmezse yeni kayıt
    baslangicKutuId?: string; // kutu sayfasından "parça ekle" ile gelindiyse
};

// Sayı → form metni ("1250.5" → "1250,5"); boşsa "".
const metin = (v: number | null | undefined) => (v == null ? "" : String(v).replace(".", ","));
const yuvarla = (v: number) => String(Math.round(v * 100) / 100).replace(".", ",");

export default function UrunFormu({ kategoriler, kutular, tedarikciler, urun, baslangicKutuId }: Props) {
    const [sunucuHatasi, setSunucuHatasi] = useState<string>();
    const [bekliyor, startTransition] = useTransition();
    // Seçiciden eklenen yeni kategoriler de listeye katılır.
    const [kategoriListesi, setKategoriListesi] = useState(kategoriler);
    const agac = kategoriAgaci(kategoriListesi);

    // Kutu sayfasından gelindiyse kutu sistemindeki ilk kategori (genelde Notebook › Yedek Parça) seçili gelir.
    const varsayilanKategori = baslangicKutuId ? (agac.sirali.find((k) => k.kutu_sistemi)?.id ?? "") : "";
    const baslangicKutusu = kutular.find((k) => k.id === baslangicKutuId);

    const maliyetDolu = !!urun && [urun.kdv_orani, urun.komisyon_orani, urun.komisyon_tutari, urun.kargo_desi, urun.kargo_ucreti].some((v) => v != null);
    const [maliyetAcik, setMaliyetAcik] = useState(maliyetDolu);
    // Komisyonda en son elle girilen alan; satış fiyatı değişince diğeri buna göre yeniden hesaplanır.
    const [sonKomisyonAlani, setSonKomisyonAlani] = useState<"oran" | "tutar">(urun?.komisyon_tutari != null && urun.komisyon_orani == null ? "tutar" : "oran");

    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        control,
        formState: { errors },
    } = useForm<UrunGirdisi>({
        resolver: zodResolver(urunSemasi),
        defaultValues: {
            kategori_id: urun?.kategori_id ?? varsayilanKategori,
            kutu_id: urun?.kutu_id ?? baslangicKutuId ?? "",
            ad: urun?.ad ?? "",
            marka: urun?.marka ?? baslangicKutusu?.marka ?? "",
            model: urun?.model ?? baslangicKutusu?.model ?? "",
            durum: urun?.durum ?? (baslangicKutuId ? "ikinci_el" : "sifir"),
            seri_no: urun?.seri_no ?? "",
            barkod: urun?.barkod ?? "",
            tedarikci_id: urun?.tedarikci_id ?? "",
            aciklama: urun?.aciklama ?? "",
            stok_adedi: urun ? "" : "1",
            satis_fiyati: metin(urun?.satis_fiyati),
            alis_fiyati: metin(urun?.alis_fiyati),
            kdv_orani: urun?.kdv_orani ? String(urun.kdv_orani) : "",
            komisyon_orani: metin(urun?.komisyon_orani),
            komisyon_tutari: metin(urun?.komisyon_tutari),
            kargo_desi: metin(urun?.kargo_desi),
            kargo_ucreti: metin(urun?.kargo_ucreti),
        },
    });

    const [kategoriId, satis, alis, kdv, komOran, komTutar, kargo] = useWatch({
        control,
        name: ["kategori_id", "satis_fiyati", "alis_fiyati", "kdv_orani", "komisyon_orani", "komisyon_tutari", "kargo_ucreti"],
    });
    const kutulu = !!kategoriId && agac.kutulu(kategoriId);

    function kategoriSecildi(id: string) {
        setValue("kategori_id", id, { shouldValidate: true });
        // Yeni kayıtta yedek parça kategorisi seçilince durum varsayılan olarak ikinci el olur.
        if (!urun && agac.kutulu(id)) setValue("durum", "ikinci_el");
    }

    function kutuDegisti(e: React.ChangeEvent<HTMLSelectElement>) {
        const kutu = kutular.find((k) => k.id === e.target.value);
        if (!kutu) return;
        // Marka/model boşsa kutunun üstündeki bilgiyle doldurulur.
        if (!getValues("marka")) setValue("marka", kutu.marka);
        if (!getValues("model")) setValue("model", kutu.model);
    }

    function komisyonuEsitle(kaynak: "oran" | "tutar") {
        const fiyat = sayiOku(getValues("satis_fiyati"));
        if (!fiyat) return;
        if (kaynak === "oran") {
            const oran = sayiOku(getValues("komisyon_orani"));
            setValue("komisyon_tutari", oran == null || Number.isNaN(oran) ? "" : yuvarla((fiyat * oran) / 100));
        } else {
            const tutar = sayiOku(getValues("komisyon_tutari"));
            setValue("komisyon_orani", tutar == null || Number.isNaN(tutar) ? "" : yuvarla((tutar / fiyat) * 100));
        }
    }

    const gonder = handleSubmit((veri) => {
        setSunucuHatasi(undefined);
        startTransition(async () => {
            const sonuc = await urunKaydet(urun?.id ?? null, veri);
            if (sonuc?.hata) setSunucuHatasi(sonuc.hata);
        });
    });

    const sayi = (v: string) => {
        const s = sayiOku(v);
        return s == null || Number.isNaN(s) ? null : s;
    };
    const hesap = maliyetHesapla({
        satis: sayi(satis),
        alis: sayi(alis),
        kdvOrani: kdv ? Number(kdv) : null,
        komisyonOrani: sayi(komOran),
        komisyonTutari: sayi(komTutar),
        kargo: sayi(kargo),
    });

    const iptalLinki = urun ? `/admin/stok/${urun.id}` : baslangicKutuId ? `/admin/stok/kutular/${baslangicKutuId}` : "/admin/stok";

    return (
        <form onSubmit={gonder} className="max-w-3xl space-y-6 rounded-xl border bg-white p-5 shadow-sm sm:p-6">
            <fieldset className="space-y-4">
                <legend className="mb-1 font-semibold text-[var(--color-secondary)]">Ürün</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Alan etiket="Kategori" htmlFor="kategori_id" hata={errors.kategori_id?.message} zorunlu>
                        <input type="hidden" {...register("kategori_id")} />
                        <KategoriSecici
                            id="kategori_id"
                            kategoriler={kategoriListesi}
                            deger={kategoriId}
                            onSec={kategoriSecildi}
                            onEklendi={(k) => setKategoriListesi((liste) => [...liste, k])}
                            gecersiz={!!errors.kategori_id}
                        />
                    </Alan>

                    {kutulu ? (
                        <Alan etiket="Kutu" htmlFor="kutu_id" hata={errors.kutu_id?.message} zorunlu>
                            <select id="kutu_id" className={inputSinifi} {...register("kutu_id", { onChange: kutuDegisti })}>
                                <option value="">— Kutu seçin —</option>
                                {kutular.map((k) => (
                                    <option key={k.id} value={k.id}>
                                        {kutuEtiketi(k)}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500">
                                Stok kodu kutu numarasıyla oluşur (örn. 200-0001). Kutu yoksa{" "}
                                <Link href="/admin/stok/kutular" className="underline">
                                    yeni kutu açın
                                </Link>
                                .
                            </p>
                        </Alan>
                    ) : (
                        <div className="hidden sm:block" />
                    )}

                    <Alan etiket="Ürün Adı" htmlFor="ad" hata={errors.ad?.message} zorunlu className="sm:col-span-2">
                        <input
                            id="ad"
                            placeholder={kutulu ? "Örn. 14\" FHD IPS Ekran" : "Örn. Lenovo IdeaPad Slim 3 15IAN8"}
                            aria-invalid={!!errors.ad}
                            className={inputSinifi}
                            {...register("ad")}
                        />
                    </Alan>
                    <Alan etiket="Marka" htmlFor="marka" hata={errors.marka?.message}>
                        <input id="marka" className={inputSinifi} {...register("marka")} />
                    </Alan>
                    <Alan etiket="Model" htmlFor="model" hata={errors.model?.message}>
                        <input id="model" className={inputSinifi} {...register("model")} />
                    </Alan>
                    <Alan etiket="Durum" htmlFor="durum_sifir" hata={errors.durum?.message} zorunlu>
                        <div className="flex gap-4 pt-1.5">
                            {Object.entries(URUN_DURUMLARI).map(([deger, { etiket }]) => (
                                <label key={deger} className="flex items-center gap-2 text-sm">
                                    <input type="radio" id={`durum_${deger}`} value={deger} {...register("durum")} />
                                    {etiket}
                                </label>
                            ))}
                        </div>
                    </Alan>
                    <Alan etiket="Tedarikçi" htmlFor="tedarikci_id" hata={errors.tedarikci_id?.message}>
                        <select id="tedarikci_id" className={inputSinifi} {...register("tedarikci_id")}>
                            <option value="">— Seçilmedi —</option>
                            {tedarikciler.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.ad_soyad_unvan}
                                    {t.firma ? ` (${t.firma})` : ""}
                                </option>
                            ))}
                        </select>
                    </Alan>
                    <Alan etiket="Seri No" htmlFor="seri_no" hata={errors.seri_no?.message}>
                        <input id="seri_no" autoComplete="off" className={inputSinifi} {...register("seri_no")} />
                    </Alan>
                    <Alan etiket="Barkod / GTIN" htmlFor="barkod" hata={errors.barkod?.message}>
                        <input id="barkod" autoComplete="off" inputMode="numeric" className={inputSinifi} {...register("barkod")} />
                    </Alan>
                    {!urun && (
                        <Alan etiket="Başlangıç Stok Adedi" htmlFor="stok_adedi" hata={errors.stok_adedi?.message}>
                            <input id="stok_adedi" inputMode="numeric" className={inputSinifi} {...register("stok_adedi")} />
                            <p className="text-xs text-gray-500">Sonraki değişiklikler ürün sayfasından stok hareketiyle yapılır.</p>
                        </Alan>
                    )}
                </div>
                <Alan etiket="Açıklama" htmlFor="aciklama" hata={errors.aciklama?.message}>
                    <textarea
                        id="aciklama"
                        rows={2}
                        placeholder="Parçanın durumu, kozmetik kusurlar, uyumlu modeller vb."
                        className={inputSinifi}
                        {...register("aciklama")}
                    />
                </Alan>
            </fieldset>

            <fieldset className="space-y-4">
                <legend className="mb-1 font-semibold text-[var(--color-secondary)]">Fiyat</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Alan etiket="Satış Fiyatı (₺, KDV dahil)" htmlFor="satis_fiyati" hata={errors.satis_fiyati?.message}>
                        <div className="flex gap-2">
                            <input
                                id="satis_fiyati"
                                inputMode="decimal"
                                placeholder="0,00"
                                aria-invalid={!!errors.satis_fiyati}
                                className={inputSinifi}
                                {...register("satis_fiyati", { onChange: () => komisyonuEsitle(sonKomisyonAlani) })}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setMaliyetAcik((a) => !a)}
                                aria-expanded={maliyetAcik}
                                aria-controls="maliyet_hesabi"
                                className="shrink-0"
                            >
                                <Calculator /> Maliyet hesabı
                                <ChevronDown className={cn("transition", maliyetAcik && "rotate-180")} />
                            </Button>
                        </div>
                    </Alan>
                    <Alan etiket="Alış Fiyatı (₺)" htmlFor="alis_fiyati" hata={errors.alis_fiyati?.message}>
                        <input id="alis_fiyati" inputMode="decimal" placeholder="0,00" className={inputSinifi} {...register("alis_fiyati")} />
                    </Alan>
                </div>

                {maliyetAcik && (
                    <div id="maliyet_hesabi" className="space-y-4 rounded-lg border border-dashed bg-gray-50 p-4">
                        <p className="text-xs text-gray-500">
                            Pazaryeri satışı için. Satış fiyatı KDV dahil kabul edilir; komisyonda oran veya tutardan birini girin,
                            diğeri otomatik hesaplanır.
                        </p>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <Alan etiket="KDV Oranı" htmlFor="kdv_orani" hata={errors.kdv_orani?.message}>
                                <select id="kdv_orani" className={inputSinifi} {...register("kdv_orani")}>
                                    <option value="">—</option>
                                    {KDV_ORANLARI.map((o) => (
                                        <option key={o} value={o}>
                                            %{o}
                                        </option>
                                    ))}
                                </select>
                            </Alan>
                            <Alan etiket="Komisyon Oranı (%)" htmlFor="komisyon_orani" hata={errors.komisyon_orani?.message}>
                                <input
                                    id="komisyon_orani"
                                    inputMode="decimal"
                                    className={inputSinifi}
                                    {...register("komisyon_orani", {
                                        onChange: () => {
                                            setSonKomisyonAlani("oran");
                                            komisyonuEsitle("oran");
                                        },
                                    })}
                                />
                            </Alan>
                            <Alan etiket="Komisyon Ücreti (₺)" htmlFor="komisyon_tutari" hata={errors.komisyon_tutari?.message}>
                                <input
                                    id="komisyon_tutari"
                                    inputMode="decimal"
                                    className={inputSinifi}
                                    {...register("komisyon_tutari", {
                                        onChange: () => {
                                            setSonKomisyonAlani("tutar");
                                            komisyonuEsitle("tutar");
                                        },
                                    })}
                                />
                            </Alan>
                            <Alan etiket="Kargo Desisi" htmlFor="kargo_desi" hata={errors.kargo_desi?.message}>
                                <input id="kargo_desi" inputMode="decimal" className={inputSinifi} {...register("kargo_desi")} />
                            </Alan>
                            <Alan etiket="Kargo Ücreti (₺)" htmlFor="kargo_ucreti" hata={errors.kargo_ucreti?.message}>
                                <input id="kargo_ucreti" inputMode="decimal" className={inputSinifi} {...register("kargo_ucreti")} />
                            </Alan>
                        </div>
                        <MaliyetOzeti satis={sayi(satis)} hesap={hesap} />
                    </div>
                )}
            </fieldset>

            <FormHatasi mesaj={sunucuHatasi} />

            <div className="flex gap-2">
                <Button type="submit" disabled={bekliyor} className={anaButonSinifi}>
                    {bekliyor ? <Loader2 className="animate-spin" /> : <Save />}
                    {urun ? "Kaydet" : "Ürünü Ekle"}
                </Button>
                <Button type="button" variant="outline" asChild>
                    <Link href={iptalLinki}>Vazgeç</Link>
                </Button>
            </div>
        </form>
    );
}

// Satış fiyatından KDV, komisyon ve kargo düşülünce kalan tutar (ürün sayfasında da kullanılır).
export function MaliyetOzeti({ satis, hesap }: { satis: number | null; hesap: ReturnType<typeof maliyetHesapla> }) {
    if (!satis) return <p className="text-sm text-gray-500">Hesap için satış fiyatı girin.</p>;

    const satirlar = [
        { etiket: "Satış fiyatı", tutar: satis },
        { etiket: "KDV", tutar: -hesap.kdv },
        { etiket: "Pazaryeri komisyonu", tutar: -hesap.komisyon },
        { etiket: "Kargo", tutar: -hesap.kargo },
    ];

    return (
        <dl className="divide-y rounded-md border bg-white text-sm">
            {satirlar.map((s) => (
                <div key={s.etiket} className="flex justify-between px-3 py-1.5">
                    <dt className="text-gray-600">{s.etiket}</dt>
                    <dd className="tabular-nums">{paraYaz(s.tutar)}</dd>
                </div>
            ))}
            <div className="flex justify-between px-3 py-2 font-semibold">
                <dt>Elde kalan</dt>
                <dd className={cn("tabular-nums", hesap.net < 0 && "text-[var(--color-primary)]")}>{paraYaz(hesap.net)}</dd>
            </div>
            {hesap.kar != null && (
                <div className="flex justify-between px-3 py-2">
                    <dt className="text-gray-600">Alış fiyatı düşülünce kâr</dt>
                    <dd className={cn("font-semibold tabular-nums", hesap.kar < 0 ? "text-[var(--color-primary)]" : "text-green-700")}>
                        {paraYaz(hesap.kar)}
                        {hesap.marj != null && <span className="ml-1 text-xs font-normal text-gray-500">(%{hesap.marj.toFixed(1)})</span>}
                    </dd>
                </div>
            )}
        </dl>
    );
}
