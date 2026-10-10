// src/app/admin/(panel)/teknik-servis/[id]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, Printer, Wallet } from "lucide-react";
import { servisSil } from "@/actions/servis";
import { servisKalani } from "@/lib/kasa";
import { createClient } from "@/lib/supabase/server";
import { ODEME_YONTEMLERI, type KasaHareketi } from "@/lib/schemas/kasa";
import { SERVIS_DURUMLARI, type DurumGecmisi, type ServisKalemi, type ServisKaydi } from "@/lib/schemas/servis";
import type { Personel } from "@/lib/schemas/personel";
import { paraYaz, tarihSaatYaz, tarihYaz } from "@/lib/tarih";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { anaButonSinifi, SayfaBasligi } from "../../../_components/form";
import SilButonu from "../../../_components/SilButonu";
import DurumRozeti from "../DurumRozeti";
import DurumPaneli from "./DurumPaneli";
import KalemTablosu from "./KalemTablosu";

export const metadata: Metadata = {
    title: "Servis Kaydı",
};

type Detay = ServisKaydi & {
    personel: Pick<Personel, "ad_soyad"> | null;
    cihaz: { servisler: Pick<ServisKaydi, "id" | "form_no" | "giris_tarihi" | "durum">[] } | null;
    servis_durum_gecmisi: DurumGecmisi[];
    servis_kalemleri: ServisKalemi[];
    kasa_hareketleri: Pick<KasaHareketi, "id" | "tarih" | "tip" | "yontem" | "tutar">[];
};

