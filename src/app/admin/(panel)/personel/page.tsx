// src/app/admin/(panel)/personel/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound, Pencil, Plus } from "lucide-react";
import { personelSil } from "@/actions/personel";
import { createClient } from "@/lib/supabase/server";
import { dbHataMesaji } from "@/lib/supabase/yetkili";
import { ROLLER, type Personel } from "@/lib/schemas/personel";
import type { PersonelTalebi } from "@/lib/schemas/talep";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { anaButonSinifi, FormHatasi, SayfaBasligi } from "../../_components/form";
import SilButonu from "../../_components/SilButonu";
import TalepListesi from "./TalepListesi";

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

    // Kayıt talepleri: bekleyenler ve son 20 karar.
    const TALEP_SUTUNLARI = "id, ad_soyad, telefon, eposta, durum, karar_tarihi, created_at";
    const [bekleyen, karar] = await Promise.all([
        supabase.from("personel_talepleri").select(TALEP_SUTUNLARI).eq("durum", "bekliyor").order("created_at"),
        supabase.from("personel_talepleri").select(TALEP_SUTUNLARI).neq("durum", "bekliyor").order("karar_tarihi", { ascending: false }).limit(20),
    ]);
    const bekleyenler = (bekleyen.data ?? []) as PersonelTalebi[];

    return (
        <div>
            <SayfaBasligi baslik="Personel" aciklama="Personel listesi, roller ve panel girişleri.">
                <Button asChild className={anaButonSinifi}>
                    <Link href="/admin/personel/yeni">
                        <Plus /> Yeni Personel
                    </Link>
                </Button>
            </SayfaBasligi>

            <section id="talepler" className="mb-6 rounded-xl border bg-white p-5 shadow-sm">
                <h2 className="mb-1 flex items-center gap-2 font-semibold text-[var(--color-secondary)]">
                    Kayıt Talepleri
                    {bekleyenler.length > 0 && (
                        <span className="rounded-full bg-[var(--color-primary)] px-2 py-0.5 text-xs font-semibold text-white">{bekleyenler.length}</span>
                    )}
                </h2>
                <p className="mb-4 text-sm text-gray-500">
                    Giriş sayfasındaki &quot;Kayıt talebi oluşturun&quot; bağlantısından gelen talepler. Onaylanınca personel kaydı ve panel girişi oluşturulur.
                </p>
                {bekleyen.error ? (
                    <FormHatasi mesaj={dbHataMesaji(bekleyen.error)} />
                ) : (
                    <TalepListesi bekleyenler={bekleyenler} sonKararlar={(karar.data ?? []) as PersonelTalebi[]} />
                )}
            </section>

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
                                <th className="px-4 py-3 font-medium">Panel Girişi</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {personeller.map((p) => (
                                <tr key={p.id} className={cn(!p.aktif && "text-gray-400")}>
                                    <td className="whitespace-nowrap px-4 py-3 font-medium">
                                        {p.ad_soyad}
                                        {p.sistem_hesabi && (
                                            <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-gray-500">
                                                Sistem
                                            </span>
                                        )}
                                    </td>
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
                                        {p.auth_user_id ? (
                                            <span className="inline-flex items-center gap-1 text-xs text-green-700">
                                                <KeyRound className="size-3.5" /> Var
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-400">Yok</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" asChild title="Düzenle">
                                                <Link href={`/admin/personel/${p.id}`} aria-label="Düzenle">
                                                    <Pencil />
                                                </Link>
                                            </Button>
                                            {!p.sistem_hesabi && (
                                                <SilButonu
                                                    onay={`"${p.ad_soyad}" silinsin mi?${p.auth_user_id ? " Panel girişi de çalışmaz hale gelir." : ""}`}
                                                    sil={personelSil.bind(null, p.id)}
                                                />
                                            )}
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
