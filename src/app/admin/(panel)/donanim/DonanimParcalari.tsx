// src/app/admin/(panel)/donanim/DonanimParcalari.tsx
// Donanım puanı gösterim parçaları (sunucu ve istemci bileşenlerinde ortak kullanılır).
import { ArrowDown, ArrowUp, ExternalLink, Minus } from "lucide-react";
import { donanimEtiketi, DONANIM_TURLERI, type DonanimPuani, type DonanimTuru } from "@/lib/donanim-puanlari";
import { cn } from "@/lib/utils";

export const puanYaz = (v: number | string | null | undefined) =>
    v == null ? "—" : Number(v).toLocaleString("tr-TR", { maximumFractionDigits: 1 });
export const sayiYaz = (v: number | null | undefined) => (v == null ? "—" : v.toLocaleString("tr-TR"));

const TUR_RENKLERI: Record<DonanimTuru, string> = {
    CPU: "bg-blue-50 text-blue-700",
    GPU: "bg-green-50 text-green-700",
    SSD: "bg-purple-50 text-purple-700",
    HDD: "bg-gray-100 text-gray-700",
    RAM: "bg-amber-50 text-amber-700",
    USB: "bg-pink-50 text-pink-700",
};

export function TurRozeti({ tur }: { tur: DonanimTuru }) {
    return (
        <span title={DONANIM_TURLERI[tur]} className={cn("rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold", TUR_RENKLERI[tur])}>
            {tur}
        </span>
    );
}

export function UbLinki({ url, className }: { url: string; className?: string }) {
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title="UserBenchmark sayfasını aç"
            className={cn("inline-flex items-center gap-1 text-xs text-[var(--color-secondary)] hover:underline", className)}
        >
            UserBenchmark <ExternalLink className="size-3" />
        </a>
    );
}

// Kart içinde tek kayıt: ad, tür, sıra, puan, test sayısı.
export function DonanimOzeti({ p, className }: { p: DonanimPuani; className?: string }) {
    return (
        <div className={cn("space-y-1.5", className)}>
            <div className="flex items-start gap-2">
                <TurRozeti tur={p.tur} />
                <p className="min-w-0 flex-1 text-sm font-medium leading-tight">{donanimEtiketi(p)}</p>
            </div>
            <dl className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-md bg-gray-50 px-2 py-1.5">
                    <dt className="text-[11px] text-gray-500">Sıra</dt>
                    <dd className="font-semibold tabular-nums">{p.sira != null ? `#${sayiYaz(p.sira)}` : "—"}</dd>
                </div>
                <div className="rounded-md bg-gray-50 px-2 py-1.5">
                    <dt className="text-[11px] text-gray-500">Puan</dt>
                    <dd className="font-semibold tabular-nums">{puanYaz(p.puan)}</dd>
                </div>
                <div className="rounded-md bg-gray-50 px-2 py-1.5">
                    <dt className="text-[11px] text-gray-500">Test</dt>
                    <dd className="font-semibold tabular-nums">{sayiYaz(p.ornek)}</dd>
                </div>
            </dl>
            <UbLinki url={p.url} />
        </div>
    );
}

// Sıra değişimi: sıra küçüldüyse yükselmiştir (yeşil).
export function SiraDegisimi({ simdi, once }: { simdi: number | null; once: number | null | undefined }) {
    if (simdi == null || once == null || simdi === once) {
        return <Minus className="inline size-3.5 text-gray-300" aria-label="Değişim yok" />;
    }
    const yukseldi = simdi < once;
    const Ikon = yukseldi ? ArrowUp : ArrowDown;
    return (
        <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium", yukseldi ? "text-green-700" : "text-[var(--color-primary)]")}>
            <Ikon className="size-3.5" />
            {Math.abs(once - simdi)}
        </span>
    );
}

export function PuanDegisimi({ simdi, once }: { simdi: number | null; once: number | null | undefined }) {
    if (simdi == null || once == null || Number(simdi) === Number(once)) return null;
    const fark = Number(simdi) - Number(once);
    return (
        <span className={cn("text-xs font-medium", fark > 0 ? "text-green-700" : "text-[var(--color-primary)]")}>
            {fark > 0 ? "+" : ""}
            {puanYaz(fark)}
        </span>
    );
}
