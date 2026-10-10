// src/lib/schemas/ortak.ts
import { z } from "zod";

// Boş bırakılabilen metin alanı.
export const opsiyonelMetin = (max: number) =>
    z.string().trim().max(max, { error: `En fazla ${max} karakter girilebilir.` });

// Boş bırakılabilir; doluysa en az 10 rakam içermeli (0532 123 45 67, +90 532 ... vb.).
export const telefonAlani = z
    .string()
    .trim()
    .max(25, { error: "Telefon numarası çok uzun." })
    .refine((v) => v === "" || v.replace(/\D/g, "").length >= 10, {
        error: "Geçerli bir telefon numarası girin.",
    });

// Formdaki sayı metnini sayıya çevirir. "1.250,50" (TR) ve "1250.50" biçimleri kabul edilir; boşsa null.
export function sayiOku(deger: string): number | null {
    const v = deger.trim().replace(/\s/g, "");
    if (v === "") return null;
    const normal = v.includes(",") ? v.replace(/\./g, "").replace(",", ".") : v;
    const sayi = Number(normal);
    return Number.isFinite(sayi) ? sayi : Number.NaN;
}

// Boş bırakılabilen sayı alanı (metin olarak tutulur, action'da sayiOku ile çevrilir).
export const opsiyonelSayi = ({ min = 0, max, tamSayi = false }: { min?: number; max: number; tamSayi?: boolean }) =>
    z
        .string()
        .trim()
        .refine((v) => !Number.isNaN(sayiOku(v)), { error: "Geçerli bir sayı girin." })
        .refine((v) => (sayiOku(v) ?? min) >= min, { error: `En az ${min} olabilir.` })
        .refine((v) => (sayiOku(v) ?? 0) <= max, { error: "Değer çok büyük." })
        .refine((v) => !tamSayi || Number.isInteger(sayiOku(v) ?? 0), { error: "Tam sayı girin." });
