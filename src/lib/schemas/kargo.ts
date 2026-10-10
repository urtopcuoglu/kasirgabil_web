// src/lib/schemas/kargo.ts
// Hem admin formlarında hem Server Action'larda kullanılan ortak şemalar.
import { z } from "zod";
import { telefonAlani } from "./ortak";

export const ODEME_TIPLERI = {
    UA: { kisa: "Ü.A", uzun: "Ücret Alıcı" },
    GO: { kisa: "G.Ö", uzun: "Gönderici Ödemeli" },
} as const;

export type OdemeTipi = keyof typeof ODEME_TIPLERI;

export const gondericiSemasi = z.object({
    firma_adi: z
        .string()
        .trim()
        .min(2, { error: "Firma adı en az 2 karakter olmalı." })
        .max(150, { error: "En fazla 150 karakter girilebilir." }),
    gonderici_adi: z
        .string()
        .trim()
        .min(2, { error: "Gönderici adı en az 2 karakter olmalı." })
        .max(150, { error: "En fazla 150 karakter girilebilir." }),
    telefon: telefonAlani.refine((v) => v !== "", { error: "Telefon zorunludur." }),
    adres: z
        .string()
        .trim()
        .min(10, { error: "Adres en az 10 karakter olmalı." })
        .max(500, { error: "En fazla 500 karakter girilebilir." }),
    vkn: z
        .string()
        .trim()
        .refine((v) => v === "" || /^[0-9]{10,11}$/.test(v), {
            error: "VKN 10, TCKN 11 haneli olmalı (sadece rakam).",
        }),
});

export type GondericiGirdisi = z.infer<typeof gondericiSemasi>;

export const kargoOlusturSemasi = z.object({
    gonderici_id: z.uuid({ error: "Gönderici seçin." }),
    alici_rehber_id: z.uuid({ error: "Alıcı seçin." }),
    odeme_tipi: z.enum(["UA", "GO"], { error: "Ödeme tipi seçin." }),
});

export type KargoOlusturGirdisi = z.infer<typeof kargoOlusturSemasi>;

export type KargoGonderici = {
    id: string;
    firma_adi: string;
    gonderici_adi: string;
    telefon: string;
    adres: string;
    vkn: string | null;
    varsayilan: boolean;
};

export type Kargo = {
    id: string;
    gonderici_id: string | null;
    alici_rehber_id: string | null;
    gonderici_firma_adi: string;
    gonderici_adi: string;
    gonderici_telefon: string;
    gonderici_adres: string;
    gonderici_vkn: string | null;
    alici_adi: string;
    alici_firma: string | null;
    alici_telefon: string | null;
    alici_adres: string;
    odeme_tipi: OdemeTipi;
    kargoya_verilis_tarihi: string | null; // YYYY-MM-DD
    created_at: string;
};

// Fiş üzerindeki kısa takip numarası (UUID'nin ilk 8 karakteri).
export const kargoKisaNo = (id: string) => id.slice(0, 8).toUpperCase();
