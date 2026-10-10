// src/lib/schemas/icerik.ts
// Site içerikleri ve blog için ortak şemalar ve tipler (admin formu + action + vitrin).
import { z } from "zod";
import { opsiyonelMetin, telefonAlani } from "./ortak";

// ─── Yardımcılar ────────────────────────────────────────────

// "Notebook Ekranı Nasıl Değişir?" → "notebook-ekrani-nasil-degisir"
export function slugUret(metin: string) {
    const harfler: Record<string, string> = { ç: "c", ğ: "g", ı: "i", i̇: "i", ö: "o", ş: "s", ü: "u", â: "a", î: "i", û: "u" };
    return metin
        .toLocaleLowerCase("tr")
        .replace(/i̇|[çğıöşüâîû]/g, (h) => harfler[h] ?? h)
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80)
        .replace(/-+$/, "");
}

const SLUG_DESENI = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// Görsel: sitedeki dosya ("/about/x.png") ya da yüklenen görselin tam adresi (https://...).
const gorselAlani = z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || v.startsWith("/") || /^https:\/\//.test(v), { error: "Geçerli bir görsel seçin." });

const linkAlani = z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || v.startsWith("/") || /^https?:\/\//.test(v), { error: "Link / veya https:// ile başlamalı." });

// ─── Site içerikleri ────────────────────────────────────────

export const iletisimSemasi = z.object({
    telefonlar: z
        .array(telefonAlani.refine((v) => v !== "", { error: "Telefon girin." }))
        .min(1, { error: "En az bir telefon girin." })
        .max(5),
    whatsapp: z
        .string()
        .trim()
        .refine((v) => v === "" || /^\d{10,15}$/.test(v), { error: "Ülke koduyla, yalnızca rakam girin (örn. 905051234567)." }),
    eposta: z.union([z.literal(""), z.email({ error: "Geçerli bir e-posta girin." })]),
    adres: opsiyonelMetin(300),
    harita_url: z
        .string()
        .trim()
        .refine((v) => v === "" || v.startsWith("https://www.google.com/maps/embed"), {
            error: "Google Haritalar → Paylaş → Harita yerleştir bağlantısındaki src adresini girin.",
        }),
    instagram: linkAlani,
    linkedin: linkAlani,
    sahibinden: linkAlani,
});

export const bankaHesaplariSemasi = z.object({
    hesaplar: z
        .array(
            z.object({
                logo: gorselAlani,
                hesap_adi: z.string().trim().min(2, { error: "Hesap adı girin." }).max(100),
                sube: opsiyonelMetin(100),
                hesap_no: opsiyonelMetin(30),
                iban: z.string().trim().min(10, { error: "IBAN girin." }).max(40, { error: "IBAN çok uzun." }),
            })
        )
        .max(12),
});

export const hakkimizdaSemasi = z.object({
    biz_kimiz: z.string().max(20000),
    misyon: opsiyonelMetin(1500),
    vizyon: opsiyonelMetin(1500),
    gorsel: gorselAlani,
});

export const sliderSemasi = z.object({
    slaytlar: z
        .array(
            z.object({
                gorsel: gorselAlani.refine((v) => v !== "", { error: "Görsel seçin." }),
                aciklama: opsiyonelMetin(150), // görselin alternatif metni
                link: linkAlani,
            })
        )
        .min(1, { error: "En az bir slayt olmalı." })
        .max(10, { error: "En fazla 10 slayt eklenebilir." }),
});

export const yasalSayfaSemasi = z.object({
    baslik: z.string().trim().min(3, { error: "Başlık girin." }).max(150),
    icerik: z.string().max(100000),
});

export type Iletisim = z.infer<typeof iletisimSemasi>;
export type BankaHesaplari = z.infer<typeof bankaHesaplariSemasi>;
export type Hakkimizda = z.infer<typeof hakkimizdaSemasi>;
export type Slider = z.infer<typeof sliderSemasi>;
export type YasalSayfa = z.infer<typeof yasalSayfaSemasi>;

