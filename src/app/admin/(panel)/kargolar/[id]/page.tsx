// src/app/admin/(panel)/kargolar/[id]/page.tsx
// Kargo detayı (cargo-detail). Yazdırıldığında sadece A5 fiş kağıda çıkar.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { kargoSil } from "@/actions/kargo";
import { createClient } from "@/lib/supabase/server";
import { kargoKisaNo, type Kargo } from "@/lib/schemas/kargo";
import { tarihSaatYaz } from "@/lib/tarih";
import { Button } from "@/components/ui/button";
import { SayfaBasligi } from "../../../_components/form";
import SilButonu from "../../../_components/SilButonu";
import KargoFisi, { A5YazdirmaStili } from "../KargoFisi";
import OdemeTipiRozeti from "../OdemeTipiRozeti";
import { OtomatikYazdir, YazdirButonu } from "./Yazdir";
import VerilisTarihiFormu from "./VerilisTarihiFormu";

export const metadata: Metadata = {
    title: "Kargo Detayı",
};

type Props = {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ yazdir?: string }>;
};

export default async function KargoDetaySayfasi({ params, searchParams }: Props) {
    const [{ id }, { yazdir }] = await Promise.all([params, searchParams]);
    const supabase = await createClient();
    const { data } = await supabase.from("kargolar").select("*").eq("id", id).maybeSingle();

    if (!data) notFound();
    const kargo = data as Kargo;
    const no = kargoKisaNo(kargo.id);

    return (
        <div>
            <A5YazdirmaStili />
            {yazdir === "1" && <OtomatikYazdir />}

            <div className="print:hidden">
                <SayfaBasligi baslik="Kargo Detayı" aciklama={`No: ${no}`}>
                    <Button variant="outline" asChild>
                        <Link href="/admin/kargolar">
                            <ArrowLeft /> Kargolar
                        </Link>
                    </Button>
                    <YazdirButonu />
                    <SilButonu
                        onay="Bu kargo kaydı silinsin mi?"
                        sil={kargoSil.bind(null, kargo.id, true)}
                        etiket="Sil"
                    />
                </SayfaBasligi>

                <div className="grid gap-4 lg:grid-cols-3">
                    <BilgiKarti baslik="Gönderici Bilgileri">
                        <Satir etiket="Firma" deger={kargo.gonderici_firma_adi} />
                        <Satir etiket="Gönderici" deger={kargo.gonderici_adi} />
                        <Satir etiket="Telefon" deger={kargo.gonderici_telefon} />
                        <Satir etiket="Adres" deger={kargo.gonderici_adres} />
                        <Satir etiket="VKN / TCKN" deger={kargo.gonderici_vkn} />
                    </BilgiKarti>

                    <BilgiKarti baslik="Alıcı Bilgileri">
                        <Satir etiket="Ad Soyad" deger={kargo.alici_adi} />
                        <Satir etiket="Firma" deger={kargo.alici_firma} />
                        <Satir etiket="Telefon" deger={kargo.alici_telefon} />
                        <Satir etiket="Adres" deger={kargo.alici_adres} />
                        {kargo.alici_rehber_id && (
                            <Link
                                href={`/admin/rehber/${kargo.alici_rehber_id}`}
                                className="block pt-1 text-xs text-gray-500 underline"
                            >
                                Rehber kaydını aç
                            </Link>
                        )}
                    </BilgiKarti>

                    <BilgiKarti baslik="Kargo Bilgileri">
                        <Satir etiket="No" deger={no} />
                        <Satir etiket="Oluşturma" deger={tarihSaatYaz(kargo.created_at)} />
                        <div className="grid grid-cols-[100px_1fr] gap-2">
                            <dt className="text-gray-500">Ödeme Tipi</dt>
                            <dd>
                                <OdemeTipiRozeti tip={kargo.odeme_tipi} />
                            </dd>
                        </div>
                        <div className="border-t pt-3">
                            <VerilisTarihiFormu id={kargo.id} tarih={kargo.kargoya_verilis_tarihi} />
                        </div>
                    </BilgiKarti>
                </div>

                <h2 className="mb-3 mt-8 font-semibold text-[var(--color-secondary)]">Fiş Önizleme (A5)</h2>
            </div>

            <div className="overflow-x-auto rounded-xl bg-gray-200 p-4 print:overflow-visible print:rounded-none print:bg-white print:p-0">
                <KargoFisi
                    veri={{
                        gonderici: {
                            firma_adi: kargo.gonderici_firma_adi,
                            gonderici_adi: kargo.gonderici_adi,
                            telefon: kargo.gonderici_telefon,
                            adres: kargo.gonderici_adres,
                            vkn: kargo.gonderici_vkn,
                        },
                        alici: {
                            adi: kargo.alici_adi,
                            firma: kargo.alici_firma,
                            telefon: kargo.alici_telefon,
                            adres: kargo.alici_adres,
                        },
                        odeme_tipi: kargo.odeme_tipi,
                        tarih: tarihSaatYaz(kargo.created_at),
                        no,
                    }}
                />
            </div>
        </div>
    );
}

function BilgiKarti({ baslik, children }: { baslik: string; children: React.ReactNode }) {
    return (
        <section className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-semibold text-[var(--color-secondary)]">{baslik}</h2>
            <dl className="space-y-2 text-sm">{children}</dl>
        </section>
    );
}

function Satir({ etiket, deger }: { etiket: string; deger: string | null }) {
    if (!deger) return null;
    return (
        <div className="grid grid-cols-[100px_1fr] gap-2">
            <dt className="text-gray-500">{etiket}</dt>
            <dd className="whitespace-pre-line">{deger}</dd>
        </div>
    );
}
