// src/app/admin/(panel)/stok/kutular/[id]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, Plus } from "lucide-react";
import { kutuSil } from "@/actions/stok";
import { createClient } from "@/lib/supabase/server";
import type { Kutu, Urun } from "@/lib/schemas/stok";
import { paraYaz } from "@/lib/tarih";
import { Button } from "@/components/ui/button";
import { anaButonSinifi, SayfaBasligi } from "../../../../_components/form";
import SilButonu from "../../../../_components/SilButonu";
import { DurumRozeti, StokAdedi } from "../../UrunRozetleri";
import KutuDuzenle from "./KutuDuzenle";

export const metadata: Metadata = {
    title: "Kutu",
};

type Detay = Kutu & {
    urunler: Pick<Urun, "id" | "stok_kodu" | "ad" | "durum" | "stok_adedi" | "satis_fiyati" | "seri_no">[];
};

export default async function KutuDetaySayfasi({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const [{ data }, { data: tumKutular }] = await Promise.all([
        supabase
            .from("kutular")
            .select("*, urunler(id, stok_kodu, ad, durum, stok_adedi, satis_fiyati, seri_no)")
            .eq("id", id)
            .order("kutu_sira", { referencedTable: "urunler", ascending: true })
            .maybeSingle(),
        supabase.from("kutular").select("id, kutu_no, marka, model"),
    ]);

    if (!data) notFound();
    const k = data as Detay;

    return (
        <div>
            <SayfaBasligi baslik={`Kutu ${k.kutu_no}`} aciklama={`${k.marka} ${k.model}${k.konum ? ` · ${k.konum}` : ""}`}>
                <Button variant="outline" asChild>
                    <Link href="/admin/stok/kutular">
                        <ArrowLeft /> Kutular
                    </Link>
                </Button>
                <Button asChild className={anaButonSinifi}>
                    <Link href={`/admin/stok/yeni?kutu=${k.id}`}>
                        <Plus /> Bu Kutuya Parça Ekle
                    </Link>
                </Button>
                {k.urunler.length === 0 && (
                    <SilButonu onay={`Kutu ${k.kutu_no} (${k.marka} ${k.model}) silinsin mi?`} sil={kutuSil.bind(null, k.id)} etiket="Sil" />
                )}
            </SayfaBasligi>

            <div className="grid gap-4 lg:grid-cols-3">
                <section className="rounded-xl border bg-white shadow-sm lg:col-span-2">
                    <h2 className="border-b px-5 py-3 font-semibold text-[var(--color-secondary)]">
                        Parçalar <span className="font-normal text-gray-500">({k.urunler.length})</span>
                    </h2>
                    {k.urunler.length === 0 ? (
                        <p className="p-5 text-sm text-gray-500">Bu kutuya henüz parça eklenmemiş.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <tbody className="divide-y">
                                    {k.urunler.map((u) => (
                                        <tr key={u.id} className="hover:bg-gray-50">
                                            <td className="whitespace-nowrap px-5 py-2.5 font-mono font-semibold text-[var(--color-secondary)]">
                                                {u.stok_kodu}
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <p className="font-medium">{u.ad}</p>
                                                {u.seri_no && <p className="text-xs text-gray-500">Seri No: {u.seri_no}</p>}
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <DurumRozeti durum={u.durum} />
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-2.5 text-right">
                                                <StokAdedi adet={u.stok_adedi} />
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums">
                                                {u.satis_fiyati != null ? paraYaz(Number(u.satis_fiyati)) : <span className="text-gray-400">—</span>}
                                            </td>
                                            <td className="px-3 py-2.5 text-right">
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
                </section>

                <section className="rounded-xl border bg-white p-5 shadow-sm">
                    <h2 className="mb-3 font-semibold text-[var(--color-secondary)]">Kutu Bilgileri</h2>
                    <KutuDuzenle kutu={k} kutular={tumKutular ?? []} />
                </section>
            </div>
        </div>
    );
}
