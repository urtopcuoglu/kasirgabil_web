// src/app/admin/(panel)/kasa/HareketFormu.tsx
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { kasaHareketiKaydet } from "@/actions/kasa";
import {
    HAREKET_TIPLERI,
    KATEGORI_KODLARI,
    kasaHareketiSemasi,
    ODEME_YONTEMLERI,
    type BaglantiSecenegi,
    type KasaHareketi,
    type KasaHareketiGirdisi,
    type KasaKategori,
    type KasaTipi,
} from "@/lib/schemas/kasa";
import { sayiOku } from "@/lib/schemas/ortak";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Alan, anaButonSinifi, FormHatasi, inputSinifi } from "../../_components/form";
import BaglantiSecici from "./BaglantiSecici";

export type Baglantilar = {
    servis: BaglantiSecenegi | null;
    urun: BaglantiSecenegi | null;
    rehber: BaglantiSecenegi | null;
};

type Props = {
    kategoriler: KasaKategori[];
    tarih: string; // yeni harekette varsayılan tarih (görüntülenen gün)
    bugun: string;
    hareket?: KasaHareketi; // verilmezse yeni hareket
    baslangic?: Partial<Baglantilar>;
};

const metin = (v: number) => String(Math.round(v * 100) / 100).replace(".", ",");

