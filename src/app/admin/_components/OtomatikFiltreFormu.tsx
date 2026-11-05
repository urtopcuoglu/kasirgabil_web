// src/app/admin/_components/OtomatikFiltreFormu.tsx
// Panel liste sayfalarının filtre formu. Açılır liste veya tarih değişince formu kendiliğinden gönderir;
// metin aramasında her tuşta değil, Enter/"Ara" ile gönderilir.
// Form sunucuya gönderilir (panelFiltreUygula): filtreler adrese, arama kelimesi (name="q") adres yerine çereze yazılır.
"use client";

import { panelFiltreUygula } from "@/actions/panel-arama";

type Props = Omit<React.ComponentProps<"form">, "action"> & { action: string }; // action: listenin yolu (örn. /admin/stok)

export default function OtomatikFiltreFormu({ children, action, ...props }: Props) {
    return (
        <form
            {...props}
            action={panelFiltreUygula}
            onChange={(e) => {
                const hedef = e.target as HTMLElement;
                if (hedef instanceof HTMLSelectElement || (hedef instanceof HTMLInputElement && hedef.type === "date")) {
                    e.currentTarget.requestSubmit();
                }
            }}
        >
            <input type="hidden" name="_yol" value={action} />
            {children}
        </form>
    );
}