// Anahtar → şema, panel başlığı ve vitrinde yenilenecek sayfa.
export const SITE_ICERIKLERI = {
    iletisim: { sema: iletisimSemasi, baslik: "İletişim Bilgileri", aciklama: "Header, footer, İletişim ve Hakkımızda sayfalarında kullanılır.", yol: "/" },
    banka_hesaplari: { sema: bankaHesaplariSemasi, baslik: "Banka Hesapları", aciklama: "Hakkımızda sayfasındaki banka hesapları ve IBAN'lar.", yol: "/public/about" },
    hakkimizda: { sema: hakkimizdaSemasi, baslik: "Hakkımızda", aciklama: "Biz kimiz metni, misyon, vizyon ve görsel.", yol: "/public/about" },
    anasayfa_slider: { sema: sliderSemasi, baslik: "Anasayfa Slider", aciklama: "Anasayfanın üstündeki kayan görseller.", yol: "/" },
    kvkk: { sema: yasalSayfaSemasi, baslik: "KVKK Aydınlatma Metni", aciklama: "/kvkk sayfası", yol: "/kvkk" },
    gizlilik: { sema: yasalSayfaSemasi, baslik: "Gizlilik Politikası", aciklama: "/gizlilik-politikasi sayfası", yol: "/gizlilik-politikasi" },
    iade: { sema: yasalSayfaSemasi, baslik: "İade ve Değişim Politikası", aciklama: "/iade-ve-degisim-politikasi sayfası", yol: "/iade-ve-degisim-politikasi" },
    mesafeli: { sema: yasalSayfaSemasi, baslik: "Mesafeli Satış Sözleşmesi", aciklama: "/mesafeli-satis-sozlesmesi sayfası", yol: "/mesafeli-satis-sozlesmesi" },
} as const;

export type SiteIcerikAnahtari = keyof typeof SITE_ICERIKLERI;

export type SiteIcerikleri = {
    iletisim: Iletisim;
    banka_hesaplari: BankaHesaplari;
    hakkimizda: Hakkimizda;
    anasayfa_slider: Slider;
    kvkk: YasalSayfa;
    gizlilik: YasalSayfa;
    iade: YasalSayfa;
    mesafeli: YasalSayfa;
};

export const icerikAnahtariMi = (v: string): v is SiteIcerikAnahtari => v in SITE_ICERIKLERI;
export const YASAL_ANAHTARLAR = ["kvkk", "gizlilik", "iade", "mesafeli"] as const;

// ─── Blog ───────────────────────────────────────────────────

export const BLOG_DURUMLARI = {
    taslak: { etiket: "Taslak", renk: "bg-gray-100 text-gray-600" },
    yayinda: { etiket: "Yayında", renk: "bg-green-50 text-green-700" },
} as const;

export type BlogDurumu = keyof typeof BLOG_DURUMLARI;

export const blogKategoriSemasi = z.object({
    ad: z.string().trim().min(2, { error: "Kategori adı en az 2 karakter olmalı." }).max(50),
});

export const blogYazisiSemasi = z.object({
    baslik: z.string().trim().min(3, { error: "Başlık girin." }).max(150, { error: "En fazla 150 karakter." }),
    slug: z
        .string()
        .trim()
        .min(3, { error: "Adres (slug) girin." })
        .max(80)
        .regex(SLUG_DESENI, { error: "Yalnızca küçük harf, rakam ve tire kullanın (örn. ekran-degisimi)." }),
    ozet: opsiyonelMetin(300),
    kapak_gorsel_url: gorselAlani,
    icerik: z.string().max(200000),
    kategori_id: z.union([z.literal(""), z.uuid({ error: "Geçersiz kategori." })]),
    durum: z.enum(["taslak", "yayinda"]),
    // datetime-local ("2026-10-10T14:30"), Türkiye saati
    yayin_tarihi: z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, { error: "Geçerli bir tarih girin." })]),
    seo_baslik: opsiyonelMetin(70),
    seo_aciklama: opsiyonelMetin(160),
});

export type BlogYazisiGirdisi = z.infer<typeof blogYazisiSemasi>;

export type BlogKategori = { id: string; ad: string; slug: string };

export type BlogYazisi = {
    id: string;
    baslik: string;
    slug: string;
    ozet: string | null;
    kapak_gorsel_url: string | null;
    icerik: string;
    kategori_id: string | null;
    durum: BlogDurumu;
    yayin_tarihi: string | null;
    seo_baslik: string | null;
    seo_aciklama: string | null;
    created_at: string;
    updated_at: string;
};

// "0 (312) 431 02 64" → "tel:03124310264"
export const telLinki = (telefon: string) => `tel:${telefon.replace(/[^\d+]/g, "")}`;
