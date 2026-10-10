// src/lib/schemas/kasa.ts
// Kasa modülünün ortak şemaları, tipleri ve özet hesapları (form + action + sayfalar).
import { z } from "zod";
import { opsiyonelMetin, opsiyonelSayi, sayiOku } from "./ortak";

export const ODEME_YONTEMLERI = {
    nakit: "Nakit",
    kredi_karti: "Kredi Kartı",
    banka_karti: "Banka Kartı",
    havale_eft: "Havale / EFT",
} as const;

export type OdemeYontemi = keyof typeof ODEME_YONTEMLERI;
export const YONTEM_KODLARI = Object.keys(ODEME_YONTEMLERI) as OdemeYontemi[];

export const HAREKET_TIPLERI = { gelir: "Gelir", gider: "Gider" } as const;
export type KasaTipi = keyof typeof HAREKET_TIPLERI;

// Sistemin koddan tanıdığı kategoriler (veritabanında kasa_kategorileri.kod).
export const KATEGORI_KODLARI = { satis: "satis", servis: "servis", alis: "alis" } as const;

export type KasaKategori = {
    id: string;
    ad: string;
    tip: KasaTipi;
    kod: string | null;
    sistem: boolean;
};

export type KasaHareketi = {
    id: string;
    tarih: string;
    tip: KasaTipi;
    yontem: OdemeYontemi;
    tutar: number;
    kategori_id: string;
    kimden_kime: string | null;
    aciklama: string | null;
    rehber_kisi_id: string | null;
    servis_id: string | null;
    urun_id: string | null;
    urun_adet: number | null;
    created_at: string;
};

export type KasaGunu = {
    tarih: string;
    acilis_nakit: number | null;
    beklenen_nakit: number | null;
    sayilan_nakit: number | null;
    kapandi: boolean;
    kapanis_notu: string | null;
    kapanis_zamani: string | null;
};

const opsiyonelId = z.union([z.literal(""), z.uuid({ error: "Geçersiz kayıt." })]);

export const kasaHareketiSemasi = z
    .object({
        tarih: z.iso.date({ error: "Tarih seçin." }),
        tip: z.enum(["gelir", "gider"], { error: "Gelir veya gider seçin." }),
        yontem: z.enum(YONTEM_KODLARI as [OdemeYontemi, ...OdemeYontemi[]], { error: "Ödeme yöntemi seçin." }),
        tutar: z
            .string()
            .trim()
            .min(1, { error: "Tutar girin." })
            .refine((v) => (sayiOku(v) ?? 0) > 0, { error: "Tutar 0'dan büyük olmalı." })
            .refine((v) => (sayiOku(v) ?? 0) <= 99999999, { error: "Tutar çok büyük." }),
        kategori_id: z.uuid({ error: "Kategori seçin." }),
        kimden_kime: opsiyonelMetin(150),
        aciklama: opsiyonelMetin(500),
        rehber_kisi_id: opsiyonelId,
        servis_id: opsiyonelId,
        urun_id: opsiyonelId,
        urun_adet: opsiyonelSayi({ max: 10000, tamSayi: true }),
    })
    .refine((v) => !v.urun_id || (sayiOku(v.urun_adet) ?? 0) >= 1, {
        error: "Ürün seçildiyse adet en az 1 olmalı.",
        path: ["urun_adet"],
    });

export type KasaHareketiGirdisi = z.infer<typeof kasaHareketiSemasi>;

export const kasaKategoriSemasi = z.object({
    ad: z.string().trim().min(2, { error: "Kategori adı en az 2 karakter olmalı." }).max(50, { error: "En fazla 50 karakter girilebilir." }),
    tip: z.enum(["gelir", "gider"], { error: "Tip seçin." }),
});

// Kasa hareketinin bağlanabildiği kayıtlar (formdaki arama seçicileri).
export type BaglantiTuru = "servis" | "urun" | "rehber";

export type BaglantiSecenegi = {
    id: string;
    etiket: string;
    alt?: string;
    // servis: müşteri ve kalan tutar; ürün: fiyat ve stok
    musteriId?: string | null;
    musteriAd?: string;
    kalan?: number;
    satisFiyati?: number | null;
    stokAdedi?: number;
};

// ─── Özet hesapları ─────────────────────────────────────────

type OzetSatiri = Pick<KasaHareketi, "tip" | "yontem" | "tutar" | "kategori_id">;

// Toplam gelir/gider/net ile yöntem ve kategori kırılımı.
export function kasaOzeti(hareketler: OzetSatiri[]) {
    const yontemler = Object.fromEntries(YONTEM_KODLARI.map((y) => [y, { gelir: 0, gider: 0 }])) as Record<
        OdemeYontemi,
        { gelir: number; gider: number }
    >;
    const kategoriler = new Map<string, number>();
    let gelir = 0;
    let gider = 0;

    for (const h of hareketler) {
        const tutar = Number(h.tutar);
        yontemler[h.yontem][h.tip] += tutar;
        kategoriler.set(h.kategori_id, (kategoriler.get(h.kategori_id) ?? 0) + tutar);
        if (h.tip === "gelir") gelir += tutar;
        else gider += tutar;
    }

    return { gelir, gider, net: gelir - gider, yontemler, kategoriler };
}
