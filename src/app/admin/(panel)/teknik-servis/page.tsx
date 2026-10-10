// src/app/admin/(panel)/teknik-servis/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, CalendarPlus, Eye, Laptop, Phone, Plus, Printer, Search, UserCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { dbHataMesaji } from "@/lib/supabase/yetkili";
import { DURUM_KODLARI, kalemToplamlari, SERVIS_DURUMLARI, type ServisKaydi } from "@/lib/schemas/servis";
import type { Personel } from "@/lib/schemas/personel";
import { bugunISO, gunBasi, paraYaz, sonrakiGunBasi, tarihSaatYaz, tarihYaz } from "@/lib/tarih";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { anaButonSinifi, FormHatasi, inputSinifi, SayfaBasligi } from "../../_components/form";
import {
    aramaDeseni,
    FiltreOzeti,
    FiltreSecimi,
    FiltreTarihi,
    GorunumSecici,
    gorunumOku,
    linkOlustur,
    secenekOku,
    tarihMi,
    uuidMi,
} from "../../_components/liste";
import OtomatikFiltreFormu from "../../_components/OtomatikFiltreFormu";
import DurumRozeti from "./DurumRozeti";

export const metadata: Metadata = {
    title: "Teknik Servis",
};

type Props = {
    searchParams: Promise<{
        q?: string;
        durum?: string;
        personel?: string;
        baslangic?: string;
        bitis?: string;
        sirala?: string;
        gorunum?: string;
    }>;
};

type ServisSatiri = ServisKaydi & {
    personel: Pick<Personel, "ad_soyad"> | null;
    servis_kalemleri: { tip: "iscilik" | "malzeme"; tutar: number }[];
};

const LIMIT = 200;
// "acik" = teslim edilmemiş tüm kayıtlar (varsayılan değil, ama en sık kullanılan filtre).
const DURUM_FILTRELERI = ["", "acik", ...DURUM_KODLARI] as const;
const SIRALAMALAR = {
    yeni: { etiket: "En yeni kayıt", sutun: "giris_tarihi", artan: false },
    eski: { etiket: "En eski kayıt", sutun: "giris_tarihi", artan: true },
    tahmini: { etiket: "Tahmini teslim (yakın)", sutun: "tahmini_teslim_tarihi", artan: true },
} as const;
type Siralama = keyof typeof SIRALAMALAR;




// Teslim edilmemiş ve tahmini tarihi geçmiş kayıtlar vurgulanır.
function gecikmisMi(k: ServisKaydi, bugun: string) {
    return k.durum !== "teslim_edildi" && !!k.tahmini_teslim_tarihi && k.tahmini_teslim_tarihi < bugun;
}

