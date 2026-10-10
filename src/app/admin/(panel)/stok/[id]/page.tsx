// src/app/admin/(panel)/stok/[id]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { urunSil } from "@/actions/stok";
import { createClient } from "@/lib/supabase/server";
import {
    HAREKET_TIPLERI,
    kategoriAgaci,
    kutuEtiketi,
    maliyetHesapla,
    type Kutu,
    type StokHareketi,
    type Urun,
    type UrunKategori,
} from "@/lib/schemas/stok";
import type { RehberKisi } from "@/lib/schemas/rehber";
import { paraYaz, tarihSaatYaz } from "@/lib/tarih";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SayfaBasligi } from "../../../_components/form";
import SilButonu from "../../../_components/SilButonu";
import { MaliyetOzeti } from "../UrunFormu";
import { DurumRozeti, StokAdedi } from "../UrunRozetleri";
import StokPaneli from "./StokPaneli";

export const metadata: Metadata = {
    title: "Ürün",
};

type Detay = Urun & {
    kutular: Pick<Kutu, "id" | "kutu_no" | "marka" | "model"> | null;
    tedarikci: Pick<RehberKisi, "id" | "ad_soyad_unvan"> | null;
    stok_hareketleri: StokHareketi[];
};

// Postgres numeric değerleri JSON'da metin olarak gelebilir.
const sayi = (v: number | string | null) => (v == null ? null : Number(v));

