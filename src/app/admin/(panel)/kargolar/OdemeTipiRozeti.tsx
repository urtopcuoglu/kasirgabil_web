// src/app/admin/(panel)/kargolar/OdemeTipiRozeti.tsx
import { ODEME_TIPLERI, type OdemeTipi } from "@/lib/schemas/kargo";
import { cn } from "@/lib/utils";

export default function OdemeTipiRozeti({ tip }: { tip: OdemeTipi }) {
    const { kisa, uzun } = ODEME_TIPLERI[tip];
    return (
        <span
            title={uzun}
            className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                tip === "UA" ? "bg-blue-50 text-blue-700" : "bg-red-50 text-[var(--color-primary)]"
            )}
        >
            {kisa} – {uzun}
        </span>
    );
}