export default async function TeknikServisSayfasi({ searchParams }: Props) {
    const p = await searchParams;
    const q = (p.q ?? "").trim();
    const durum = secenekOku(p.durum, DURUM_FILTRELERI, "");
    const personel = uuidMi(p.personel) ? p.personel : undefined;
    const baslangic = tarihMi(p.baslangic) ? p.baslangic : undefined;
    const bitis = tarihMi(p.bitis) ? p.bitis : undefined;
    const sirala = secenekOku(p.sirala, Object.keys(SIRALAMALAR) as Siralama[], "yeni");
    const gorunum = gorunumOku(p.gorunum);

    const filtreler = {
        q: q || undefined,
        durum: durum || undefined,
        personel,
        baslangic,
        bitis,
        sirala: sirala === "yeni" ? undefined : sirala,
    };
    const aktifFiltre = Object.values(filtreler).filter(Boolean).length;

    const supabase = await createClient();
    const { sutun, artan } = SIRALAMALAR[sirala];

    let sorgu = supabase
        .from("teknik_servis_kayitlari")
        .select("*, personel(ad_soyad), servis_kalemleri(tip, tutar)")
        .order(sutun, { ascending: artan, nullsFirst: false })
        .limit(LIMIT);

    if (q) sorgu = sorgu.ilike("arama", aramaDeseni(q));
    if (durum === "acik") sorgu = sorgu.neq("durum", "teslim_edildi");
    else if (durum) sorgu = sorgu.eq("durum", durum);
    if (personel) sorgu = sorgu.eq("teslim_alan_personel_id", personel);
    if (baslangic) sorgu = sorgu.gte("giris_tarihi", gunBasi(baslangic));
    if (bitis) sorgu = sorgu.lt("giris_tarihi", sonrakiGunBasi(bitis));

    const [kayitlarSonucu, personelSonucu] = await Promise.all([
        sorgu,
        supabase.from("personel").select("id, ad_soyad").order("ad_soyad"),
    ]);

    const kayitlar = (kayitlarSonucu.data ?? []) as ServisSatiri[];
    const personeller = (personelSonucu.data ?? []) as Pick<Personel, "id" | "ad_soyad">[];
    const hata = kayitlarSonucu.error ?? personelSonucu.error;
    const bugun = bugunISO();

    return (
        <div>
            <SayfaBasligi baslik="Teknik Servis" aciklama="Servis kayıtları, durum takibi ve ücretlendirme.">
                <Button asChild className={anaButonSinifi}>
                    <Link href="/admin/teknik-servis/yeni">
                        <Plus /> Yeni Servis Kaydı
                    </Link>
                </Button>
            </SayfaBasligi>

            <OtomatikFiltreFormu
                action="/admin/teknik-servis"
                className="mb-3 grid gap-3 rounded-xl border bg-white p-3 shadow-sm sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[minmax(0,2fr)_repeat(5,minmax(0,1fr))_auto]"
            >
                {gorunum === "kart" && <input type="hidden" name="gorunum" value="kart" />}
                <label className="flex min-w-0 flex-col gap-1 text-xs font-medium text-gray-500 sm:col-span-2 lg:col-span-3 xl:col-span-1">
                    Ara
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                            <input
                                name="q"
                                type="search"
                                defaultValue={q}
                                placeholder="Form no, müşteri, telefon, cihaz, seri no..."
                                className={cn(inputSinifi, "py-1.5 pl-9")}
                            />
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
                        { deger: "acik", etiket: "Açık (teslim edilmemiş)" },
                        ...DURUM_KODLARI.map((d) => ({ deger: d, etiket: SERVIS_DURUMLARI[d].etiket })),
                    ]}
                />
                <FiltreSecimi
                    etiket="Teslim Alan"
                    name="personel"
                    deger={personel ?? ""}
                    secenekler={[{ deger: "", etiket: "Tümü" }, ...personeller.map((x) => ({ deger: x.id, etiket: x.ad_soyad }))]}
                />
                <FiltreTarihi etiket="Giriş (başlangıç)" name="baslangic" deger={baslangic} />
                <FiltreTarihi etiket="Giriş (bitiş)" name="bitis" deger={bitis} />
                <FiltreSecimi
                    etiket="Sıralama"
                    name="sirala"
                    deger={sirala}
                    secenekler={Object.entries(SIRALAMALAR).map(([deger, { etiket }]) => ({ deger, etiket }))}
                />
                <div className="flex items-end">
                    <GorunumSecici
                        aktif={gorunum}
                        link={(g) => linkOlustur("/admin/teknik-servis", { ...filtreler, gorunum: g === "kart" ? "kart" : undefined })}
                    />
                </div>
            </OtomatikFiltreFormu>

            <FiltreOzeti
                sonucSayisi={kayitlar.length}
                aktifFiltre={aktifFiltre}
                temizleLinki={linkOlustur("/admin/teknik-servis", { gorunum: gorunum === "kart" ? "kart" : undefined })}
            />

            {hata && <FormHatasi mesaj={dbHataMesaji(hata)} />}

            {!hata && kayitlar.length === 0 && (
                <div className="rounded-xl border border-dashed bg-white p-10 text-center text-sm text-gray-500">
                    {aktifFiltre > 0 ? "Filtrelere uygun servis kaydı bulunamadı." : "Henüz servis kaydı açılmamış."}
                </div>
            )}

            {kayitlar.length > 0 &&
                (gorunum === "kart" ? (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {kayitlar.map((k) => (
                            <ServisKarti key={k.id} kayit={k} gecikmis={gecikmisMi(k, bugun)} />
                        ))}
                    </div>
                ) : (
                    <ServisTablosu kayitlar={kayitlar} bugun={bugun} />
                ))}

            {kayitlar.length === LIMIT && (
                <p className="mt-4 text-center text-xs text-gray-500">
                    İlk {LIMIT} kayıt gösteriliyor. Daha fazlası için filtreleri daraltın.
                </p>
            )}
        </div>
    );
}

function TahminiTeslim({ kayit, gecikmis }: { kayit: ServisKaydi; gecikmis: boolean }) {
    if (!kayit.tahmini_teslim_tarihi) return <span className="text-gray-400">—</span>;
    return (
        <span className={cn(gecikmis && "font-semibold text-[var(--color-primary)]")} title={gecikmis ? "Tahmini teslim tarihi geçti" : undefined}>
            {tarihYaz(kayit.tahmini_teslim_tarihi)}
            {gecikmis && " (gecikti)"}
        </span>
    );
}

// ─── Liste (tablo) görünümü ─────────────────────────────────

