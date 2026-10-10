// src/app/admin/(panel)/stok/kutular/[id]/KutuDuzenle.tsx
"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import type { Kutu } from "@/lib/schemas/stok";
import { Button } from "@/components/ui/button";
import KutuFormu from "../KutuFormu";

type Props = {
    kutu: Kutu;
    kutular: Pick<Kutu, "id" | "kutu_no" | "marka" | "model">[];
    duzenlenebilir: boolean;
};

export default function KutuDuzenle({ kutu, kutular, duzenlenebilir }: Props) {
    const [duzenleniyor, setDuzenleniyor] = useState(false);

    if (duzenleniyor) return <KutuFormu kutu={kutu} kutular={kutular} bitti={() => setDuzenleniyor(false)} />;

    const satirlar = [
        ["Kutu No", String(kutu.kutu_no)],
        ["Marka", kutu.marka],
        ["Model", kutu.model],
        ["Konum", kutu.konum],
        ["Not", kutu.notlar],
    ] as const;

    return (
        <div className="space-y-3">
            <dl className="space-y-1 text-sm">
                {satirlar.map(
                    ([etiket, deger]) =>
                        deger && (
                            <div key={etiket} className="grid grid-cols-[80px_1fr] gap-2">
                                <dt className="text-gray-500">{etiket}</dt>
                                <dd>{deger}</dd>
                            </div>
                        )
                )}
            </dl>
            {duzenlenebilir && (
                <Button variant="outline" size="sm" onClick={() => setDuzenleniyor(true)}>
                    <Pencil /> Düzenle
                </Button>
            )}
        </div>
    );
}
