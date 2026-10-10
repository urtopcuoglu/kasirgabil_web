// src/app/admin/_components/liste.tsx
// Liste sayfalarında (rehber, kargolar...) ortak kullanılan filtre ve görünüm parçaları.
import Link from "next/link";
import { LayoutGrid, List, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { inputSinifi } from "./form";

export type Gorunum = "liste" | "kart";

export const gorunumOku = (deger?: string): Gorunum => (deger === "kart" ? "kart" : "liste");

// Boş değerleri atlayarak sorgu parametreli link üretir.
export function linkOlustur(yol: string, parametreler: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    for (const [anahtar, deger] of Object.entries(parametreler)) {
        if (deger) params.set(anahtar, deger);
    }
    const s = params.toString();
    return s ? `${yol}?${s}` : yol;
}

// Gelen değer izin verilenlerden biri değilse varsayılanı döndürür (elle bozulmuş URL'lere karşı).
export function secenekOku<T extends string>(deger: string | undefined, izinli: readonly T[], varsayilan: T): T {
    return izinli.includes(deger as T) ? (deger as T) : varsayilan;
}

// Kullanıcının yazdığı metni "arama" sütunu için ilike desenine çevirir. Sadece rakam/telefon
// karakterleri içeriyorsa boşluklar atılır, böylece "0532 123" ve "0532123" aynı sonucu verir.
export function aramaDeseni(q: string) {
    const temiz = /^[\d\s()+-]+$/.test(q) ? q.replace(/\D/g, "") : q;
    return `%${temiz.replace(/[\\%_]/g, (k) => `\\${k}`)}%`;
}

export const uuidMi =(deger?: string) => !!deger && /^[0-9a-f-]{36}$/i.test(deger);
export const tarihMi = (deger?: string) => !!deger && /^\d{4}-\d{2}-\d{2}$/.test(deger);

// ─── Görünüm seçici (ikonlu iki parçalı anahtar) ────────────

export function GorunumSecici({ aktif, link }: { aktif: Gorunum; link: (g: Gorunum) => string }) {
    const secenekler = [
        { deger: "liste" as const, etiket: "Liste görünümü", Ikon: List },
        { deger: "kart" as const, etiket: "Kart görünümü", Ikon: LayoutGrid },
    ];

    return (
        <div role="group" aria-label="Görünüm" className="flex h-[38px] shrink-0 rounded-md border bg-white p-0.5">
            {secenekler.map(({ deger, etiket, Ikon }) => (
                <Link
                    key={deger}
                    href={link(deger)}
                    aria-label={etiket}
                    aria-current={aktif === deger ? "true" : undefined}
                    title={etiket}
                    className={cn(
                        "flex w-8 items-center justify-center rounded transition",
                        aktif === deger
                            ? "bg-[var(--color-secondary)] text-white"
                            : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    )}
                >
                    <Ikon className="size-4" />
                </Link>
            ))}
        </div>
    );
}

// ─── Filtre alanları ────────────────────────────────────────

type FiltreSecimiProps = {
    etiket: string;
    name: string;
    deger: string;
    secenekler: { deger: string; etiket: string }[];
};

export function FiltreSecimi({ etiket, name, deger, secenekler }: FiltreSecimiProps) {
    return (
        <label className="flex min-w-0 flex-col gap-1 text-xs font-medium text-gray-500">
            {etiket}
            <select name={name} defaultValue={deger} className={cn(inputSinifi, "py-1.5")}>
                {secenekler.map((s) => (
                    <option key={s.deger} value={s.deger}>
                        {s.etiket}
                    </option>
                ))}
            </select>
        </label>
    );
}

export function FiltreTarihi({ etiket, name, deger }: { etiket: string; name: string; deger?: string }) {
    return (
        <label className="flex min-w-0 flex-col gap-1 text-xs font-medium text-gray-500">
            {etiket}
            <input type="date" name={name} defaultValue={deger} className={cn(inputSinifi, "py-1.5")} />
        </label>
    );
}

// Aktif filtre varsa sonuç sayısı ve "Filtreleri temizle" linki gösterir.
export function FiltreOzeti({ sonucSayisi, aktifFiltre, temizleLinki }: { sonucSayisi: number; aktifFiltre: number; temizleLinki: string }) {
    return (
        <div className="mb-4 flex min-h-5 items-center gap-3 text-xs text-gray-500">
            <span>{sonucSayisi} kayıt</span>
            {aktifFiltre > 0 && (
                <Link href={temizleLinki} className="flex items-center gap-1 text-[var(--color-primary)] hover:underline">
                    <X className="size-3" /> Filtreleri temizle ({aktifFiltre})
                </Link>
            )}
        </div>
    );
}
