// src/lib/schemas/iletisim.ts
// Vitrindeki iletişim formu ve paneldeki mesajlar.
import { z } from "zod";
import { opsiyonelMetin, telefonAlani } from "./ortak";

export const iletisimSemasi = z.object({
    ad: z.string().trim().min(2, { error: "Adınızı girin." }).max(60, { error: "En fazla 60 karakter girilebilir." }),
    soyad: opsiyonelMetin(60),
    telefon: telefonAlani,
    eposta: z.email({ error: "Geçerli bir e-posta adresi girin." }).max(120, { error: "E-posta adresi çok uzun." }),
    mesaj: z
        .string()
        .trim()
        .min(10, { error: "Mesajınız en az 10 karakter olmalı." })
        .max(2000, { error: "Mesajınız en fazla 2000 karakter olabilir." }),
    // Botlar için tuzak alan: gerçek kullanıcı görmez, dolu gelirse mesaj kaydedilmez.
    web_sitesi: z.string().max(200).optional(),
});

export type IletisimGirdisi = z.infer<typeof iletisimSemasi>;

export type IletisimMesaji = {
    id: string;
    ad: string;
    soyad: string | null;
    telefon: string | null;
    eposta: string;
    mesaj: string;
    okundu: boolean;
    okunma_tarihi: string | null;
    created_at: string;
};