export default async function UrunDetaySayfasi({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const [{ data }, { data: kategoriData }] = await Promise.all([
        supabase
            .from("urunler")
            .select(
                "*, kutular(id, kutu_no, marka, model), tedarikci:rehber_kisiler(id, ad_soyad_unvan), stok_hareketleri(id, tip, miktar, aciklama, created_at)"
            )
            .eq("id", id)
            .order("created_at", { referencedTable: "stok_hareketleri", ascending: false })
            .maybeSingle(),
        supabase.from("urun_kategorileri").select("id, ad, ust_id, kutu_sistemi"),
    ]);

    if (!data) notFound();
    const u = data as Detay;
    const agac = kategoriAgaci((kategoriData ?? []) as UrunKategori[]);
    const satis = sayi(u.satis_fiyati);
    const maliyetGirilmis =
        !!u.kdv_orani || u.komisyon_orani != null || u.komisyon_tutari != null || u.kargo_ucreti != null;
    const hesap = maliyetHesapla({
        satis,
        alis: sayi(u.alis_fiyati),
        kdvOrani: u.kdv_orani,
        komisyonOrani: sayi(u.komisyon_orani),
        komisyonTutari: sayi(u.komisyon_tutari),
        kargo: sayi(u.kargo_ucreti),
    });

    const birlestir = (...parcalar: (string | false | null)[]) => parcalar.filter(Boolean).join(" · ");

    return (
        <div>
            <SayfaBasligi baslik={u.ad} aciklama={`Stok kodu: ${u.stok_kodu}`}>
                <Button variant="outline" asChild>
                    <Link href="/admin/stok">
                        <ArrowLeft /> Stok
                    </Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href={`/admin/stok/${u.id}/duzenle`}>
                        <Pencil /> Düzenle
                    </Link>
                </Button>
                <SilButonu
                    onay={`${u.stok_kodu} - "${u.ad}" stok hareketleriyle birlikte silinsin mi? Bu işlem geri alınamaz.`}
                    sil={urunSil.bind(null, u.id)}
                    etiket="Sil"
                />
            </SayfaBasligi>

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                    <BilgiKarti baslik="Ürün Bilgileri">
                        <Satir etiket="Stok Kodu" deger={<span className="font-mono font-semibold">{u.stok_kodu}</span>} />
                        <Satir etiket="Kategori" deger={agac.yol(u.kategori_id)} />
                        <Satir
                            etiket="Kutu"
                            deger={
                                u.kutular && (
                                    <Link href={`/admin/stok/kutular/${u.kutular.id}`} className="hover:underline">
                                        {kutuEtiketi(u.kutular)}
                                    </Link>
                                )
                            }
                        />
                        <Satir etiket="Marka / Model" deger={birlestir(u.marka, u.model)} />
                        <Satir etiket="Durum" deger={<DurumRozeti durum={u.durum} />} />
                        <Satir etiket="Seri No" deger={u.seri_no} />
                        <Satir etiket="Barkod / GTIN" deger={u.barkod} />
                        <Satir
                            etiket="Tedarikçi"
                            deger={
                                u.tedarikci && (
                                    <Link href={`/admin/rehber/${u.tedarikci.id}`} className="hover:underline">
                                        {u.tedarikci.ad_soyad_unvan}
                                    </Link>
                                )
                            }
                        />
                        <Satir etiket="Açıklama" deger={u.aciklama} />
                    </BilgiKarti>

                    <BilgiKarti baslik="Fiyat">
                        <Satir etiket="Satış Fiyatı" deger={satis != null ? paraYaz(satis) : null} />
                        <Satir etiket="Alış Fiyatı" deger={u.alis_fiyati != null ? paraYaz(Number(u.alis_fiyati)) : null} />
                        <Satir etiket="KDV" deger={u.kdv_orani ? `%${u.kdv_orani}` : null} />
                        <Satir
                            etiket="Komisyon"
                            deger={birlestir(
                                u.komisyon_orani != null && `%${Number(u.komisyon_orani)}`,
                                u.komisyon_tutari != null && paraYaz(Number(u.komisyon_tutari))
                            )}
                        />
                        <Satir
                            etiket="Kargo"
                            deger={birlestir(
                                u.kargo_desi != null && `${Number(u.kargo_desi)} desi`,
                                u.kargo_ucreti != null && paraYaz(Number(u.kargo_ucreti))
                            )}
                        />
                        {satis == null && u.alis_fiyati == null && <p className="text-sm text-gray-500">Fiyat girilmemiş.</p>}
                        {satis != null && maliyetGirilmis && (
                            <div className="mt-3">
                                <MaliyetOzeti satis={satis} hesap={hesap} />
                            </div>
                        )}
                    </BilgiKarti>
                </div>

                <div className="space-y-4">
                    <BilgiKarti baslik="Stok">
                        <p className="mb-4 text-3xl">
                            <StokAdedi adet={u.stok_adedi} />
                            {u.stok_adedi > 0 && <span className="ml-1 text-sm text-gray-500">adet</span>}
                        </p>
                        <StokPaneli urunId={u.id} stokAdedi={u.stok_adedi} />
                    </BilgiKarti>

                    <BilgiKarti baslik="Stok Hareketleri">
                        {u.stok_hareketleri.length === 0 ? (
                            <p className="text-sm text-gray-500">Henüz hareket yok.</p>
                        ) : (
                            <ul className="divide-y text-sm">
                                {u.stok_hareketleri.map((h) => (
                                    <li key={h.id} className="flex items-start justify-between gap-3 py-2">
                                        <div className="min-w-0">
                                            <p className="font-medium">{HAREKET_TIPLERI[h.tip]}</p>
                                            {h.aciklama && <p className="text-xs text-gray-600">{h.aciklama}</p>}
                                            <p className="text-xs text-gray-400">{tarihSaatYaz(h.created_at)}</p>
                                        </div>
                                        <span
                                            className={cn(
                                                "shrink-0 font-semibold tabular-nums",
                                                h.miktar > 0 ? "text-green-700" : "text-[var(--color-primary)]"
                                            )}
                                        >
                                            {h.miktar > 0 ? `+${h.miktar}` : h.miktar}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </BilgiKarti>
                </div>
            </div>
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
        <div className="grid grid-cols-[120px_1fr] gap-2 py-0.5 text-sm">
            <span className="text-gray-500">{etiket}</span>
            <span className="whitespace-pre-line">{deger}</span>
        </div>
    );
}
