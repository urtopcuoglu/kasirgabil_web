// src/app/admin/(panel)/stok/UrunFormu.tsx
"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Calculator, ChevronDown, FileClock, Globe, Loader2, PackagePlus, Save, Trash2 } from "lucide-react";
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
    type UrunMarkasi,
    type UrunModeli,
} from "@/lib/schemas/stok";
import type { RehberKisi } from "@/lib/schemas/rehber";
import { adAnahtari, sayiOku } from "@/lib/schemas/ortak";
import type { MarkaliUrun } from "@/lib/stok";
import { paraYaz } from "@/lib/tarih";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Alan, anaButonSinifi, FormHatasi, inputSinifi } from "../../_components/form";
import AramaliSecici, { type SeciciSecenegi } from "./AramaliSecici";
import KategoriSecici from "./KategoriSecici";
import SiteGorselleri from "./SiteGorselleri";

type Props = {
    kategoriler: UrunKategori[];
    kutular: Pick<Kutu, "id" | "kutu_no" | "marka" | "model">[];
    tedarikciler: Pick<RehberKisi, "id" | "ad_soyad_unvan" | "firma">[];
    markaliUrunler: MarkaliUrun[]; // mükerrer kayıt uyarısı için
    markalar: UrunMarkasi[]; // marka/model açılır listeleri (Stok › Marka & Model)
    modeller: UrunModeli[];
    urun?: Urun; // verilmezse yeni kayıt
    baslangicKutuId?: string; // kutu sayfasından "parça ekle" veya "ürüne geri dön" ile gelindiyse
};

// ─── Taslak ─────────────────────────────────────────────────
// Yeni ürün formu yazdıkça bu tarayıcıda saklanır; sayfadan çıkılsa da (örn. yeni kutu açmaya gidilince)
// geri gelindiğinde kaldığı yerden devam eder. Ürün kaydedilince veya "Taslağı sil" ile silinir.
const TASLAK_ANAHTARI = "kasirga:stok:yeni-urun-taslagi";
type Taslak = { degerler: Partial<UrunGirdisi>; zaman: number };

function taslakOku(): Taslak | null {
    try {
        const ham = localStorage.getItem(TASLAK_ANAHTARI);
        const t = ham ? (JSON.parse(ham) as Taslak) : null;
        return t && typeof t.zaman === "number" && t.degerler && typeof t.degerler === "object" ? t : null;
    } catch {
        return null;
    }
}

function taslakYaz(degerler: Partial<UrunGirdisi>): number | null {
    try {
        const zaman = Date.now();
        localStorage.setItem(TASLAK_ANAHTARI, JSON.stringify({ degerler, zaman } satisfies Taslak));
        return zaman;
    } catch {
        return null; // gizli sekme / dolu depolama: taslak tutulamaz, form çalışmaya devam eder
    }
}

function taslakSil() {
    try {
        localStorage.removeItem(TASLAK_ANAHTARI);
    } catch {
        // depolamaya erişilemiyorsa silinecek taslak da yoktur
    }
}

const saatYaz = (zaman: number) => new Date(zaman).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

// Aynı adın farklı yazımları (Lenovo / LENOVO) tek seçenek olur; ilk görülen yazım gösterilir.
function benzersizAdlar(adlar: (string | null | undefined)[]): SeciciSecenegi[] {
    const harita = new Map<string, string>();
    for (const a of adlar) {
        const ad = a?.trim().replace(/\s+/g, " ");
        if (ad && !harita.has(adAnahtari(ad))) harita.set(adAnahtari(ad), ad);
    }
    return [...harita.values()].toSorted((x, y) => x.localeCompare(y, "tr")).map((ad) => ({ deger: ad, etiket: ad }));
}

// Sayı → form metni ("1250.5" → "1250,5"); boşsa "".
const metin = (v: number | null | undefined) => (v == null ? "" : String(v).replace(".", ","));
const yuvarla = (v: number) => String(Math.round(v * 100) / 100).replace(".", ",");

