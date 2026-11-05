// src/app/admin/(panel)/OzetGrafikleri.tsx
// Özet sayfasının grafikleri (SVG, kütüphanesiz): sütun grafiği (1-2 seri) ve ödeme yöntemi dağılımı (bölümlü çubuk).
// Kurallar: sütun en fazla 24px, veri ucunda 4px yuvarlak / tabanda düz; 2px yüzey boşluğu; ince ve sakin ızgara;
// 2 seride lejant; üzerine gelince / klavyeyle odaklanınca ipucu; her grafiğin altında tablo görünümü.
"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Açık tema paleti (doğrulandı: CVD ΔE ≥ 9.1, normal görüş ΔE ≥ 22.9). Aqua ve sarı beyaz zeminde 3:1'in altında
// olduğu için kullanıldıkları yerde değerler görünür etiket ve tablo olarak da verilir.
export const SERI_RENKLERI = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100"] as const;
const IZGARA = "#e1e0d9";
const TABAN = "#c3c2b7";
const SOLUK = "#898781";

const paraYaz = (v: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(v);
// Eksen etiketi: eksen 10.000'e ulaşıyorsa tüm etiketler kısa (5 bin, 1,5 mn), değilse tam yazılır — tek eksende tek biçim.
const eksenEtiketi = (v: number, kisa: boolean) => {
    if (!kisa || v === 0) return v.toLocaleString("tr-TR");
    if (v >= 1_000_000) return `${(v / 1_000_000).toLocaleString("tr-TR", { maximumFractionDigits: 1 })} mn`;
    return `${(v / 1000).toLocaleString("tr-TR", { maximumFractionDigits: 1 })} bin`;
};

// Eksen için yuvarlak üst sınır ve 4 aralık (0, 2.500, 5.000 ...).
function eksen(maks: number) {
    if (maks <= 0) return { ust: 1000, adimlar: [0, 250, 500, 750, 1000] };
    const kaba = maks / 4;
    const us = 10 ** Math.floor(Math.log10(kaba));
    const adim = [1, 2, 2.5, 5, 10].map((c) => c * us).find((a) => a >= kaba) ?? 10 * us;
    return { ust: adim * 4, adimlar: [0, 1, 2, 3, 4].map((i) => i * adim) };
}

function useGenislik<T extends HTMLElement>() {
    const ref = useRef<T>(null);
    const [genislik, setGenislik] = useState(0);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const g = new ResizeObserver(([e]) => setGenislik(e.contentRect.width));
        g.observe(el);
        return () => g.disconnect();
    }, []);
    return [ref, genislik] as const;
}

export type SutunVerisi = { etiket: string; uzunEtiket: string; degerler: number[] };

