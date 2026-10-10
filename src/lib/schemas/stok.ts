// src/lib/schemas/stok.ts
// Stok modülünün ortak şemaları, tipleri ve hesaplama yardımcıları (form + action + sayfalar).
import { z } from "zod";
import { opsiyonelMetin, opsiyonelSayi } from "./ortak";

export const URUN_DURUMLARI = {
    sifir: { etiket: "Sıfır", renk: "bg-green-50 text-green-700" },
    ikinci_el: { etiket: "İkinci El", renk: "bg-amber-50 text-amber-700" },
} as const;

export type UrunDurumu = keyof typeof URUN_DURUMLARI;

export const KDV_ORANLARI = [1, 10, 18, 20] as const;

export const HAREKET_TIPLERI = {
    giris: "Giriş",
    cikis: "Çıkış",
    sayim: "Sayım düzeltmesi",
} as const;

export type HareketTipi = keyof typeof HAREKET_TIPLERI;

const opsiyonelId = z.union([z.literal(""), z.uuid({ error: "Geçersiz kayıt." })]);

// ─── Kategoriler ────────────────────────────────────────────

export type UrunKategori = {
    id: string;
    ad: string;
    ust_id: string | null;
    kutu_sistemi: boolean;
};

export const kategoriSemasi = z.object({
    ad: z
        .string()
        .trim()
        .min(2, { error: "Kategori adı en az 2 karakter olmalı." })
        .max(60, { error: "En fazla 60 karakter girilebilir." }),
});

// Kategori listesinden ağaç bilgileri: tam yol ("Notebook › Yedek Parça"), kutu sistemi, alt dallar.
export function kategoriAgaci(kategoriler: UrunKategori[]) {
    const harita = new Map(kategoriler.map((k) => [k.id, k]));

    const zincir = (id: string) => {
        const sonuc: UrunKategori[] = [];
        for (let k = harita.get(id); k && sonuc.length < 20; k = k.ust_id ? harita.get(k.ust_id) : undefined) {
            sonuc.unshift(k);
        }
        return sonuc;
    };

    const yol = (id: string) => zincir(id).map((k) => k.ad).join(" › ");
    const kutulu = (id: string) => zincir(id).some((k) => k.kutu_sistemi);

    // Kategori ve tüm alt kategorileri (liste filtresi için).
    const altlariyla = (id: string) => {
        const sonuc = [id];
        for (let i = 0; i < sonuc.length; i++) {
            for (const k of kategoriler) if (k.ust_id === sonuc[i]) sonuc.push(k.id);
        }
        return sonuc;
    };

    // Seçim listeleri için: yol sırasına göre dizilmiş, derinlik bilgisiyle.
    const sirali = kategoriler
        .map((k) => ({ ...k, yol: yol(k.id), derinlik: zincir(k.id).length - 1 }))
        .toSorted((a, b) => a.yol.localeCompare(b.yol, "tr"));

    return { yol, kutulu, altlariyla, sirali };
}

// ─── Kutular ────────────────────────────────────────────────

export type Kutu = {
    id: string;
    kutu_no: number;
    marka: string;
    model: string;
    konum: string | null;
    notlar: string | null;
    created_at: string;
};

export const kutuSemasi = z.object({
    kutu_no: z
        .string()
        .trim()
        .regex(/^\d{1,6}$/, { error: "Kutu numarası pozitif bir tam sayı olmalı." })
        .refine((v) => Number(v) > 0, { error: "Kutu numarası 0 olamaz." }),
    marka: z.string().trim().min(2, { error: "Marka girin." }).max(60, { error: "En fazla 60 karakter girilebilir." }),
    model: z.string().trim().min(1, { error: "Model girin." }).max(100, { error: "En fazla 100 karakter girilebilir." }),
    konum: opsiyonelMetin(60),
    notlar: opsiyonelMetin(500),
});

export type KutuGirdisi = z.infer<typeof kutuSemasi>;

// Kutu tekilliği veritabanındaki gibi: büyük/küçük harf ve fazla boşluk yok sayılır.
export const kutuAnahtari = (marka: string, model: string) =>
    `${marka} ${model}`.trim().replace(/\s+/g, " ").toLocaleLowerCase("tr");

