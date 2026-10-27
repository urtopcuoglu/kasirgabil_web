// src/app/component_page/UrunFiltreleri.tsx
// Ürünler sayfasının filtreleri (kategori, marka, model, sıralama). Seçim değişince sayfa yeni adresle yüklenir;
// marka değişince eski markanın modeli sıfırlanır.
"use client";

import { useRouter } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";

type Secenek = { deger: string; etiket: string };

type Props = {
    secili: { kategori: string; marka: string; model: string; sirala: string };
    kategoriler: Secenek[];
    markalar: string[];
    modeller: string[];
    siralamalar: Secenek[];
};

const secimSinifi =
    "w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

export default function UrunFiltreleri({ secili, kategoriler, markalar, modeller, siralamalar }: Props) {
    const router = useRouter();

    const git = (degisen: Partial<Props["secili"]>) => {
        const yeni = { ...secili, ...degisen };
        if ("marka" in degisen) yeni.model = "";
        const params = new URLSearchParams();
        for (const [anahtar, deger] of Object.entries(yeni)) if (deger && !(anahtar === "sirala" && deger === "yeni")) params.set(anahtar, deger);
        const s = params.toString();
        router.push(s ? `/urunler?${s}` : "/urunler", { scroll: false });
    };

    const aktif = !!(secili.kategori || secili.marka || secili.model);

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mb-3 flex items-center justify-between">
                <p className="flex items-center gap-2 font-semibold text-[var(--color-secondary)] dark:text-zinc-100">
                    <SlidersHorizontal size={18} /> Filtrele
                </p>
                {aktif && (
                    <Link href="/urunler" className="flex items-center gap-1 text-xs text-gray-500 hover:text-[var(--color-primary)]">
                        <X size={14} /> Temizle
                    </Link>
                )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Secim etiket="Kategori" deger={secili.kategori} onChange={(v) => git({ kategori: v })} secenekler={[{ deger: "", etiket: "Tüm kategoriler" }, ...kategoriler]} />
                <Secim
                    etiket="Marka"
                    deger={secili.marka}
                    onChange={(v) => git({ marka: v })}
                    secenekler={[{ deger: "", etiket: "Tüm markalar" }, ...markalar.map((m) => ({ deger: m, etiket: m }))]}
                />
                <Secim
                    etiket="Model"
                    deger={secili.model}
                    onChange={(v) => git({ model: v })}
                    secenekler={[{ deger: "", etiket: modeller.length ? "Tüm modeller" : "Model yok" }, ...modeller.map((m) => ({ deger: m, etiket: m }))]}
                    pasif={modeller.length === 0}
                />
                <Secim etiket="Sıralama" deger={secili.sirala} onChange={(v) => git({ sirala: v })} secenekler={siralamalar} />
            </div>
        </div>
    );
}

function Secim({
    etiket,
    deger,
    onChange,
    secenekler,
    pasif,
}: {
    etiket: string;
    deger: string;
    onChange: (deger: string) => void;
    secenekler: Secenek[];
    pasif?: boolean;
}) {
    return (
        <label className="flex min-w-0 flex-col gap-1 text-xs font-medium text-gray-500 dark:text-zinc-400">
            {etiket}
            <select value={deger} onChange={(e) => onChange(e.target.value)} disabled={pasif} className={secimSinifi}>
                {secenekler.map((s) => (
                    <option key={s.deger} value={s.deger}>
                        {s.etiket}
                    </option>
                ))}
            </select>
        </label>
    );
}
