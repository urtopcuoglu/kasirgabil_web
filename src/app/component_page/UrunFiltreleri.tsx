// src/app/component_page/UrunFiltreleri.tsx
// Ürünler sayfasının araması (ürün adı, marka, model veya stok kodu) ve filtreleri (kategori, marka, model, sıralama).
// Filtreler adreste taşınır; arama kelimesi adreste görünmesin diye sunucuda çereze yazılır (urunAramasiniAyarla).
// Marka değişince eski markanın modeli sıfırlanır.
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import { urunAramasiniAyarla } from "@/actions/urun-arama";

type Secenek = { deger: string; etiket: string };

type Props = {
    secili: { ara: string; kategori: string; marka: string; model: string; sirala: string };
    kategoriler: Secenek[];
    markalar: string[];
    modeller: string[];
    siralamalar: Secenek[];
};

const secimSinifi =
    "w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

// Filtre adresi; arama kelimesi bilerek eklenmez. Sayfa numarası her değişiklikte sıfırlanır.
function adres(filtre: Omit<Props["secili"], "ara">) {
    const params = new URLSearchParams();
    for (const [anahtar, deger] of Object.entries(filtre)) if (deger && !(anahtar === "sirala" && deger === "yeni")) params.set(anahtar, deger);
    const s = params.toString();
    return s ? `/urunler?${s}` : "/urunler";
}

export default function UrunFiltreleri({ secili, kategoriler, markalar, modeller, siralamalar }: Props) {
    const router = useRouter();
    const [araniyor, startTransition] = useTransition();
    const filtre = { kategori: secili.kategori, marka: secili.marka, model: secili.model, sirala: secili.sirala };

    const git = (degisen: Partial<Omit<Props["secili"], "ara">>) => {
        const yeni = { ...filtre, ...degisen };
        if ("marka" in degisen) yeni.model = "";
        router.push(adres(yeni), { scroll: false });
    };

    const aktif = !!(secili.ara || secili.kategori || secili.marka || secili.model);

    const aramaGonder = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const ara = String(new FormData(e.currentTarget).get("ara") ?? "").trim();
        if (ara === secili.ara) return;
        startTransition(async () => {
            await urunAramasiniAyarla(ara);
            router.push(adres(filtre), { scroll: false });
        });
    };

    const temizle = () =>
        startTransition(async () => {
            await urunAramasiniAyarla("");
            router.push("/urunler", { scroll: false });
        });

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mb-3 flex items-center justify-between">
                <p className="flex items-center gap-2 font-semibold text-[var(--color-secondary)] dark:text-zinc-100">
                    <SlidersHorizontal size={18} /> Filtrele
                </p>
                {aktif && (
                    <button
                        type="button"
                        onClick={temizle}
                        disabled={araniyor}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-[var(--color-primary)]"
                    >
                        <X size={14} /> Temizle
                    </button>
                )}
            </div>
            <form role="search" onSubmit={aramaGonder} className="mb-3 flex gap-2">
                <label className="relative flex-1">
                    <span className="sr-only">Ürün adı, marka, model veya stok kodu ile ara</span>
                    <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        key={secili.ara}
                        type="search"
                        name="ara"
                        defaultValue={secili.ara}
                        maxLength={100}
                        placeholder="Ürün adı, marka, model veya stok kodu…"
                        className={`${secimSinifi} pl-10`}
                    />
                </label>
                <button
                    type="submit"
                    disabled={araniyor}
                    className="flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
                >
                    {araniyor && <Loader2 size={16} className="animate-spin" />}
                    Ara
                </button>
            </form>
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

// Sonuç bulunamayınca "Tüm ürünleri göster": arama çerezini ve filtreleri temizler.
export function AramayiTemizle({ className, children }: { className?: string; children: React.ReactNode }) {
    const router = useRouter();
    const [bekliyor, startTransition] = useTransition();
    return (
        <button
            type="button"
            disabled={bekliyor}
            className={className}
            onClick={() =>
                startTransition(async () => {
                    await urunAramasiniAyarla("");
                    router.push("/urunler", { scroll: false });
                })
            }
        >
            {children}
        </button>
    );
}
