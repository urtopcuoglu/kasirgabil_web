// src/app/admin/(panel)/teknik-servis/DurumRozeti.tsx
import { SERVIS_DURUMLARI, type ServisDurumu } from "@/lib/schemas/servis";
import { cn } from "@/lib/utils";

export default function DurumRozeti({ durum, buyuk }: { durum: ServisDurumu; buyuk?: boolean }) {
    const { etiket, renk, nokta } = SERVIS_DURUMLARI[durum];
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-medium",
                buyuk ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs",
                renk
            )}
        >
            <span className={cn("size-1.5 rounded-full", nokta)} />
            {etiket}
        </span>
    );
}
