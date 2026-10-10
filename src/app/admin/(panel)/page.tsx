// src/app/admin/(panel)/page.tsx
// Admin özet sayfası. Henüz yapılmamış modüllerin kartları ilgili fazda doldurulacak.
import type { Metadata } from "next";
import Link from "next/link";
import { Package, Wallet, Wrench, type LucideIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
    title: "Özet",
};

type Kart = {
    baslik: string;
    ikon: LucideIcon;
    deger?: number | null;
    aciklama: string;
    href?: string;
};

export default async function AdminOzetSayfasi() {
    const supabase = await createClient();
    const { count: acikServis } = await supabase
        .from("teknik_servis_kayitlari")
        .select("id", { count: "exact", head: true })
        .neq("durum", "teslim_edildi");

    const kartlar: Kart[] = [
        {
            baslik: "Açık Servis Kaydı",
            ikon: Wrench,
            deger: acikServis,
            aciklama: "Teslim edilmemiş cihazlar",
            href: "/admin/teknik-servis?durum=acik",
        },
        { baslik: "Kritik Stok", ikon: Package, aciklama: "Faz 3 ile aktif olacak" },
        { baslik: "Bugünkü Kasa", ikon: Wallet, aciklama: "Faz 4 ile aktif olacak" },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-[var(--color-secondary)]">Hoş geldiniz</h1>
                <p className="mt-1 text-sm text-gray-500">Kasırga Bilgisayar yönetim paneli</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {kartlar.map(({ baslik, ikon: Ikon, deger, aciklama, href }) => {
                    const icerik = (
                        <>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-500">{baslik}</span>
                                <Ikon className="size-5 text-[var(--color-primary)]" />
                            </div>
                            <p className={`mt-3 text-3xl font-bold ${deger == null ? "text-gray-300" : "text-gray-900"}`}>
                                {deger ?? "—"}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">{aciklama}</p>
                        </>
                    );
                    return href ? (
                        <Link key={baslik} href={href} className="rounded-xl border bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow">
                            {icerik}
                        </Link>
                    ) : (
                        <div key={baslik} className="rounded-xl border bg-white p-5 shadow-sm">
                            {icerik}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