export default async function ServisDetaySayfasi({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data } = await supabase
        .from("teknik_servis_kayitlari")
        .select(
            "*, personel(ad_soyad), cihaz:cihazlar(servisler:teknik_servis_kayitlari(id, form_no, giris_tarihi, durum)), servis_durum_gecmisi(id, durum, aciklama, created_at), servis_kalemleri(*), kasa_hareketleri(id, tarih, tip, yontem, tutar)"
        )
        .eq("id", id)
        .order("created_at", { referencedTable: "servis_durum_gecmisi", ascending: false })
        .order("created_at", { referencedTable: "servis_kalemleri", ascending: true })
        .maybeSingle();

    if (!data) notFound();
    const k = data as Detay;
    const digerServisler = (k.cihaz?.servisler ?? [])
        .filter((s) => s.id !== k.id)
        .toSorted((a, b) => b.giris_tarihi.localeCompare(a.giris_tarihi));

    return (
        <div>
            <SayfaBasligi baslik={`Servis #${k.form_no}`} aciklama={`${k.musteri_ad_soyad} · ${k.cihaz_marka_model}`}>
                <Button variant="outline" asChild>
                    <Link href="/admin/teknik-servis">
                        <ArrowLeft /> Teknik Servis
                    </Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href={`/admin/teknik-servis/${k.id}/duzenle`}>
                        <Pencil /> Düzenle
                    </Link>
                </Button>
                <Button asChild className={anaButonSinifi}>
                    <Link href={`/admin/teknik-servis/${k.id}/yazdir`}>
                        <Printer /> Yazdır
                    </Link>
                </Button>
                <SilButonu
                    onay={`#${k.form_no} numaralı servis kaydı; durum geçmişi ve ücret kalemleriyle birlikte silinsin mi? Bu işlem geri alınamaz.`}
                    sil={servisSil.bind(null, k.id)}
                    etiket="Sil"
                />
            </SayfaBasligi>

            <div className="grid gap-4 lg:grid-cols-3">
                {/* Sol: kayıt bilgileri */}
                <div className="space-y-4 lg:col-span-2">
                    <div className="grid gap-4 md:grid-cols-2">
                        <BilgiKarti baslik="Müşteri">
                            <Satir
                                etiket="Ad Soyad"
                                deger={
                                    <Link href={`/admin/rehber/${k.musteri_id}`} className="hover:underline">
                                        {k.musteri_ad_soyad}
                                    </Link>
                                }
                            />
                            <Satir
                                etiket="Telefon"
                                deger={
                                    <a href={`tel:${k.musteri_telefon}`} className="hover:underline">
                                        {k.musteri_telefon}
                                    </a>
                                }
                            />
                        </BilgiKarti>
                        <BilgiKarti baslik="Cihaz">
                            <Satir etiket="Marka / Model" deger={k.cihaz_marka_model} />
                            <Satir etiket="Seri No" deger={k.seri_no} />
                            {digerServisler.length > 0 && (
                                <div className="mt-3 border-t pt-3">
                                    <p className="mb-1.5 text-xs font-semibold uppercase text-gray-500">Bu cihazın diğer servisleri</p>
                                    <ul className="space-y-1">
                                        {digerServisler.map((s) => (
                                            <li key={s.id} className="flex items-center justify-between gap-2 text-sm">
                                                <Link href={`/admin/teknik-servis/${s.id}`} className="hover:underline">
                                                    #{s.form_no} · {tarihSaatYaz(s.giris_tarihi)}
                                                </Link>
                                                <DurumRozeti durum={s.durum} />
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </BilgiKarti>
                    </div>

                    <BilgiKarti baslik="Şikayet / Arıza">
                        <p className="whitespace-pre-line text-sm">{k.sikayet}</p>
                        {k.notlar && (
                            <div className="mt-3 rounded-md bg-amber-50 p-3 text-sm">
                                <p className="mb-1 text-xs font-semibold uppercase text-amber-700">İç Not</p>
                                <p className="whitespace-pre-line text-amber-900">{k.notlar}</p>
                            </div>
                        )}
                    </BilgiKarti>

                    <BilgiKarti baslik="Ücret Kalemleri">
                        <KalemTablosu servisId={k.id} kalemler={k.servis_kalemleri} />
                    </BilgiKarti>

                    <BilgiKarti baslik="Ödemeler">
                        <OdemeOzeti servis={k} />
                    </BilgiKarti>
                </div>

                {/* Sağ: durum ve tarih bilgileri */}
                <div className="space-y-4">
                    <BilgiKarti baslik="Durum">
                        <div className="mb-4">
                            <DurumRozeti durum={k.durum} buyuk />
                        </div>
                        <DurumPaneli servisId={k.id} mevcutDurum={k.durum} />
                    </BilgiKarti>

                    <BilgiKarti baslik="Tarihler">
                        <Satir etiket="Giriş" deger={tarihSaatYaz(k.giris_tarihi)} />
                        <Satir etiket="Tahmini Teslim" deger={k.tahmini_teslim_tarihi ? tarihYaz(k.tahmini_teslim_tarihi) : null} />
                        <Satir etiket="Teslim Edildi" deger={k.teslim_tarihi ? tarihSaatYaz(k.teslim_tarihi) : null} />
                        <Satir etiket="Teslim Alan" deger={k.personel?.ad_soyad ?? null} />
                    </BilgiKarti>

                    <BilgiKarti baslik="Durum Geçmişi">
                        <ol className="relative space-y-4 border-l border-gray-200 pl-4">
                            {k.servis_durum_gecmisi.map((g, i) => (
                                <li key={g.id} className="relative">
                                    <span
                                        className={cn(
                                            "absolute -left-[21px] top-1 size-2.5 rounded-full ring-4 ring-white",
                                            SERVIS_DURUMLARI[g.durum].nokta
                                        )}
                                    />
                                    <p className={cn("text-sm font-medium", i > 0 && "text-gray-600")}>
                                        {SERVIS_DURUMLARI[g.durum].etiket}
                                    </p>
                                    <p className="text-xs text-gray-400">{tarihSaatYaz(g.created_at)}</p>
                                    {g.aciklama && <p className="mt-1 whitespace-pre-line text-xs text-gray-600">{g.aciklama}</p>}
                                </li>
                            ))}
                        </ol>
                    </BilgiKarti>
                </div>
            </div>
        </div>
    );
}

// Ücret kalemleri toplamı, kasaya girilen tahsilatlar ve kalan tutar.
function OdemeOzeti({ servis }: { servis: Detay }) {
    const { toplam, odenen, kalan } = servisKalani(servis);
    const odemeler = servis.kasa_hareketleri.toSorted((a, b) => a.tarih.localeCompare(b.tarih));

    return (
        <div className="space-y-3">
            <dl className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-md bg-gray-50 p-2">
                    <dt className="text-xs text-gray-500">Toplam</dt>
                    <dd className="font-semibold tabular-nums">{paraYaz(toplam)}</dd>
                </div>
                <div className="rounded-md bg-gray-50 p-2">
                    <dt className="text-xs text-gray-500">Ödenen</dt>
                    <dd className="font-semibold tabular-nums text-green-700">{paraYaz(odenen)}</dd>
                </div>
                <div className="rounded-md bg-gray-50 p-2">
                    <dt className="text-xs text-gray-500">Kalan</dt>
                    <dd className={cn("font-semibold tabular-nums", kalan > 0 && "text-[var(--color-primary)]")}>{paraYaz(kalan)}</dd>
                </div>
            </dl>
            {odemeler.length > 0 && (
                <ul className="divide-y text-sm">
                    {odemeler.map((o) => (
                        <li key={o.id} className="flex justify-between gap-2 py-1.5">
                            <Link href={`/admin/kasa?tarih=${o.tarih}`} className="text-gray-600 hover:underline">
                                {tarihYaz(o.tarih)} · {ODEME_YONTEMLERI[o.yontem]}
                                {o.tip === "gider" && " · İade"}
                            </Link>
                            <span className={cn("tabular-nums", o.tip === "gider" && "text-[var(--color-primary)]")}>
                                {o.tip === "gider" ? "−" : ""}
                                {paraYaz(Number(o.tutar))}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
            <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/kasa?servis=${servis.id}`}>
                    <Wallet /> Tahsilat Gir
                </Link>
            </Button>
        </div>
    );
}

function BilgiKarti({ baslik, children }: { baslik: string; children: React.ReactNode }) {
    return (
        <section className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-semibold text-[var(--color-secondary)]">{baslik}</h2>
            {children}
        </section>
    );
}

function Satir({ etiket, deger }: { etiket: string; deger: React.ReactNode }) {
    if (!deger) return null;
    return (
        <div className="grid grid-cols-[110px_1fr] gap-2 py-0.5 text-sm">
            <span className="text-gray-500">{etiket}</span>
            <span className="whitespace-pre-line">{deger}</span>
        </div>
    );
}