function ServisTablosu({ kayitlar, bugun }: { kayitlar: ServisSatiri[]; bugun: string }) {
    return (
        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
            <table className="w-full text-left text-sm">
                <thead className="border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                        <th className="px-4 py-3 font-medium">Form No</th>
                        <th className="px-4 py-3 font-medium">Müşteri</th>
                        <th className="px-4 py-3 font-medium">Cihaz</th>
                        <th className="px-4 py-3 font-medium">Durum</th>
                        <th className="px-4 py-3 font-medium">Teslim Alan</th>
                        <th className="px-4 py-3 font-medium">Giriş</th>
                        <th className="px-4 py-3 font-medium">Tahmini Teslim</th>
                        <th className="px-4 py-3 text-right font-medium">Tutar</th>
                        <th className="px-4 py-3" />
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {kayitlar.map((k) => (
                        <tr key={k.id} className="hover:bg-gray-50">
                            <td className="whitespace-nowrap px-4 py-3 font-semibold text-[var(--color-secondary)]">{k.form_no}</td>
                            <td className="px-4 py-3">
                                <p className="font-medium">{k.musteri_ad_soyad}</p>
                                <a href={`tel:${k.musteri_telefon}`} className="text-xs text-gray-500 hover:underline">
                                    {k.musteri_telefon}
                                </a>
                            </td>
                            <td className="max-w-[220px] px-4 py-3">
                                <p className="truncate" title={k.cihaz_marka_model}>
                                    {k.cihaz_marka_model}
                                </p>
                                <p className="truncate text-xs text-gray-500" title={k.sikayet}>
                                    {k.sikayet}
                                </p>
                            </td>
                            <td className="px-4 py-3">
                                <DurumRozeti durum={k.durum} />
                            </td>
                            <td className="whitespace-nowrap px-4 py-3">{k.personel?.ad_soyad ?? "—"}</td>
                            <td className="whitespace-nowrap px-4 py-3">{tarihSaatYaz(k.giris_tarihi)}</td>
                            <td className="whitespace-nowrap px-4 py-3">
                                <TahminiTeslim kayit={k} gecikmis={gecikmisMi(k, bugun)} />
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-right font-medium">
                                {k.servis_kalemleri.length > 0 ? paraYaz(kalemToplamlari(k.servis_kalemleri).genel) : <span className="text-gray-400">—</span>}
                            </td>
                            <td className="px-4 py-3">
                                <SatirIslemleri id={k.id} formNo={k.form_no} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ─── Kart görünümü ──────────────────────────────────────────

function ServisKarti({ kayit: k, gecikmis }: { kayit: ServisSatiri; gecikmis: boolean }) {
    return (
        <div className={cn("flex flex-col rounded-xl border bg-white p-4 shadow-sm", gecikmis && "border-[var(--color-primary)]/40")}>
            <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">Form No</p>
                    <p className="text-lg font-bold text-[var(--color-secondary)]">{k.form_no}</p>
                </div>
                <DurumRozeti durum={k.durum} />
            </div>

            <div className="flex-1 space-y-1.5 text-sm text-gray-700">
                <p className="font-semibold text-gray-900">{k.musteri_ad_soyad}</p>
                <p className="flex items-center gap-2">
                    <Phone className="size-3.5 shrink-0 text-gray-400" />
                    <a href={`tel:${k.musteri_telefon}`} className="hover:underline">
                        {k.musteri_telefon}
                    </a>
                </p>
                <p className="flex items-center gap-2">
                    <Laptop className="size-3.5 shrink-0 text-gray-400" />
                    <span className="truncate">{k.cihaz_marka_model}</span>
                </p>
                <p className="line-clamp-2 text-xs text-gray-500">{k.sikayet}</p>
            </div>

            <div className="mt-3 space-y-1 border-t pt-3 text-xs text-gray-500">
                <p className="flex items-center gap-1.5" title="Giriş">
                    <CalendarPlus className="size-3.5" /> {tarihSaatYaz(k.giris_tarihi)}
                </p>
                <p className="flex items-center gap-1.5" title="Tahmini teslim">
                    <CalendarClock className="size-3.5" /> <TahminiTeslim kayit={k} gecikmis={gecikmis} />
                </p>
                <p className="flex items-center gap-1.5" title="Teslim alan">
                    <UserCheck className="size-3.5" /> {k.personel?.ad_soyad ?? "—"}
                </p>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2 border-t pt-3">
                <span className="text-sm font-semibold">
                    {k.servis_kalemleri.length > 0 ? paraYaz(kalemToplamlari(k.servis_kalemleri).genel) : ""}
                </span>
                <SatirIslemleri id={k.id} formNo={k.form_no} />
            </div>
        </div>
    );
}

// Satır/kart sonundaki ikon butonlar: detay ve servis formunu yazdır.
function SatirIslemleri({ id, formNo }: { id: string; formNo: string }) {
    return (
        <div className="flex justify-end gap-1">
            <Button variant="outline" size="icon" asChild title="Detay">
                <Link href={`/admin/teknik-servis/${id}`} aria-label={`#${formNo} detay`}>
                    <Eye />
                </Link>
            </Button>
            <Button variant="outline" size="icon" asChild title="Servis formunu yazdır">
                <Link href={`/admin/teknik-servis/${id}/yazdir`} aria-label={`#${formNo} servis formunu yazdır`}>
                    <Printer />
                </Link>
            </Button>
        </div>
    );
}
