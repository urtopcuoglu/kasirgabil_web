// src/lib/schemas/rehber.ts
// Hem admin formunda (React Hook Form) hem Server Action'da kullanılan ortak şemalar.
import { z } from "zod";
import { opsiyonelMetin, telefonAlani } from "./ortak";

// Sistemin koddan tanıdığı kategori kodları (veritabanında rehber_kategorileri.kod).
export const TEDARIKCI_KODU = "tedarikci";

export const rehberKisiSemasi = z.object({
    ad_soyad_unvan: z
        .string()
        .trim()
        .min(2, { error: "Ad soyad / ünvan en az 2 karakter olmalı." })
        .max(150, { error: "En fazla 150 karakter girilebilir." }),
    firma: opsiyonelMetin(150),
    kategori_id: z.union([z.literal(""), z.uuid({ error: "Geçersiz kategori." })]),
    telefon_1: telefonAlani,
    telefon_2: telefonAlani,
    eposta: z.union([z.literal(""), z.email({ error: "Geçerli bir e-posta adresi girin." })]),
    adres: opsiyonelMetin(500),
    notlar: opsiyonelMetin(2000),
});

export type RehberKisiGirdisi = z.infer<typeof rehberKisiSemasi>;

export const rehberKategoriSemasi = z.object({
    ad: z
        .string()
        .trim()
        .min(2, { error: "Kategori adı en az 2 karakter olmalı." })
        .max(50, { error: "En fazla 50 karakter girilebilir." }),
});

export type RehberKategori = {
    id: string;
    ad: string;
    kod: string | null;
    sistem: boolean;
};

export type RehberKisi = {
    id: string;
    ad_soyad_unvan: string;
    firma: string | null;
    kategori_id: string | null;
    telefon_1: string | null;
    telefon_2: string | null;
    eposta: string | null;
    adres: string | null;
    notlar: string | null;
    created_at: string;
    updated_at: string;
};
