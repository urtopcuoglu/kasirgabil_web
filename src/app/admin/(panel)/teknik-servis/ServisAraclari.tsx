// src/app/admin/(panel)/teknik-servis/ServisAraclari.tsx
// Teknik servis araçları:
// - LCD ekran sorgulama: panel kodu (örn. N156HRA-EA1) kendi stoğumuzda aranır; laptopscreen.com'da aramak için
//   bağlantılar verilir. laptopscreen.com'un API'si yok ve otomatik erişimi engelliyor; bu yüzden veri çekilmez,
//   yalnızca yeni sekmede açılır.
// - Donanım puanı: CPU/GPU/SSD... için UserBenchmark sıra ve puanına hızlı bakış.
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ChevronDown, Copy, Cpu, ExternalLink, Loader2, MonitorSmartphone, Search, Wrench } from "lucide-react";
import { stoktaParcaAra, type StoktakiParca } from "@/actions/stok";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { inputSinifi } from "../../_components/form";
import DonanimArama from "../donanim/DonanimArama";

type Sekme = "lcd" | "donanim";

export default function ServisAraclari({ varsayilanAcik = false }: { varsayilanAcik?: boolean }) {
    const [sekme, setSekme] = useState<Sekme>("lcd");

    return (
        <details className="group mb-4 rounded-xl border bg-white shadow-sm" open={varsayilanAcik}>
            <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 font-semibold text-[var(--color-secondary)]">
                <Wrench className="size-4" /> Servis Araçları
                <span className="text-xs font-normal text-gray-500">LCD ekran sorgulama · donanım puanı</span>
                <ChevronDown className="ml-auto size-4 transition group-open:rotate-180" />
            </summary>
            <div className="border-t p-4">
                <div role="tablist" aria-label="Servis araçları" className="mb-4 flex gap-1 border-b">
                    <SekmeButonu aktif={sekme === "lcd"} onClick={() => setSekme("lcd")} Ikon={MonitorSmartphone}>
                        LCD Ekran Sorgula
                    </SekmeButonu>
                    <SekmeButonu aktif={sekme === "donanim"} onClick={() => setSekme("donanim")} Ikon={Cpu}>
                        Donanım Puanı
                    </SekmeButonu>
                </div>
                {sekme === "lcd" ? (
                    <LcdSorgu />
                ) : (
                    <div className="space-y-2">
                        <DonanimArama />
                        <p className="text-xs text-gray-500">
                            Kaynak: UserBenchmark resmi verileri. Takip ve tüm liste için{" "}
                            <Link href="/admin/donanim" className="underline">
                                Donanım Puanları
                            </Link>{" "}
                            sayfası.
                        </p>
                    </div>
                )}
            </div>
        </details>
    );
}

function SekmeButonu({
    aktif,
    onClick,
    Ikon,
    children,
}: {
    aktif: boolean;
    onClick: () => void;
    Ikon: typeof Cpu;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            role="tab"
            aria-selected={aktif}
            onClick={onClick}
            className={cn(
                "-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium",
                aktif ? "border-[var(--color-primary)] text-[var(--color-secondary)]" : "border-transparent text-gray-500 hover:text-gray-800",
            )}
        >
            <Ikon className="size-4" /> {children}
        </button>
    );
}

function LcdSorgu() {
    const [kod, setKod] = useState("");
    const [sonuc, setSonuc] = useState<{ kod: string; liste: StoktakiParca[] } | null>(null);
    const [hata, setHata] = useState<string>();
    const [kopyalandi, setKopyalandi] = useState(false);
    const [araniyor, startTransition] = useTransition();
    const temiz = kod.trim();

    function stoktaAra() {
        setHata(undefined);
        if (temiz.length < 3) return setHata("En az 3 karakter yazın.");
        startTransition(async () => {
            const s = await stoktaParcaAra(temiz);
            if ("hata" in s) return setHata(s.hata);
            setSonuc({ kod: temiz, liste: s.sonuclar });
        });
    }

    // laptopscreen.com'un arama adresi herkese açık değil: kod panoya kopyalanır, site açılır, arama kutusuna yapıştırılır.
    async function siteyiAc() {
        try {
            await navigator.clipboard.writeText(temiz);
            setKopyalandi(true);
            setTimeout(() => setKopyalandi(false), 4000);
        } catch {
            // pano izni yoksa yalnızca site açılır
        }
        window.open("https://www.laptopscreen.com/", "_blank", "noopener");
    }

    const googleAdresi = `https://www.google.com/search?q=${encodeURIComponent(`site:laptopscreen.com "${temiz}"`)}`;

    return (
        <div className="space-y-3">
            <div role="search" className="flex flex-wrap gap-2">
                <div className="relative min-w-48 flex-1">
                    <MonitorSmartphone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="search"
                        value={kod}
                        onChange={(e) => setKod(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key !== "Enter") return;
                            e.preventDefault();
                            stoktaAra();
                        }}
                        maxLength={60}
                        placeholder="Panel kodu (ekranın arkasındaki etiket, örn. N156HRA-EA1, B140XTN02.4)"
                        aria-label="LCD panel kodu"
                        className={cn(inputSinifi, "py-1.5 pl-9 font-mono placeholder:font-sans")}
                    />
                </div>
                <Button type="button" variant="outline" className="h-[34px]" onClick={stoktaAra} disabled={araniyor}>
                    {araniyor ? <Loader2 className="animate-spin" /> : <Search />} Stokta Ara
                </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Button type="button" size="sm" variant="outline" asChild>
                    <a
                        href={temiz ? googleAdresi : undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-disabled={!temiz}
                        className={cn(!temiz && "pointer-events-none opacity-50")}
                    >
                        <ExternalLink /> laptopscreen.com sonuçları (Google)
                    </a>
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={siteyiAc} disabled={!temiz}>
                    <Copy /> Kodu kopyala, laptopscreen.com&apos;u aç
                </Button>
                {kopyalandi && <span className="text-xs text-green-700">Kod kopyalandı; sitedeki arama kutusuna yapıştırın.</span>}
            </div>

            {hata && <p className="text-xs text-[var(--color-primary)]">{hata}</p>}

            {sonuc && (
                <div className="rounded-md border">
                    <p className="border-b bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600">
                        Stokta “{sonuc.kod}”: {sonuc.liste.length === 0 ? "bulunamadı" : `${sonuc.liste.length} ürün`}
                    </p>
                    {sonuc.liste.length > 0 && (
                        <ul className="divide-y">
                            {sonuc.liste.map((u) => (
                                <li key={u.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-sm">
                                    <Link href={`/admin/stok/${u.id}`} className="min-w-0 flex-1 hover:underline">
                                        <span className="font-mono text-xs font-semibold text-[var(--color-secondary)]">{u.stok_kodu}</span>{" "}
                                        {u.ad}
                                    </Link>
                                    {u.kutu_no != null && <span className="text-xs text-gray-500">Kutu {u.kutu_no}</span>}
                                    <span className={cn("text-xs font-medium", u.stok_adedi > 0 ? "text-green-700" : "text-gray-400")}>
                                        {u.stok_adedi > 0 ? `${u.stok_adedi} adet` : "stokta yok"}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
