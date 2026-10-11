// src/lib/schemas/sohbet.ts
// Canlı sohbet: vitrindeki sohbet penceresi ve paneldeki Sohbetler sayfası.
import { z } from "zod";
import { telefonAlani } from "./ortak";

export const MESAJ_UZUNLUGU = 2000;

export const mesajMetni = z
    .string()
    .trim()
    .min(1, { error: "Mesaj yazın." })
    .max(MESAJ_UZUNLUGU, { error: `Mesaj en fazla ${MESAJ_UZUNLUGU} karakter olabilir.` });

export const sohbetBaslatSemasi = z
    .object({
        ad: z.string().trim().min(2, { error: "Adınızı girin." }).max(60, { error: "En fazla 60 karakter girilebilir." }),
        telefon: telefonAlani,
        eposta: z.union([z.literal(""), z.email({ error: "Geçerli bir e-posta adresi girin." }).max(120, { error: "E-posta adresi çok uzun." })]),
        mesaj: mesajMetni,
    })
    .refine((v) => v.telefon !== "" || v.eposta !== "", {
        error: "Size dönebilmemiz için telefon ya da e-posta girin.",
        path: ["telefon"],
    });

export type SohbetBaslatGirdisi = z.infer<typeof sohbetBaslatSemasi>;

export type SohbetDurumu = "acik" | "kapali";

// sistem: zaman aşımı uyarısı ve kapanış mesajı (veritabanındaki sohbet_zaman_asimi() yazar).
export type SohbetGonderen = "ziyaretci" | "personel" | "sistem";

// Ziyaretçinin gördüğü mesaj (sohbet_getir fonksiyonu).
export type ZiyaretciMesaji = {
    id: string;
    gonderen: SohbetGonderen;
    personel: string | null; // personelin yalnızca adı
    metin: string;
    created_at: string;
};

export type ZiyaretciSohbeti = {
    id: string;
    durum: SohbetDurumu;
    mesajlar: ZiyaretciMesaji[];
};

// Panel
export type Sohbet = {
    id: string;
    ad: string;
    telefon: string | null;
    eposta: string | null;
    sayfa: string | null;
    durum: SohbetDurumu;
    okunmamis: boolean | null;
    son_mesaj_at: string;
    kapanma_at: string | null;
    created_at: string;
};

export type SohbetMesaji = {
    id: string;
    gonderen: SohbetGonderen;
    metin: string;
    created_at: string;
    personel: { ad_soyad: string } | null;
};