export const kutuEtiketi = (k: Pick<Kutu, "kutu_no" | "marka" | "model">) => `${k.kutu_no} · ${k.marka} ${k.model}`;

// ─── Ürünler ────────────────────────────────────────────────

export const urunSemasi = z.object({
    kategori_id: z.uuid({ error: "Kategori seçin." }),
    kutu_id: opsiyonelId,
    ad: z.string().trim().min(2, { error: "Ürün adı girin." }).max(150, { error: "En fazla 150 karakter girilebilir." }),
    marka: opsiyonelMetin(60),
    model: opsiyonelMetin(100),
    durum: z.enum(["sifir", "ikinci_el"], { error: "Durum seçin." }),
    seri_no: opsiyonelMetin(100),
    barkod: opsiyonelMetin(50),
    tedarikci_id: opsiyonelId,
    aciklama: opsiyonelMetin(2000),
    // Yalnızca yeni kayıtta kullanılır (ilk giriş hareketi).
    stok_adedi: opsiyonelSayi({ max: 100000, tamSayi: true }),
    satis_fiyati: opsiyonelSayi({ max: 99999999 }),
    alis_fiyati: opsiyonelSayi({ max: 99999999 }),
    kdv_orani: z.union([z.literal(""), z.enum(KDV_ORANLARI.map(String) as [string, ...string[]])]),
    komisyon_orani: opsiyonelSayi({ max: 100 }),
    komisyon_tutari: opsiyonelSayi({ max: 99999999 }),
    kargo_desi: opsiyonelSayi({ max: 99999 }),
    kargo_ucreti: opsiyonelSayi({ max: 99999999 }),
});

export type UrunGirdisi = z.infer<typeof urunSemasi>;

export type Urun = {
    id: string;
    stok_kodu: string;
    kategori_id: string;
    kutu_id: string | null;
    ad: string;
    marka: string | null;
    model: string | null;
    durum: UrunDurumu;
    seri_no: string | null;
    barkod: string | null;
    tedarikci_id: string | null;
    aciklama: string | null;
    satis_fiyati: number | null;
    alis_fiyati: number | null;
    kdv_orani: number | null;
    komisyon_orani: number | null;
    komisyon_tutari: number | null;
    kargo_desi: number | null;
    kargo_ucreti: number | null;
    stok_adedi: number;
    created_at: string;
    updated_at: string;
};

export const stokHareketiSemasi = z.object({
    tip: z.enum(["giris", "cikis", "sayim"], { error: "Hareket tipi seçin." }),
    // giris/cikis: adet; sayim: sayılan gerçek adet
    miktar: z
        .number({ error: "Adet girin." })
        .int({ error: "Tam sayı girin." })
        .min(0, { error: "Adet negatif olamaz." })
        .max(100000, { error: "Adet çok büyük." }),
    aciklama: opsiyonelMetin(300),
});

export type StokHareketi = {
    id: string;
    tip: HareketTipi;
    miktar: number;
    aciklama: string | null;
    created_at: string;
};

// ─── Maliyet hesabı ─────────────────────────────────────────

type MaliyetGirdisi = {
    satis: number | null;
    alis?: number | null;
    kdvOrani?: number | null;
    komisyonOrani?: number | null;
    komisyonTutari?: number | null;
    kargo?: number | null;
};

// Satış fiyatı KDV dahil kabul edilir. Komisyon tutarı girildiyse o, yoksa oran üzerinden hesaplanır.
export function maliyetHesapla({ satis, alis, kdvOrani, komisyonOrani, komisyonTutari, kargo }: MaliyetGirdisi) {
    const fiyat = satis ?? 0;
    const kdv = kdvOrani ? fiyat - fiyat / (1 + kdvOrani / 100) : 0;
    const komisyon = komisyonTutari ?? (komisyonOrani ? (fiyat * komisyonOrani) / 100 : 0);
    const kargoUcreti = kargo ?? 0;
    const net = fiyat - kdv - komisyon - kargoUcreti;
    const kar = alis != null ? net - alis : null;
    const marj = kar != null && fiyat > 0 ? (kar / fiyat) * 100 : null;
    return { kdv, komisyon, kargo: kargoUcreti, net, kar, marj };
}
