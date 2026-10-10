// src/app/admin/(panel)/page.tsx
// Admin özet sayfası. Kartlar Faz 6'da gerçek verilerle doldurulacak.
import type { Metadata } from "next";
import { Package, Wallet, Wrench } from "lucide-react";

export const metadata: Metadata = {
    title: "Özet",
};

const ozetKartlari = [
    { baslik: "Açık Servis Kaydı", ikon: Wrench, faz: "Faz 2" },
    { baslik: "Kritik Stok", ikon: Package, faz: "Faz 3" },
    { baslik: "Bugünkü Kasa", ikon: Wallet, faz: "Faz 4" },
];

export default function AdminOzetSayfasi() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-[var(--color-secondary)]">Hoş geldiniz</h1>
                <p className="mt-1 text-sm text-gray-500">Kasırga Bilgisayar yönetim paneli</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ozetKartlari.map(({ baslik, ikon: Ikon, faz }) => (
                    <div key={baslik} className="rounded-xl border bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">{baslik}</span>
                            <Ikon className="size-5 text-[var(--color-primary)]" />
                        </div>
                        <p className="mt-3 text-3xl font-bold text-gray-300">—</p>
                        <p className="mt-1 text-xs text-gray-400">{faz} ile aktif olacak</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
