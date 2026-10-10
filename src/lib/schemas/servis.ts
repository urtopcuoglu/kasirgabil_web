// src/lib/schemas/servis.ts
// Hem admin formlarında hem Server Action'larda kullanılan ortak şemalar.
import { z } from "zod";
import { opsiyonelMetin, telefonAlani } from "./ortak";

// Sıra, servis sürecinin akış sırasıdır. Veritabanındaki check kısıtıyla aynı olmalı.
export const SERVIS_DURUMLARI = {
    kayit_alindi: { etiket: "Kayıt Alındı", renk: "bg-slate-100 text-slate-700", nokta: "bg-slate-400" },
    parca_bekliyor: { etiket: "Parça Bekliyor", renk: "bg-amber-50 text-amber-700", nokta: "bg-amber-500" },
    musteri_onayi_bekliyor: { etiket: "Müşteri Onayı Bekliyor", renk: "bg-purple-50 text-purple-700", nokta: "bg-purple-500" },
    tamir_asamasinda: { etiket: "Tamir Aşamasında", renk: "bg-blue-50 text-blue-700", nokta: "bg-blue-500" },
    teslim_hazir: { etiket: "Teslim Hazır", renk: "bg-green-50 text-green-700", nokta: "bg-green-500" },
    teslim_edildi: { etiket: "Teslim Edildi", renk: "bg-gray-100 text-gray-500", nokta: "bg-gray-400" },
} as const;

export type ServisDurumu = keyof typeof SERVIS_DURUMLARI;
export const DURUM_KODLARI = Object.keys(SERVIS_DURUMLARI) as ServisDurumu[];

export const KALEM_TIPLERI = {
    iscilik: "İşçilik",
    malzeme: "Malzeme",
} as const;

export type KalemTipi = keyof typeof KALEM_TIPLERI;

const opsiyonelId = z.union([z.literal(""), z.uuid({ error: "Geçersiz kayıt." })]);

// musteri_id / cihaz_id boşsa veritabanı trigger'ı yeni müşteri / cihaz açar
// (aynı telefonlu kişi varsa hata verir, aynı cihaz varsa onu kullanır).
// Doluysa ad, telefon, marka/model ve seri no bağlı kayıttan kopyalanır.
export const servisSemasi = z.object({
    musteri_id: opsiyonelId,
    cihaz_id: opsiyonelId,
    musteri_ad_soyad: z
        .string()
        .trim()
        .min(2, { error: "Müşteri adı en az 2 karakter olmalı." })
        .max(100, { error: "En fazla 100 karakter girilebilir." }),
    musteri_telefon: telefonAlani.refine((v) => v !== "", { error: "Telefon zorunludur." }),
    cihaz_marka_model: z
        .string()
        .trim()
        .min(2, { error: "Cihaz marka/model en az 2 karakter olmalı." })
        .max(150, { error: "En fazla 150 karakter girilebilir." }),
    seri_no: opsiyonelMetin(100),
    sikayet: z
        .string()
        .trim()
        .min(3, { error: "Şikayet/arıza açıklaması girin." })
        .max(2000, { error: "En fazla 2000 karakter girilebilir." }),
    notlar: opsiyonelMetin(2000),
    teslim_alan_personel_id: z.uuid({ error: "Cihazı teslim alan personeli seçin." }),
    tahmini_teslim_tarihi: z.union([z.literal(""), z.iso.date({ error: "Geçerli bir tarih girin." })]),
});

export type ServisGirdisi = z.infer<typeof servisSemasi>;

export const durumDegistirSemasi = z.object({
    durum: z.enum(DURUM_KODLARI as [ServisDurumu, ...ServisDurumu[]], { error: "Durum seçin." }),
    aciklama: opsiyonelMetin(500),
});

export const kalemSemasi = z.object({
    tip: z.enum(["iscilik", "malzeme"], { error: "Tip seçin." }),
    aciklama: z
        .string()
        .trim()
        .min(2, { error: "Açıklama girin." })
        .max(200, { error: "En fazla 200 karakter girilebilir." }),
    miktar: z
        .number({ error: "Miktar girin." })
        .positive({ error: "Miktar 0'dan büyük olmalı." })
        .max(99999, { error: "Miktar çok büyük." }),
    birim_fiyat: z
        .number({ error: "Birim fiyat girin." })
        .min(0, { error: "Fiyat negatif olamaz." })
        .max(9999999, { error: "Fiyat çok büyük." }),
});

export type KalemGirdisi = z.infer<typeof kalemSemasi>;

export type ServisKaydi = {
    id: string;
    form_no: string;
    musteri_id: string;
    cihaz_id: string;
    musteri_ad_soyad: string;
    musteri_telefon: string;
    cihaz_marka_model: string;
    seri_no: string | null;
    sikayet: string;
    notlar: string | null;
    durum: ServisDurumu;
    teslim_alan_personel_id: string;
    giris_tarihi: string;
    tahmini_teslim_tarihi: string | null;
    teslim_tarihi: string | null;
    created_at: string;
    updated_at: string;
};

export type ServisKalemi = {
    id: string;
    servis_id: string;
    tip: KalemTipi;
    aciklama: string;
    miktar: number;
    birim_fiyat: number;
    tutar: number;
    created_at: string;
};

export type DurumGecmisi = {
    id: string;
    durum: ServisDurumu;
    aciklama: string | null;
    created_at: string;
};

// Servis formunda seçilen müşteri ve kayıtlı cihazları (musteriAra action'ı döndürür).
export type MusteriCihazi = {
    id: string;
    marka_model: string;
    seri_no: string | null;
    servisler: Pick<ServisKaydi, "id" | "form_no" | "giris_tarihi" | "durum">[];
};

export type MusteriSecenegi = {
    id: string;
    ad_soyad_unvan: string;
    telefon_1: string | null;
    telefon_2: string | null;
    cihazlar: MusteriCihazi[];
};

// Vitrin sorgusunun (servis_sorgula RPC) döndürdüğü kısıtlı bilgi.
export type ServisSorguSonucu = {
    form_no: string;
    musteri: string;
    cihaz: string;
    sikayet: string;
    durum: ServisDurumu;
    giris_tarihi: string;
    tahmini_teslim_tarihi: string | null;
    teslim_tarihi: string | null;
    gecmis: { durum: ServisDurumu; tarih: string }[];
};

// Postgres numeric değerleri JSON'da metin olarak gelebilir; hesaplamada sayıya çevrilir.
export const sayi = (v: number | string | null | undefined) => Number(v ?? 0);

export function kalemToplamlari(kalemler: Pick<ServisKalemi, "tip" | "tutar">[]) {
    let iscilik = 0;
    let malzeme = 0;
    for (const k of kalemler) {
        if (k.tip === "iscilik") iscilik += sayi(k.tutar);
        else malzeme += sayi(k.tutar);
    }
    return { iscilik, malzeme, genel: iscilik + malzeme };
}
