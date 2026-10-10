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
