// src/lib/schemas/talep.ts
// Panel kayıt talebi formu (/admin/kayit) — hem formda hem Server Action'da kullanılır.
import { z } from "zod";

export const talepSemasi = z.object({
    ad_soyad: z
        .string()
        .trim()
        .min(2, { error: "Ad soyad en az 2 karakter olmalı." })
        .max(100, { error: "En fazla 100 karakter girilebilir." }),
    telefon: z
        .string()
        .trim()
        .max(25, { error: "Telefon numarası çok uzun." })
        .refine((v) => v.replace(/\D/g, "").length >= 10, { error: "Geçerli bir telefon numarası girin." }),
    eposta: z.email({ error: "Geçerli bir e-posta adresi girin." }).max(120, { error: "E-posta çok uzun." }),
    web_sitesi: z.string().optional(), // bot tuzağı: görünmez alan, doluysa talep kaydedilmez
});

export type TalepGirdisi = z.infer<typeof talepSemasi>;

export const TALEP_DURUMLARI = {
    bekliyor: "Bekliyor",
    onaylandi: "Onaylandı",
    reddedildi: "Reddedildi",
} as const;

export type TalepDurumu = keyof typeof TALEP_DURUMLARI;

export type PersonelTalebi = {
    id: string;
    ad_soyad: string;
    telefon: string;
    eposta: string;
    durum: TalepDurumu;
    karar_tarihi: string | null;
    created_at: string;
};