export default function HareketFormu({ kategoriler, tarih, bugun, hareket, baslangic }: Props) {
    const [sunucuHatasi, setSunucuHatasi] = useState<string>();
    const [kaydedildi, setKaydedildi] = useState(false);
    const [bekliyor, startTransition] = useTransition();
    const [baglanti, setBaglanti] = useState<Baglantilar>({
        servis: baslangic?.servis ?? null,
        urun: baslangic?.urun ?? null,
        rehber: baslangic?.rehber ?? null,
    });
    // Tutar sistem tarafından dolduruldu mu (adet değişince yeniden hesaplamak için)
    const [otomatikTutar, setOtomatikTutar] = useState(false);

    const kodlu = (kod: string) => kategoriler.find((k) => k.kod === kod)?.id ?? "";
    const ilkTip: KasaTipi = hareket?.tip ?? "gelir";
    const ilkKategori = hareket?.kategori_id ?? (baslangic?.servis ? kodlu(KATEGORI_KODLARI.servis) : baslangic?.urun ? kodlu(KATEGORI_KODLARI.satis) : "");
    const ilkTutar = hareket
        ? metin(Number(hareket.tutar))
        : baslangic?.servis?.kalan && baslangic.servis.kalan > 0
          ? metin(baslangic.servis.kalan)
          : baslangic?.urun?.satisFiyati
            ? metin(baslangic.urun.satisFiyati)
            : "";

    const varsayilanlar: KasaHareketiGirdisi = {
        tarih: hareket?.tarih ?? tarih,
        tip: ilkTip,
        yontem: hareket?.yontem ?? "nakit",
        tutar: ilkTutar,
        kategori_id: ilkKategori,
        kimden_kime: hareket?.kimden_kime ?? (baslangic?.servis?.musteriAd ?? ""),
        aciklama: hareket?.aciklama ?? "",
        rehber_kisi_id: hareket?.rehber_kisi_id ?? baslangic?.rehber?.id ?? baslangic?.servis?.musteriId ?? "",
        servis_id: hareket?.servis_id ?? baslangic?.servis?.id ?? "",
        urun_id: hareket?.urun_id ?? baslangic?.urun?.id ?? "",
        urun_adet: hareket?.urun_adet != null ? String(hareket.urun_adet) : baslangic?.urun ? "1" : "",
    };

    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        reset,
        control,
        formState: { errors },
    } = useForm<KasaHareketiGirdisi>({ resolver: zodResolver(kasaHareketiSemasi), defaultValues: varsayilanlar });

    const [tip, kategoriId] = useWatch({ control, name: ["tip", "kategori_id"] });
    const tipKategorileri = kategoriler.filter((k) => k.tip === tip);

    function tipDegisti(yeni: KasaTipi) {
        setValue("tip", yeni);
        const kategori = kategoriler.find((k) => k.id === getValues("kategori_id"));
        if (baglanti.urun) setValue("kategori_id", kodlu(yeni === "gelir" ? KATEGORI_KODLARI.satis : KATEGORI_KODLARI.alis));
        else if (kategori && kategori.tip !== yeni) setValue("kategori_id", "");
    }

    function tutarYaz(tutar: number | null | undefined) {
        if (!tutar || tutar <= 0) return;
        setValue("tutar", metin(tutar), { shouldValidate: true });
        setOtomatikTutar(true);
    }

    function servisSec(s: BaglantiSecenegi | null) {
        setBaglanti((b) => ({ ...b, servis: s, rehber: s && !b.rehber && s.musteriId ? { id: s.musteriId, etiket: s.musteriAd ?? "" } : b.rehber }));
        setValue("servis_id", s?.id ?? "");
        if (!s) return;
        if (!getValues("rehber_kisi_id") && s.musteriId) setValue("rehber_kisi_id", s.musteriId);
        if (getValues("tip") === "gelir") setValue("kategori_id", kodlu(KATEGORI_KODLARI.servis));
        if (!getValues("tutar")) tutarYaz(s.kalan);
    }

    function urunSec(u: BaglantiSecenegi | null) {
        setBaglanti((b) => ({ ...b, urun: u }));
        setValue("urun_id", u?.id ?? "");
        setValue("urun_adet", u ? "1" : "");
        if (!u) return;
        setValue("kategori_id", kodlu(getValues("tip") === "gelir" ? KATEGORI_KODLARI.satis : KATEGORI_KODLARI.alis));
        if (getValues("tip") === "gelir" && (!getValues("tutar") || otomatikTutar)) tutarYaz(u.satisFiyati);
    }

    function adetDegisti() {
        const adet = sayiOku(getValues("urun_adet"));
        if (otomatikTutar && baglanti.urun?.satisFiyati && adet && adet > 0) tutarYaz(baglanti.urun.satisFiyati * adet);
    }

    function rehberSec(r: BaglantiSecenegi | null) {
        setBaglanti((b) => ({ ...b, rehber: r }));
        setValue("rehber_kisi_id", r?.id ?? "");
    }

    const gonder = handleSubmit((veri) => {
        setSunucuHatasi(undefined);
        setKaydedildi(false);
        startTransition(async () => {
            const sonuc = await kasaHareketiKaydet(hareket?.id ?? null, veri);
            if (sonuc?.hata) {
                setSunucuHatasi(sonuc.hata);
                return;
            }
            // Yeni harekette form boşalır; tarih, tip ve yöntem bir sonraki giriş için korunur.
            reset({
                ...varsayilanlar,
                tarih: veri.tarih,
                tip: veri.tip,
                yontem: veri.yontem,
                tutar: "",
                kategori_id: "",
                kimden_kime: "",
                rehber_kisi_id: "",
                servis_id: "",
                urun_id: "",
                urun_adet: "",
            });
            setBaglanti({ servis: null, urun: null, rehber: null });
            setOtomatikTutar(false);
            setKaydedildi(true);
        });
    });

    return (
        <form onSubmit={gonder} className="space-y-4">
            <input type="hidden" {...register("servis_id")} />
            <input type="hidden" {...register("urun_id")} />
            <input type="hidden" {...register("rehber_kisi_id")} />

            <div className="grid gap-4 sm:grid-cols-2">
                <Alan etiket="Tip" htmlFor="tip_gelir" zorunlu>
                    <div role="radiogroup" className="grid grid-cols-2 gap-1 rounded-md border bg-gray-50 p-1">
                        {(Object.keys(HAREKET_TIPLERI) as KasaTipi[]).map((t) => (
                            <button
                                key={t}
                                id={`tip_${t}`}
                                type="button"
                                role="radio"
                                aria-checked={tip === t}
                                onClick={() => tipDegisti(t)}
                                className={cn(
                                    "rounded px-3 py-1.5 text-sm font-medium transition",
                                    tip === t
                                        ? t === "gelir"
                                            ? "bg-green-600 text-white"
                                            : "bg-[var(--color-primary)] text-white"
                                        : "text-gray-600 hover:bg-white"
                                )}
                            >
                                {HAREKET_TIPLERI[t]}
                            </button>
                        ))}
                    </div>
                </Alan>
                <Alan etiket="Tarih" htmlFor="tarih" hata={errors.tarih?.message} zorunlu>
                    <input id="tarih" type="date" max={bugun} className={inputSinifi} {...register("tarih")} />
                </Alan>
                <Alan etiket="Tutar (₺)" htmlFor="tutar" hata={errors.tutar?.message} zorunlu>
                    <input
                        id="tutar"
                        inputMode="decimal"
                        placeholder="0,00"
                        autoFocus={!hareket}
                        aria-invalid={!!errors.tutar}
                        className={cn(inputSinifi, "text-lg font-semibold")}
                        {...register("tutar", { onChange: () => setOtomatikTutar(false) })}
                    />
                </Alan>
                <Alan etiket="Kategori" htmlFor="kategori_id" hata={errors.kategori_id?.message} zorunlu>
                    <select id="kategori_id" aria-invalid={!!errors.kategori_id} className={inputSinifi} {...register("kategori_id")}>
                        <option value="">— Kategori seçin —</option>
                        {tipKategorileri.map((k) => (
                            <option key={k.id} value={k.id}>
                                {k.ad}
                            </option>
                        ))}
                    </select>
                    {!kategoriId && (
                        <p className="text-xs text-gray-500">
                            Listede yoksa{" "}
                            <Link href="/admin/kasa/kategoriler" className="underline">
                                kategori ekleyin
                            </Link>
                            .
                        </p>
                    )}
                </Alan>
            </div>

            <Alan etiket="Ödeme Yöntemi" htmlFor="yontem_nakit" hata={errors.yontem?.message} zorunlu>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {Object.entries(ODEME_YONTEMLERI).map(([deger, etiket]) => (
                        <label
                            key={deger}
                            className="flex cursor-pointer items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition has-[:checked]:border-[var(--color-secondary)] has-[:checked]:bg-[var(--color-secondary)] has-[:checked]:text-white"
                        >
                            <input type="radio" id={`yontem_${deger}`} value={deger} className="sr-only" {...register("yontem")} />
                            {etiket}
                        </label>
                    ))}
                </div>
            </Alan>

            <div className="grid gap-4 sm:grid-cols-3">
                <Alan etiket="Servis Kaydı" htmlFor="baglanti_servis">
                    <BaglantiSecici id="baglanti_servis" tur="servis" secili={baglanti.servis} onSec={servisSec} yerTutucu="Form no veya müşteri ara" />
                </Alan>
                <Alan etiket="Ürün (stoktan)" htmlFor="baglanti_urun" hata={errors.urun_adet?.message}>
                    <BaglantiSecici id="baglanti_urun" tur="urun" secili={baglanti.urun} onSec={urunSec} yerTutucu="Stok kodu, ürün, barkod ara" />
                    {baglanti.urun && (
                        <div className="flex items-center gap-2">
                            <label htmlFor="urun_adet" className="text-xs text-gray-500">
                                Adet
                            </label>
                            <input
                                id="urun_adet"
                                inputMode="numeric"
                                className={cn(inputSinifi, "w-20 py-1")}
                                {...register("urun_adet", { onChange: adetDegisti })}
                            />
                            <span className="text-xs text-gray-500">{tip === "gelir" ? "stoktan düşer" : "stoka eklenir"}</span>
                        </div>
                    )}
                </Alan>
                <Alan etiket="Rehber Kişisi" htmlFor="baglanti_rehber">
                    <BaglantiSecici id="baglanti_rehber" tur="rehber" secili={baglanti.rehber} onSec={rehberSec} yerTutucu="İsim, firma veya telefon ara" />
                </Alan>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <Alan etiket={tip === "gelir" ? "Kimden alındı" : "Kime ödendi"} htmlFor="kimden_kime" hata={errors.kimden_kime?.message}>
                    <input
                        id="kimden_kime"
                        placeholder={baglanti.rehber ? `Boş bırakılırsa: ${baglanti.rehber.etiket}` : undefined}
                        className={inputSinifi}
                        {...register("kimden_kime")}
                    />
                </Alan>
                <Alan etiket="Açıklama" htmlFor="aciklama" hata={errors.aciklama?.message}>
                    <input id="aciklama" className={inputSinifi} {...register("aciklama")} />
                </Alan>
            </div>

            <FormHatasi mesaj={sunucuHatasi} />
            {kaydedildi && (
                <p role="status" className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
                    Hareket kaydedildi.
                </p>
            )}

            <div className="flex gap-2">
                <Button type="submit" disabled={bekliyor} className={anaButonSinifi}>
                    {bekliyor ? <Loader2 className="animate-spin" /> : <Save />}
                    {hareket ? "Kaydet" : "Hareketi Ekle"}
                </Button>
                {hareket && (
                    <Button type="button" variant="outline" asChild>
                        <Link href={`/admin/kasa?tarih=${hareket.tarih}`}>Vazgeç</Link>
                    </Button>
                )}
            </div>
        </form>
    );
}
