// src/app/admin/(panel)/rehber/[id]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { musteriGetir } from "@/lib/musteri";
import { createClient } from "@/lib/supabase/server";
import type { RehberKategori, RehberKisi } from "@/lib/schemas/rehber";
import { tarihSaatYaz } from "@/lib/tarih";
import { SayfaBasligi } from "../../../_components/form";
import DurumRozeti from "../../teknik-servis/DurumRozeti";
import RehberFormu from "../RehberFormu";

export const metadata: Metadata = {
    title: "Kişi Düzenle",
};

export default async function RehberKisiDuzenleSayfasi({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const [kisiSonucu, kategorilerSonucu, musteri] = await Promise.all([
        supabase.from("rehber_kisiler").select("*").eq("id", id).maybeSingle(),
        supabase.from("rehber_kategorileri").select("id, ad, kod, sistem").order("ad"),
        musteriGetir(supabase, id),
    ]);

    if (!kisiSonucu.data) notFound();
    const kisi = kisiSonucu.data as RehberKisi;

    return (
        <div>
            <SayfaBasligi baslik="Kişi Düzenle" aciklama={kisi.ad_soyad_unvan} />
            <RehberFormu kisi={kisi} kategoriler={(kategorilerSonucu.data ?? []) as RehberKategori[]} />

            {musteri && musteri.cihazlar.length > 0 && (
                <section className="mt-6 max-w-3xl rounded-xl border bg-white p-5 shadow-sm sm:p-6">
                    <h2 className="mb-3 font-semibold text-[var(--color-secondary)]">Cihazlar ve Servis Geçmişi</h2>
                    <div className="space-y-4">
                        {musteri.cihazlar.map((c) => (
                            <div key={c.id}>
                                <p className="text-sm font-medium">
                                    {c.marka_model}
                                    {c.seri_no && <span className="font-normal text-gray-500"> · Seri No: {c.seri_no}</span>}
                                </p>
                                <ul className="mt-1 space-y-1 border-l pl-3">
                                    {c.servisler.map((s) => (
                                        <li key={s.id} className="flex items-center justify-between gap-2 text-sm">
                                            <Link href={`/admin/teknik-servis/${s.id}`} className="hover:underline">
                                                #{s.form_no} · {tarihSaatYaz(s.giris_tarihi)}
                                            </Link>
                                            <DurumRozeti durum={s.durum} />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
