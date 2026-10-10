// src/app/admin/_components/OtomatikFiltreFormu.tsx
// GET ile çalışan filtre formu. Açılır liste veya tarih değişince formu kendiliğinden gönderir;
// metin aramasında her tuşta değil, Enter/"Ara" ile gönderilir.
"use client";

type Props = React.ComponentProps<"form"> & { action: string };

export default function OtomatikFiltreFormu({ children, ...props }: Props) {
    return (
        <form
            {...props}
            onChange={(e) => {
                const hedef = e.target as HTMLElement;
                if (hedef instanceof HTMLSelectElement || (hedef instanceof HTMLInputElement && hedef.type === "date")) {
                    e.currentTarget.requestSubmit();
                }
            }}
        >
            {children}
        </form>
    );
}
