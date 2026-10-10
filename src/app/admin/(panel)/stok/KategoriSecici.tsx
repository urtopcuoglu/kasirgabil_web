// src/app/admin/(panel)/stok/KategoriSecici.tsx
// Ürün formundaki kategori seçimi: ağaçta adım adım inilir (Bilgisayar → Dizüstü → Yedek Parça),
// üstteki arama kutusuyla tüm ağaçta isimle aranır; bulunamazsa bulunulan dala yeni kategori eklenebilir.
"use client";

import { useState, useTransition } from "react";
import { Check, ChevronDown, ChevronLeft, ChevronRight, Loader2, Plus, Search } from "lucide-react";
import { kategoriEkle } from "@/actions/stok";
import { kategoriAgaci, type UrunKategori } from "@/lib/schemas/stok";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { inputSinifi } from "../../_components/form";

type Props = {
    id: string; // label htmlFor için
    kategoriler: UrunKategori[];
    deger: string;
    onSec: (id: string) => void;
    onEklendi: (kategori: UrunKategori) => void;
    gecersiz?: boolean;
};

const kucuk = (s: string) => s.toLocaleLowerCase("tr").trim();

export default function KategoriSecici({ id, kategoriler, deger, onSec, onEklendi, gecersiz }: Props) {
    const [acik, setAcik] = useState(false);
    const [arama, setArama] = useState("");
    // Listede gösterilen dal (null: ana kategoriler)
    const [konum, setKonum] = useState<string | null>(null);
    const [hata, setHata] = useState<string>();
    const [ekleniyor, startTransition] = useTransition();

    const agac = kategoriAgaci(kategoriler);
    const harita = new Map(kategoriler.map((k) => [k.id, k]));
    const altlari = (ustId: string | null) =>
        kategoriler.filter((k) => k.ust_id === ustId).toSorted((a, b) => a.ad.localeCompare(b.ad, "tr"));
    const altVarMi = (kid: string) => kategoriler.some((k) => k.ust_id === kid);

    const aranan = kucuk(arama);
    const sonuclar = aranan ? agac.sirali.filter((k) => kucuk(k.ad).includes(aranan)).slice(0, 50) : [];
    // Bulunulan dalda aynı isimli kategori yoksa yeni ekleme önerilir.
    const ayniIsimVar = altlari(konum).some((k) => kucuk(k.ad) === aranan);
    const konumYolu = konum ? agac.yol(konum) : "Ana kategoriler";

    function ac(yeni: boolean) {
        setAcik(yeni);
        if (!yeni) return;
        setArama("");
        setHata(undefined);
        // Seçili kategori varsa onun bulunduğu dal açılır.
        setKonum(deger ? (harita.get(deger)?.ust_id ?? null) : null);
    }

    function sec(kid: string) {
        onSec(kid);
        setAcik(false);
    }

    function ekle() {
        setHata(undefined);
        startTransition(async () => {
            const sonuc = await kategoriEkle(konum, arama);
            if ("hata" in sonuc) {
                setHata(sonuc.hata);
                return;
            }
            onEklendi(sonuc.kategori);
            sec(sonuc.kategori.id);
        });
    }

    return (
        <Popover open={acik} onOpenChange={ac}>
            <PopoverTrigger asChild>
                <button
                    id={id}
                    type="button"
                    className={cn(
                        inputSinifi,
                        "flex items-center justify-between gap-2 text-left",
                        gecersiz && "border-[var(--color-primary)]"
                    )}
                >
                    <span className={cn("truncate", !deger && "text-gray-400")}>{deger ? agac.yol(deger) : "— Kategori seçin —"}</span>
                    <ChevronDown className="size-4 shrink-0 text-gray-400" />
                </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[min(420px,calc(100vw-2rem))] p-0">
                <div className="border-b p-2">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                        <input
                            autoFocus
                            value={arama}
                            onChange={(e) => {
                                setArama(e.target.value);
                                setHata(undefined);
                            }}
                            onKeyDown={(e) => {
                                // Enter: ilk sonucu seçer (formu göndermez).
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    if (sonuclar[0]) sec(sonuclar[0].id);
                                }
                            }}
                            placeholder="Kategori ara..."
                            aria-label="Kategori ara"
                            className={cn(inputSinifi, "py-1.5 pl-9")}
                        />
                    </div>
                </div>

                <div className="max-h-80 overflow-y-auto p-1">
                    {aranan ? (
                        sonuclar.map((k) => (
                            <Satir key={k.id} secili={k.id === deger} onClick={() => sec(k.id)}>
                                <span className="font-medium">{k.ad}</span>
                                {k.ust_id && <span className="block truncate text-xs text-gray-500">{agac.yol(k.ust_id)}</span>}
                            </Satir>
                        ))
                    ) : (
                        <>
                            {konum && (
                                <div className="mb-1 flex items-center gap-1 border-b px-1 pb-1">
                                    <button
                                        type="button"
                                        onClick={() => setKonum(harita.get(konum)?.ust_id ?? null)}
                                        className="flex shrink-0 items-center gap-1 rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
                                    >
                                        <ChevronLeft className="size-3.5" /> Geri
                                    </button>
                                    <span className="min-w-0 flex-1 truncate text-xs text-gray-500">{konumYolu}</span>
                                    <button
                                        type="button"
                                        onClick={() => sec(konum)}
                                        className="shrink-0 rounded px-2 py-1 text-xs font-medium text-[var(--color-secondary)] hover:bg-gray-100"
                                    >
                                        Bunu seç
                                    </button>
                                </div>
                            )}
                            {altlari(konum).map((k) => {
                                const alt = altVarMi(k.id);
                                return (
                                    <Satir
                                        key={k.id}
                                        secili={k.id === deger}
                                        // Alt kategorisi olan dala inilir; olmayan seçilir.
                                        onClick={() => (alt ? setKonum(k.id) : sec(k.id))}
                                        sag={alt ? <ChevronRight className="size-4 text-gray-400" /> : undefined}
                                    >
                                        <span className="font-medium">{k.ad}</span>
                                    </Satir>
                                );
                            })}
                        </>
                    )}

                    {aranan && sonuclar.length === 0 && <p className="px-3 py-2 text-sm text-gray-500">Eşleşen kategori yok.</p>}

                    {aranan && !ayniIsimVar && (
                        <button
                            type="button"
                            onClick={ekle}
                            disabled={ekleniyor || aranan.length < 2}
                            className="mt-1 flex w-full items-start gap-2 rounded border-t px-3 py-2 text-left text-sm text-[var(--color-secondary)] hover:bg-gray-50 disabled:opacity-50"
                        >
                            {ekleniyor ? <Loader2 className="mt-0.5 size-4 animate-spin" /> : <Plus className="mt-0.5 size-4" />}
                            <span>
                                <span className="font-medium">“{arama.trim()}”</span> kategorisini ekle
                                <span className="block text-xs text-gray-500">Eklenecek yer: {konumYolu}</span>
                            </span>
                        </button>
                    )}
                    {hata && <p className="px-3 py-1 text-xs text-[var(--color-primary)]">{hata}</p>}
                </div>
            </PopoverContent>
        </Popover>
    );
}

function Satir({
    secili,
    onClick,
    sag,
    children,
}: {
    secili: boolean;
    onClick: () => void;
    sag?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm hover:bg-gray-100",
                secili && "bg-[var(--color-secondary)]/5"
            )}
        >
            <Check className={cn("size-4 shrink-0", secili ? "text-[var(--color-secondary)]" : "invisible")} />
            <span className="min-w-0 flex-1">{children}</span>
            {sag}
        </button>
    );
}
