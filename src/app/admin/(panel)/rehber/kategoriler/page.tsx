// src/app/admin/(panel)/rehber/kategoriler/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { dbHataMesaji } from "@/lib/supabase/yetkili";
import type { RehberKategori } from "@/lib/schemas/rehber";
import { Button } from "@/components/ui/button";
import { FormHatasi, SayfaBasligi } from "../../../_components/form";
import KategoriSatiri, { YeniKategoriFormu } from "./KategoriSatiri";

export const metadata: Metadata = {
    title: "Rehber Kategorileri",
};

type KategoriSatirVerisi = RehberKategori & { rehber_kisiler: { count: number }[] };

export default async function RehberKategorileriSayfasi() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("rehber_kategorileri")
        .select("id, ad, kod, sistem, rehber_kisiler(count)")
        .order("sistem", { ascending: false })
        .order("ad");

    const kategoriler = (data ?? []) as KategoriSatirVerisi[];

    return (
        <div className="max-w-2xl">
            <SayfaBasligi baslik="Rehber Kategorileri" aciklama="Sistem kategorileri (Tedarikçi) silinemez.">
                <Button variant="outline" asChild>
                    <Link href="/admin/rehber">
                        <ArrowLeft /> Rehbere Dön
                    </Link>
                </Button>
            </SayfaBasligi>

            {error && <FormHatasi mesaj={dbHataMesaji(error)} />}

            <div className="divide-y rounded-xl border bg-white shadow-sm">
                {kategoriler.map((k) => (
                    <KategoriSatiri key={k.id} kategori={k} kisiSayisi={k.rehber_kisiler[0]?.count ?? 0} />
                ))}
                <YeniKategoriFormu />
            </div>
        </div>
    );
}