// Üstü 4px yuvarlak, tabanı düz sütun yolu.
function sutunYolu(x: number, y: number, g: number, h: number) {
    const r = Math.min(4, g / 2, h);
    return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + g - r}Q${x + g},${y} ${x + g},${y + r}V${y + h}Z`;
}

export function SutunGrafigi({ veri, seriler, bosMesaj = "Bu dönemde kayıt yok." }: { veri: SutunVerisi[]; seriler: string[]; bosMesaj?: string }) {
    const [kutuRef, genislik] = useGenislik<HTMLDivElement>();
    const [secili, setSecili] = useState<number | null>(null);
    const kimlik = useId();

    const YUKSEKLIK = 220;
    const SOL = 48;
    const UST = 8;
    const ALT = 24;
    const cizimY = YUKSEKLIK - UST - ALT;
    const cizimG = Math.max(0, genislik - SOL - 4);
    const bant = veri.length ? cizimG / veri.length : 0;
    const seriSayisi = seriler.length;
    // Sütun en fazla 24px; gruptaki sütunlar arasında 2px boşluk, bandın kalanı hava.
    const sutunG = Math.max(2, Math.min(24, (bant * 0.7 - (seriSayisi - 1) * 2) / seriSayisi));
    const grupG = sutunG * seriSayisi + (seriSayisi - 1) * 2;

    const maks = Math.max(0, ...veri.flatMap((v) => v.degerler));
    const { ust, adimlar } = eksen(maks);
    const yPos = (v: number) => UST + cizimY - (v / ust) * cizimY;
    // Etiketler sığdığı kadar seyreltilir (en az ~36px aralık).
    const etiketAdimi = Math.max(1, Math.ceil(36 / Math.max(bant, 1)));
    const bos = maks === 0;

    return (
        <div>
            {seriSayisi > 1 && (
                <ul className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                    {seriler.map((s, i) => (
                        <li key={s} className="flex items-center gap-1.5">
                            <span className="inline-block size-2.5 rounded-sm" style={{ background: SERI_RENKLERI[i] }} aria-hidden />
                            {s}
                        </li>
                    ))}
                </ul>
            )}
            <div ref={kutuRef} className="relative" onPointerLeave={() => setSecili(null)}>
                {genislik > 0 && (
                    <svg width={genislik} height={YUKSEKLIK} role="img" aria-labelledby={`${kimlik}-baslik`} className="block overflow-visible">
                        <title id={`${kimlik}-baslik`}>{`${seriler.join(" ve ")} grafiği; değerler aşağıdaki tabloda`}</title>
                        {adimlar.map((a) => (
                            <g key={a}>
                                <line x1={SOL} x2={genislik} y1={yPos(a)} y2={yPos(a)} stroke={a === 0 ? TABAN : IZGARA} strokeWidth={1} />
                                <text x={SOL - 6} y={yPos(a)} dy="0.32em" textAnchor="end" fontSize={11} fill={SOLUK} className="tabular-nums">
                                    {eksenEtiketi(a, ust >= 10_000)}
                                </text>
                            </g>
                        ))}
                        {veri.map((v, i) => {
                            const bantX = SOL + i * bant;
                            const grupX = bantX + (bant - grupG) / 2;
                            const aktif = secili === i;
                            return (
                                <g key={v.uzunEtiket}>
                                    {aktif && <rect x={bantX} y={UST} width={bant} height={cizimY} fill="#0b0b0b" opacity={0.04} />}
                                    {v.degerler.map((d, s) => {
                                        if (d <= 0) return null;
                                        const y = yPos(d);
                                        return (
                                            <path
                                                key={s}
                                                d={sutunYolu(grupX + s * (sutunG + 2), y, sutunG, UST + cizimY - y)}
                                                fill={SERI_RENKLERI[s]}
                                                opacity={secili == null || aktif ? 1 : 0.55}
                                            />
                                        );
                                    })}
                                    {i % etiketAdimi === 0 && (
                                        <text x={bantX + bant / 2} y={YUKSEKLIK - 6} textAnchor="middle" fontSize={11} fill={SOLUK}>
                                            {v.etiket}
                                        </text>
                                    )}
                                    {/* Vurgu alanı: tüm bant (sütundan büyük), fare ve klavye için. */}
                                    <rect
                                        x={bantX}
                                        y={UST}
                                        width={bant}
                                        height={cizimY}
                                        fill="transparent"
                                        tabIndex={0}
                                        aria-label={`${v.uzunEtiket}: ${seriler.map((s, k) => `${s} ${paraYaz(v.degerler[k])}`).join(", ")}`}
                                        onPointerEnter={() => setSecili(i)}
                                        onFocus={() => setSecili(i)}
                                        onBlur={() => setSecili(null)}
                                        className="outline-none"
                                    />
                                </g>
                            );
                        })}
                    </svg>
                )}
                {bos && genislik > 0 && (
                    <p className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-sm text-gray-500">{bosMesaj}</p>
                )}
                {secili != null && veri[secili] && (
                    <Ipucu
                        x={SOL + (secili + 0.5) * bant}
                        genislik={genislik}
                        baslik={veri[secili].uzunEtiket}
                        satirlar={seriler.map((s, k) => ({ ad: s, deger: paraYaz(veri[secili].degerler[k]), renk: SERI_RENKLERI[k] }))}
                    />
                )}
            </div>
            <details className="mt-2 text-xs">
                <summary className="cursor-pointer text-gray-500 hover:text-gray-800">Tablo olarak göster</summary>
                <div className="mt-2 max-h-56 overflow-auto rounded border">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-2 py-1 font-medium">Dönem</th>
                                {seriler.map((s) => (
                                    <th key={s} className="px-2 py-1 text-right font-medium">
                                        {s}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {veri.map((v) => (
                                <tr key={v.uzunEtiket}>
                                    <td className="px-2 py-1">{v.uzunEtiket}</td>
                                    {v.degerler.map((d, k) => (
                                        <td key={k} className="px-2 py-1 text-right tabular-nums">
                                            {paraYaz(d)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </details>
        </div>
    );
}

function Ipucu({ x, genislik, baslik, satirlar }: { x: number; genislik: number; baslik: string; satirlar: { ad: string; deger: string; renk: string }[] }) {
    // Kutu kenardan taşmasın: sağ yarıdaysa imlecin soluna açılır.
    const sagda = x > genislik / 2;
    return (
        <div
            role="status"
            className="pointer-events-none absolute top-0 z-10 min-w-36 rounded-md border bg-white px-3 py-2 text-xs shadow-md"
            style={sagda ? { right: genislik - x + 8 } : { left: x + 8 }}
        >
            <p className="mb-1 text-gray-500">{baslik}</p>
            {satirlar.map((s) => (
                <p key={s.ad} className="flex items-center gap-2">
                    <span className="inline-block h-0.5 w-3 rounded" style={{ background: s.renk }} aria-hidden />
                    <span className="font-semibold text-gray-900">{s.deger}</span>
                    <span className="text-gray-500">{s.ad}</span>
                </p>
            ))}
        </div>
    );
}

// Bir bütünün parçaları (ödeme yöntemleri): 28px blok, 4px köşe, 2px boşluk; payı sığarsa içine yazılır.
// Lejant adları ve tutarları listeler (renk tek başına anlam taşımaz).
export function BolumluCubuk({ parcalar }: { parcalar: { ad: string; deger: number }[] }) {
    const toplam = parcalar.reduce((t, p) => t + p.deger, 0);
    if (toplam <= 0) return <p className="text-sm text-gray-500">Bu dönemde gelir yok.</p>;
    const yuzde = (v: number) => `%${Math.round((v / toplam) * 100)}`;

    return (
        <div>
            <div className="flex h-7 gap-0.5" role="img" aria-label={parcalar.map((p) => `${p.ad} ${paraYaz(p.deger)} (${yuzde(p.deger)})`).join(", ")}>
                {parcalar.map((p, i) =>
                    p.deger > 0 ? (
                        <div
                            key={p.ad}
                            title={`${p.ad}: ${paraYaz(p.deger)} (${yuzde(p.deger)})`}
                            className="flex min-w-0 items-center rounded px-1.5 text-[11px] font-semibold"
                            style={{ flexGrow: p.deger, flexBasis: 0, background: SERI_RENKLERI[i], color: i === 3 ? "#0b0b0b" : "#ffffff" }}
                        >
                            {/* Dar blokta yazı sığmaz (kırpılmaz, hiç yazılmaz); değer lejantta ve ipucunda. */}
                            {p.deger / toplam >= 0.15 && yuzde(p.deger)}
                        </div>
                    ) : null,
                )}
            </div>
            <ul className="mt-3 space-y-1 text-sm">
                {parcalar.map((p, i) => (
                    <li key={p.ad} className="flex items-center gap-2">
                        <span className="inline-block size-2.5 shrink-0 rounded-sm" style={{ background: SERI_RENKLERI[i] }} aria-hidden />
                        <span className="flex-1 text-gray-600">{p.ad}</span>
                        <span className="font-medium tabular-nums">{paraYaz(p.deger)}</span>
                        <span className="w-10 text-right text-xs tabular-nums text-gray-500">{yuzde(p.deger)}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

// Dönem seçici: tüm analiz bölümünü (kartlar ve grafikler) aynı döneme göre yeniler.
export function DonemSecici({ deger, secenekler }: { deger: string; secenekler: { deger: string; etiket: string }[] }) {
    const router = useRouter();
    return (
        <label className="flex items-center gap-2 text-sm text-gray-600">
            Dönem
            <select
                value={deger}
                onChange={(e) => router.push(e.target.value === "ay" ? "/admin" : `/admin?donem=${e.target.value}`, { scroll: false })}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-[var(--color-secondary)] focus:ring-2 focus:ring-[var(--color-secondary)]/20"
            >
                {secenekler.map((s) => (
                    <option key={s.deger} value={s.deger}>
                        {s.etiket}
                    </option>
                ))}
            </select>
        </label>
    );
}