export default function UrunFormu({ kategoriler, kutular, tedarikciler, markaliUrunler, markalar, modeller, urun, baslangicKutuId }: Props) {
    const router = useRouter();
    const [sunucuHatasi, setSunucuHatasi] = useState<string>();
    // Yalnızca yeni kayıtta: geri yüklenen / son kaydedilen taslağın zamanı.
    const [taslak, setTaslak] = useState<{ zaman: number; geriYuklendi: boolean } | null>(null);
    const taslakHazir = useRef(false);
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

    const varsayilanlar: UrunGirdisi = {
            kategori_id: urun?.kategori_id ?? varsayilanKategori,
            kutu_id: urun?.kutu_id ?? baslangicKutuId ?? "",
            stok_kodu: urun?.stok_kodu ?? "",
            ad: urun?.ad ?? "",
            marka: urun?.marka ?? baslangicKutusu?.marka ?? "",
            model: urun?.model ?? baslangicKutusu?.model ?? "",
            durum: urun?.durum ?? (baslangicKutuId ? "ikinci_el" : "sifir"),
            seri_no: urun?.seri_no ?? "",
            barkod: urun?.barkod ?? "",
            tedarikci_id: urun?.tedarikci_id ?? "",
            aciklama: urun?.aciklama ?? "",
            stok_adedi: urun ? "" : "1",
            min_stok: metin(urun?.min_stok),
            satis_fiyati: metin(urun?.satis_fiyati),
            alis_fiyati: metin(urun?.alis_fiyati),
            kdv_orani: urun?.kdv_orani ? String(urun.kdv_orani) : "",
            komisyon_orani: metin(urun?.komisyon_orani),
            komisyon_tutari: metin(urun?.komisyon_tutari),
            kargo_desi: metin(urun?.kargo_desi),
            kargo_ucreti: metin(urun?.kargo_ucreti),
            sitede: urun?.sitede ?? false,
            site_ad: urun?.site_ad ?? "",
            site_aciklama: urun?.site_aciklama ?? "",
            site_kategori_id: urun?.site_kategori_id ?? "",
            site_gorseller: urun?.site_gorseller ?? [],
    };

    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        reset,
        watch,
        control,
        formState: { errors },
    } = useForm<UrunGirdisi>({
        resolver: zodResolver(urunSemasi),
        defaultValues: varsayilanlar,
    });

    // Açılışta taslak varsa geri yüklenir. Kutu sayfasından dönülürse (?kutu=) o kutu seçilir.
    useEffect(() => {
        if (urun) return;
        const kayit = taslakOku();
        if (kayit) {
            const v: UrunGirdisi = { ...varsayilanlar, ...kayit.degerler };
            if (baslangicKutusu) {
                v.kutu_id = baslangicKutusu.id;
                if (!v.kategori_id || !agac.kutulu(v.kategori_id)) v.kategori_id = varsayilanKategori;
                if (!v.marka) v.marka = baslangicKutusu.marka;
                if (!v.model) v.model = baslangicKutusu.model;
            }
            // Taslaktaki kutu bu arada silinmişse seçim boşaltılır.
            if (v.kutu_id && !kutular.some((k) => k.id === v.kutu_id)) v.kutu_id = "";
            reset(v);
            setTaslak({ zaman: kayit.zaman, geriYuklendi: true });
        }
        taslakHazir.current = true;
        // Yalnızca ilk açılışta çalışır.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Yazdıkça taslak kaydedilir (yarım saniye bekleyerek).
    useEffect(() => {
        if (urun) return;
        let zamanlayici: ReturnType<typeof setTimeout> | undefined;
        const abonelik = watch((degerler) => {
            if (!taslakHazir.current) return;
            clearTimeout(zamanlayici);
            zamanlayici = setTimeout(() => {
                const zaman = taslakYaz(degerler as Partial<UrunGirdisi>);
                if (zaman) setTaslak((t) => ({ zaman, geriYuklendi: t?.geriYuklendi ?? false }));
            }, 500);
        });
        return () => {
            clearTimeout(zamanlayici);
            abonelik.unsubscribe();
        };
    }, [urun, watch]);

    function taslagiKaydet() {
        const zaman = taslakYaz(getValues());
        if (zaman) setTaslak((t) => ({ zaman, geriYuklendi: t?.geriYuklendi ?? false }));
    }

    function taslagiSil() {
        taslakHazir.current = false;
        reset(varsayilanlar);
        taslakSil();
        setTaslak(null);
        // reset'in tetiklediği izleme bittikten sonra otomatik kayıt yeniden açılır.
        setTimeout(() => {
            taslakHazir.current = true;
        }, 0);
    }

    // Ürün formundan kutu açmaya gidilir; taslak hemen yazılır, kutu açılınca "Ürüne geri dön" ile dönülür.
    function yeniKutuAc() {
        if (urun) {
            window.open("/admin/stok/kutular", "_blank", "noopener");
            return;
        }
        taslagiKaydet();
        router.push("/admin/stok/kutular?donus=urun");
    }

    const [kategoriId, satis, alis, kdv, komOran, komTutar, kargo] = useWatch({
        control,
        name: ["kategori_id", "satis_fiyati", "alis_fiyati", "kdv_orani", "komisyon_orani", "komisyon_tutari", "kargo_ucreti"],
    });
    const [siteyeEkle, siteGorselleri] = useWatch({ control, name: ["sitede", "site_gorseller"] });
    const [kutuId, marka, model] = useWatch({ control, name: ["kutu_id", "marka", "model"] });
    const kutulu = !!kategoriId && agac.kutulu(kategoriId);

    // Seçenekler Marka & Model panelindeki kayıtlardan gelir; model listesi seçili markaya göre daralır.
    // Listede olmayan marka/model formdan eklenebilir; ürün kaydedilince veritabanı onu da listeye ekler.
    const markaSecenekleri = benzersizAdlar(markalar.map((m) => m.ad));
    const markaAnahtari = adAnahtari(marka);
    const seciliMarka = markalar.find((m) => adAnahtari(m.ad) === markaAnahtari);
    const modelSecenekleri = seciliMarka ? benzersizAdlar(modeller.filter((m) => m.marka_id === seciliMarka.id).map((m) => m.ad)) : [];
    const kutuSecenekleri: SeciciSecenegi[] = kutular.map((k) => ({ deger: k.id, etiket: kutuEtiketi(k), arama: `${k.kutu_no} ${k.marka} ${k.model}` }));

    // Aynı marka/model daha önce kaydedildiyse uyarı. Yedek parçada aynı cihazın birçok parçası olur;
    // orada ürün yerine bu marka/model için açılmış başka bir kutu varsa söylenir.
    const modelAnahtari = adAnahtari(model);
    const ayniMarkaModel = !!markaAnahtari && !!modelAnahtari;
    const kayitliAyniUrunler =
        ayniMarkaModel && !kutulu
            ? markaliUrunler.filter((u) => u.id !== urun?.id && adAnahtari(u.marka) === markaAnahtari && adAnahtari(u.model) === modelAnahtari)
            : [];
    const ayniMarkaModelKutusu =
        ayniMarkaModel && kutulu
            ? kutular.find((k) => k.id !== kutuId && adAnahtari(k.marka) === markaAnahtari && adAnahtari(k.model) === modelAnahtari)
            : undefined;

    function markaSecildi(yeni: string) {
        // Marka değişince eski markanın modeli temizlenir.
        if (adAnahtari(yeni) !== markaAnahtari) setValue("model", "", { shouldDirty: true });
        setValue("marka", yeni, { shouldValidate: !!errors.marka, shouldDirty: true });
    }

    // Anahtar açılınca boş site alanları stok bilgileriyle doldurulur; kullanıcı istediği gibi değiştirir.
    function siteyeEkleDegisti(acik: boolean) {
        setValue("sitede", acik);
        if (!acik) return;
        if (!getValues("site_ad")) setValue("site_ad", getValues("ad"));
        if (!getValues("site_aciklama")) setValue("site_aciklama", getValues("aciklama"));
        if (!getValues("site_kategori_id")) setValue("site_kategori_id", getValues("kategori_id"));
    }

    function kategoriSecildi(id: string) {
        setValue("kategori_id", id, { shouldValidate: true });
        // Yeni kayıtta yedek parça kategorisi seçilince durum varsayılan olarak ikinci el olur.
        if (!urun && agac.kutulu(id)) setValue("durum", "ikinci_el");
    }

    function kutuSecildi(id: string) {
        setValue("kutu_id", id, { shouldValidate: !!errors.kutu_id, shouldDirty: true });
        const kutu = kutular.find((k) => k.id === id);
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
            // Başarılı kayıtta sayfa yönlenir; taslak önceden silinir, hata olursa geri yazılır.
            if (!urun) taslakSil();
            const sonuc = await urunKaydet(urun?.id ?? null, veri);
            if (sonuc?.hata) {
                setSunucuHatasi(sonuc.hata);
                if (!urun) taslagiKaydet();
            }
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
            {taslak?.geriYuklendi && (
                <div className="flex flex-wrap items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
                    <FileClock className="size-4 shrink-0" />
                    <span className="min-w-0 flex-1">Kaydedilmemiş taslak geri yüklendi. Kaldığınız yerden devam edebilirsiniz.</span>
                    <Button type="button" variant="ghost" size="sm" onClick={taslagiSil} className="text-blue-900 hover:bg-blue-100">
                        <Trash2 /> Taslağı sil, boş başla
                    </Button>
                </div>
            )}
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
                            <input type="hidden" {...register("kutu_id")} />
                            <AramaliSecici
                                id="kutu_id"
                                secenekler={kutuSecenekleri}
                                deger={kutuId}
                                onSec={kutuSecildi}
                                yerTutucu="— Kutu seçin —"
                                aramaYerTutucu="Kutu no, marka veya model ara..."
                                gecersiz={!!errors.kutu_id}
                                altBilgi={
                                    <button
                                        type="button"
                                        onClick={yeniKutuAc}
                                        className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm font-medium text-[var(--color-secondary)] hover:bg-gray-50"
                                    >
                                        <PackagePlus className="size-4" /> Yeni kutu aç
                                    </button>
                                }
                            />
                            <p className="text-xs text-gray-500">
                                Stok kodu kutu numarasıyla oluşur (örn. 200-0001). Kutu yoksa{" "}
                                <button type="button" onClick={yeniKutuAc} className="underline">
                                    yeni kutu açın
                                </button>
                                {urun ? " (yeni sekmede açılır)." : "; bilgileriniz taslak olarak saklanır, kutuyu açınca ürüne geri dönebilirsiniz."}
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
                        <input type="hidden" {...register("marka")} />
                        <AramaliSecici
                            id="marka"
                            secenekler={markaSecenekleri}
                            deger={marka}
                            onSec={markaSecildi}
                            yerTutucu="— Marka seçin —"
                            aramaYerTutucu="Marka ara veya yeni marka yaz..."
                            ekle={{ etiket: (m) => `“${m}” yeni marka olarak ekle` }}
                            temizlenebilir
                            gecersiz={!!errors.marka}
                        />
                    </Alan>
                    <Alan etiket="Model" htmlFor="model" hata={errors.model?.message}>
                        <input type="hidden" {...register("model")} />
                        <AramaliSecici
                            id="model"
                            secenekler={modelSecenekleri}
                            deger={model}
                            onSec={(m) => setValue("model", m, { shouldValidate: !!errors.model, shouldDirty: true })}
                            yerTutucu={marka ? "— Model seçin —" : "Önce marka seçin"}
                            aramaYerTutucu={`${marka} modeli ara veya yeni model yaz...`}
                            ekle={{ etiket: (m) => `“${m}” modelini ${marka} markasına ekle` }}
                            temizlenebilir
                            pasif={!marka}
                            gecersiz={!!errors.model}
                        />
                    </Alan>
                    {kayitliAyniUrunler.length > 0 && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm sm:col-span-2">
                            <p className="mb-1.5 flex items-start gap-1.5 font-medium text-amber-800">
                                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                                <span>
                                    {marka} {model} ile kayıtlı {kayitliAyniUrunler.length} ürün var. Aynı ürünse yeni kayıt açmak yerine
                                    ürün sayfasından stok girişi yapın:
                                </span>
                            </p>
                            <ul className="space-y-0.5 pl-6">
                                {kayitliAyniUrunler.slice(0, 5).map((u) => (
                                    <li key={u.id}>
                                        <Link href={`/admin/stok/${u.id}`} target="_blank" className="hover:underline">
                                            <span className="font-mono font-semibold">{u.stok_kodu}</span> · {u.ad}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {ayniMarkaModelKutusu && (
                        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 sm:col-span-2">
                            <AlertTriangle className="size-4 shrink-0" />
                            <span className="min-w-0 flex-1">
                                {marka} {model} için zaten kutu var: <strong>{kutuEtiketi(ayniMarkaModelKutusu)}</strong>.
                            </span>
                            <Button type="button" size="sm" variant="outline" onClick={() => kutuSecildi(ayniMarkaModelKutusu.id)}>
                                Bu kutuyu seç
                            </Button>
                        </div>
                    )}
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
                    <Alan etiket="Stok Kodu" htmlFor="stok_kodu" hata={errors.stok_kodu?.message}>
                        <input
                            id="stok_kodu"
                            autoComplete="off"
                            placeholder={kutulu ? "Boş: otomatik (örn. 200-0001)" : "Boş: otomatik (örn. 000123)"}
                            aria-invalid={!!errors.stok_kodu}
                            className={cn(inputSinifi, "font-mono uppercase placeholder:font-sans placeholder:normal-case")}
                            {...register("stok_kodu")}
                        />
                        <p className="text-xs text-gray-500">
                            {urun
                                ? "Değiştirirseniz yeni kod kullanılır; başka üründe kayıtlı kod verilemez."
                                : "Kendi kodunuzu yazabilir veya boş bırakıp otomatik verdirebilirsiniz."}
                        </p>
                    </Alan>
                    <Alan etiket="Seri No" htmlFor="seri_no" hata={errors.seri_no?.message}>
                        <input id="seri_no" autoComplete="off" className={inputSinifi} {...register("seri_no")} />
                    </Alan>
                    <Alan etiket="Barkod / GTIN" htmlFor="barkod" hata={errors.barkod?.message}>
                        <input id="barkod" autoComplete="off" inputMode="numeric" className={inputSinifi} {...register("barkod")} />
                    </Alan>
                    <Alan etiket="Minimum Stok" htmlFor="min_stok" hata={errors.min_stok?.message}>
                        <input id="min_stok" inputMode="numeric" placeholder="Boş: uyarı yok" className={inputSinifi} {...register("min_stok")} />
                        <p className="text-xs text-gray-500">Stok bu sayıya inince özet sayfasında kritik stok uyarısı çıkar.</p>
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

            <fieldset className="space-y-3">
                <legend className="mb-1 font-semibold text-[var(--color-secondary)]">Web Sitesi</legend>
                <label
                    htmlFor="siteye_ekle"
                    className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
                        siteyeEkle ? "border-green-200 bg-green-50" : "hover:bg-gray-50",
                    )}
                >
                    <Switch
                        id="siteye_ekle"
                        checked={siteyeEkle}
                        onCheckedChange={siteyeEkleDegisti}
                        className="mt-0.5 data-[state=checked]:bg-green-600"
                    />
                    <span className="min-w-0 flex-1 text-sm">
                        <span className="flex items-center gap-2 font-medium">
                            <Globe className="size-4 text-[var(--color-secondary)]" /> Siteye ekle
                            {siteyeEkle && (
                                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Yayınlanacak</span>
                            )}
                        </span>
                        <span className="mt-0.5 block text-xs text-gray-500">
                            {siteyeEkle
                                ? "Ürün kaydedildiğinde web sitesindeki ürünler sayfasında yayınlanır. Sitede fiyat gösterilmez; ziyaretçi WhatsApp veya canlı destekle ulaşır."
                                : "Açarsanız ürün web sitesinde yayınlanır. Kapalıyken yalnızca panelde görünür."}
                        </span>
                    </span>
                </label>

                {siteyeEkle && (
                    <div className="grid gap-4 rounded-lg border border-green-200 p-4 sm:grid-cols-2">
                        <Alan etiket="Sitede Görünecek Ad" htmlFor="site_ad" hata={errors.site_ad?.message} zorunlu>
                            <input id="site_ad" aria-invalid={!!errors.site_ad} className={inputSinifi} {...register("site_ad")} />
                        </Alan>
                        <Alan etiket="Site Kategorisi" htmlFor="site_kategori_id" hata={errors.site_kategori_id?.message} zorunlu>
                            <select id="site_kategori_id" aria-invalid={!!errors.site_kategori_id} className={inputSinifi} {...register("site_kategori_id")}>
                                <option value="">— Kategori seçin —</option>
                                {agac.sirali.map((k) => (
                                    <option key={k.id} value={k.id}>
                                        {k.yol}
                                    </option>
                                ))}
                            </select>
                        </Alan>
                        <Alan etiket="Ürün Açıklaması" htmlFor="site_aciklama" hata={errors.site_aciklama?.message} zorunlu className="sm:col-span-2">
                            <textarea
                                id="site_aciklama"
                                rows={5}
                                placeholder="Ürünün özellikleri, durumu, garanti bilgisi... Ziyaretçiler ürün sayfasında görür."
                                aria-invalid={!!errors.site_aciklama}
                                className={inputSinifi}
                                {...register("site_aciklama")}
                            />
                        </Alan>
                        <Alan etiket="Görseller" htmlFor="site_gorseller" hata={errors.site_gorseller?.message} zorunlu className="sm:col-span-2">
                            <SiteGorselleri
                                id="site_gorseller"
                                gorseller={siteGorselleri}
                                onChange={(g) => setValue("site_gorseller", g, { shouldValidate: !!errors.site_gorseller, shouldDirty: true })}
                                gecersiz={!!errors.site_gorseller}
                            />
                        </Alan>
                    </div>
                )}
            </fieldset>

            <FormHatasi mesaj={sunucuHatasi} />

            <div className="flex flex-wrap items-center gap-2">
                <Button type="submit" disabled={bekliyor} className={anaButonSinifi}>
                    {bekliyor ? <Loader2 className="animate-spin" /> : <Save />}
                    {urun ? "Kaydet" : "Stoğa Ekle"}
                </Button>
                {!urun && (
                    <Button type="button" variant="outline" onClick={taslagiKaydet} disabled={bekliyor}>
                        <FileClock /> Taslak Olarak Kaydet
                    </Button>
                )}
                <Button type="button" variant="outline" asChild>
                    <Link href={iptalLinki}>Vazgeç</Link>
                </Button>
                {!urun && taslak && (
                    <span className="text-xs text-gray-500">
                        Taslak {saatYaz(taslak.zaman)} itibarıyla bu tarayıcıda kayıtlı ·{" "}
                        <button type="button" onClick={taslagiSil} className="underline hover:text-[var(--color-primary)]">
                            sil
                        </button>
                    </span>
                )}
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
