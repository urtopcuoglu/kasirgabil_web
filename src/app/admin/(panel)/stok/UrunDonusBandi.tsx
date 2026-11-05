// src/app/admin/(panel)/stok/UrunDonusBandi.tsx
// Ürün formundan "yeni kutu aç" ile kutulara gelindiğinde görünen bant: yarım kalan ürün taslağına geri döndürür.
// kutuId verilirse (açılan veya seçilen kutu) ürün formunda o kutu seçili gelir.
import Link from "next/link";
import { ArrowLeft, FileClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { anaButonSinifi } from "../../_components/form";

export default function UrunDonusBandi({ kutuId, kutuEtiketi }: { kutuId?: string; kutuEtiketi?: string }) {
    return (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm">
            <FileClock className="size-5 shrink-0 text-blue-700" />
            <p className="min-w-0 flex-1 text-blue-900">
                Ürün eklerken buraya geldiniz; girdiğiniz bilgiler taslak olarak saklandı.
                {kutuEtiketi ? ` Geri dönünce ürün “${kutuEtiketi}” kutusuna bağlanır.` : " Kutuyu açtıktan sonra ürüne geri dönebilirsiniz."}
            </p>
            <Button asChild className={anaButonSinifi}>
                <Link href={kutuId ? `/admin/stok/yeni?kutu=${kutuId}` : "/admin/stok/yeni"}>
                    <ArrowLeft /> Ürüne Geri Dön
                </Link>
            </Button>
        </div>
    );
}
