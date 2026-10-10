// src/app/admin/(panel)/stok/UrunRozetleri.tsx
import { URUN_DURUMLARI, type UrunDurumu } from "@/lib/schemas/stok";
import { cn } from "@/lib/utils";

export function DurumRozeti({ durum }: { durum: UrunDurumu }) {
    const { etiket, renk } = URUN_DURUMLARI[durum];
    return <span className={cn("whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium", renk)}>{etiket}</span>;
}

export function StokAdedi({ adet }: { adet: number }) {
    return (
        <span className={cn("font-semibold tabular-nums", adet === 0 ? "text-[var(--color-primary)]" : "text-gray-900")}>
            {adet === 0 ? "Stokta yok" : adet}
        </span>
    );
}
