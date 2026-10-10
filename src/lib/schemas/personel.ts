// src/lib/schemas/personel.ts
// Hem admin formunda (React Hook Form) hem Server Action'da kullanılan ortak şema.
import { z } from "zod";
import { telefonAlani } from "./ortak";

export const ROLLER = {
    yonetici: "Yönetici",
    teknisyen: "Teknisyen",
    kasa: "Kasa",
} as const;

export type Rol = keyof typeof ROLLER;

export const personelSemasi = z.object({
    ad_soyad: z
        .string()
        .trim()
        .min(2, { error: "Ad soyad en az 2 karakter olmalı." })
        .max(100, { error: "En fazla 100 karakter girilebilir." }),
    telefon: telefonAlani,
    rol: z.enum(["yonetici", "teknisyen", "kasa"], { error: "Rol seçin." }),
    aktif: z.boolean(),
});

export type PersonelGirdisi = z.infer<typeof personelSemasi>;

export type Personel = {
    id: string;
    ad_soyad: string;
    telefon: string | null;
    rol: Rol;
    aktif: boolean;
    auth_user_id: string | null;
    created_at: string;
    updated_at: string;
};
