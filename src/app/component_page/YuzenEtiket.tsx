// src/app/component_page/YuzenEtiket.tsx
// Sağ alttaki yüzen butonların (canlı sohbet, WhatsApp) üzerine gelince soldan kayarak açılan etiket.
// Butona "group" sınıfı verilmeli. Ekran okuyucular butonun aria-label'ını okur, etiket gizlidir.
import { cn } from "@/lib/utils";

export default function YuzenEtiket({ metin, renk, gizli }: { metin: string; renk: string; gizli?: boolean }) {
    return (
        <span
            aria-hidden="true"
            className={cn(
                "pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 translate-x-2 whitespace-nowrap rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold opacity-0 shadow-lg ring-1 ring-black/5 transition-all duration-200 ease-out",
                // Sağa bakan küçük ok
                "after:absolute after:left-full after:top-1/2 after:-translate-y-1/2 after:border-[6px] after:border-transparent after:border-l-white",
                !gizli && "group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
            )}
            style={{ color: renk }}
        >
            {metin}
        </span>
    );
}
