// src/app/admin/(panel)/personel/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { personelSil } from "@/actions/personel";
import { createClient } from "@/lib/supabase/server";
import { dbHataMesaji } from "@/lib/supabase/yetkili";
import { ROLLER, type Personel } from "@/lib/schemas/personel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { anaButonSinifi, FormHatasi, SayfaBasligi } from "../../_components/form";
import SilButonu from "../../_components/SilButonu";

export const metadata: Metadata = {
    title: "Personel",
};

export default async function PersonelSayfasi() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("personel")
        .select("*")
        .order("aktif", { ascending: false })
        .order("ad_soyad");

    const personeller = (data ?? []) as Personel[];

    return (
        <div>
            <SayfaBasligi baslik="Personel" aciklama="Servis ve kasa kayıtlarında seçilecek personel listesi.">
                <Button asChild className={anaButonSinifi}>
                    <Link href="/admin/personel/yeni">
                        <Plus /> Yeni Personel
                    </Link>
                </Button>
            </SayfaBasligi>

            {error && <FormHatasi mesaj={dbHataMesaji(error)} />}

            {!error && personeller.length === 0 && (
                <div className="rounded-xl border border-dashed bg-white p-10 text-center text-sm text-gray-500">
                    Henüz personel eklenmemiş.
                </div>
            )}

            {personeller.length > 0 && (
                <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-4 py-3 font-medium">Ad Soyad</th>
                                <th className="px-4 py-3 font-medium">Telefon</th>
                                <th className="px-4 py-3 font-medium">Rol</th>
                                <th className="px-4 py-3 font-medium">Durum</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {personeller.map((p) => (
                                <tr key={p.id} className={cn(!p.aktif && "text-gray-400")}>
                                    <td className="whitespace-nowrap px-4 py-3 font-medium">{p.ad_soyad}</td>
                                    <td className="whitespace-nowrap px-4 py-3">
                                        {p.telefon ? (
                                            <a href={`tel:${p.telefon}`} className="hover:underline">
                                                {p.telefon}
                                            </a>
                                        ) : (
                                            "—"
                                        )}
                                    </td>
                                    <td className="px-4 py-3">{ROLLER[p.rol]}</td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={cn(
                                                "rounded-full px-2 py-0.5 text-xs font-medium",
                                                p.aktif ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                                            )}
                                        >
                                            {p.aktif ? "Aktif" : "Pasif"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" asChild title="Düzenle">
                                                <Link href={`/admin/personel/${p.id}`} aria-label="Düzenle">
                                                    <Pencil />
                                                </Link>
                                            </Button>
                                            <SilButonu
                                                onay={`"${p.ad_soyad}" silinsin mi?`}
                                                sil={personelSil.bind(null, p.id)}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
