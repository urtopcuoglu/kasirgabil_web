// src/lib/kasa-analiz.ts
// Özet sayfasındaki satış ve kasa analizi: seçilen dönemin (bugün / son 7 gün / son 30 gün / son 12 ay) grafik
// verileri, gelir-gider-yöntem toplamları, kategori ve marka sıralamaları. Her dönem eşit uzunluktaki önceki
// dönemle karşılaştırılır. Satış = "Satış" (kod: satis) kategorisindeki gelir hareketleri.
import type { SupabaseClient } from "@supabase/supabase-js";
import { KATEGORI_KODLARI, type KasaTipi, type OdemeYontemi } from "@/lib/schemas/kasa";
import { adAnahtari } from "@/lib/schemas/ortak";
import { kategoriAgaci, type UrunKategori } from "@/lib/schemas/stok";
import { bugunISO, gunEkle } from "@/lib/tarih";

// Karşılaştırılan dönemin cümle içindeki halleri: "düne göre", "dünle aynı", "dün kayıt yoktu".
export const DONEMLER = {
    gun: { etiket: "Bugün", yonelme: "düne", ile: "dünle", bulunma: "dün" },
    hafta: { etiket: "Son 7 gün", yonelme: "önceki 7 güne", ile: "önceki 7 günle", bulunma: "önceki 7 günde" },
    ay: { etiket: "Son 30 gün", yonelme: "önceki 30 güne", ile: "önceki 30 günle", bulunma: "önceki 30 günde" },
    yil: { etiket: "Son 12 ay", yonelme: "önceki 12 aya", ile: "önceki 12 ayla", bulunma: "önceki 12 ayda" },
} as const;
export type Donem = keyof typeof DONEMLER;
export const DONEM_LISTESI = Object.keys(DONEMLER) as Donem[];

const SAAT_DILIMI = "Europe/Istanbul";
const AYLAR = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
const GUNLER = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

export type Kova = { anahtar: string; etiket: string; uzunEtiket: string };

// Dönemin gün aralığı (bas..son dahil), önceki dönem ve grafik kovaları.
export function donemAraligi(donem: Donem, bugun = bugunISO()) {
    const gunEtiketi = (g: string) => `${g.slice(8, 10)}.${g.slice(5, 7)}`;
    const haftaGunu = (g: string) => GUNLER[new Date(`${g}T00:00:00Z`).getUTCDay()];

    if (donem === "gun") {
        return {
            bas: bugun,
            son: bugun,
            oncekiBas: gunEkle(bugun, -1),
            oncekiSon: gunEkle(bugun, -1),
            // Bugün saat saat (hareketin kayıt saatine göre).
            kovalar: Array.from({ length: 24 }, (_, s): Kova => {
                const saat = String(s).padStart(2, "0");
                return { anahtar: saat, etiket: saat, uzunEtiket: `${saat}:00 – ${saat}:59` };
            }),
        };
    }
    if (donem === "yil") {
        const [yil, ay] = bugun.split("-").map(Number);
        const aylar = Array.from({ length: 12 }, (_, i) => {
            const d = new Date(Date.UTC(yil, ay - 1 - 11 + i, 1));
            return { y: d.getUTCFullYear(), m: d.getUTCMonth() };
        });
        const ilk = aylar[0];
        const bas = `${ilk.y}-${String(ilk.m + 1).padStart(2, "0")}-01`;
        const onceki = new Date(Date.UTC(ilk.y - 1, ilk.m, 1));
        return {
            bas,
            son: bugun,
            oncekiBas: onceki.toISOString().slice(0, 10),
            oncekiSon: gunEkle(bas, -1),
            kovalar: aylar.map(({ y, m }): Kova => ({
                anahtar: `${y}-${String(m + 1).padStart(2, "0")}`,
                etiket: AYLAR[m],
                uzunEtiket: `${AYLAR[m]} ${y}`,
            })),
        };
    }
    const uzunluk = donem === "hafta" ? 7 : 30;
    const bas = gunEkle(bugun, -(uzunluk - 1));
    return {
        bas,
        son: bugun,
        oncekiBas: gunEkle(bas, -uzunluk),
        oncekiSon: gunEkle(bas, -1),
        kovalar: Array.from({ length: uzunluk }, (_, i): Kova => {
            const g = gunEkle(bas, i);
            return {
                anahtar: g,
                etiket: donem === "hafta" ? haftaGunu(g) : gunEtiketi(g),
                uzunEtiket: `${gunEtiketi(g)}.${g.slice(0, 4)} ${haftaGunu(g)}`,
            };
        }),
    };
}

type HareketSatiri = {
    tarih: string;
    created_at: string;
    tip: KasaTipi;
    yontem: OdemeYontemi;
    tutar: number | string;
    urun_adet: number | null;
    kasa_kategorileri: { kod: string | null } | null;
    urunler: { id: string; ad: string; marka: string | null; kategori_id: string; alis_fiyati: number | string | null } | null;
};

const saatAl = (iso: string) =>
    new Intl.DateTimeFormat("en-GB", { timeZone: SAAT_DILIMI, hour: "2-digit", hourCycle: "h23" }).format(new Date(iso));

export type Toplamlar = {
    satis: number;
    satisSayisi: number;
    satisAdedi: number;
    gelir: number;
    gider: number;
    servis: number;
    gelenNakit: number;
    gelenKrediKarti: number;
    cikanNakit: number;
    yontemler: Record<OdemeYontemi, number>; // gelirin ödeme yöntemine göre dağılımı
    brutKar: number; // alış fiyatı girilmiş ürün satışlarında: tutar - alış × adet
    karKapsami: number; // brüt kâr hesabına giren satış tutarı
};

const bosToplam = (): Toplamlar => ({
    satis: 0,
    satisSayisi: 0,
    satisAdedi: 0,
    gelir: 0,
    gider: 0,
    servis: 0,
    gelenNakit: 0,
    gelenKrediKarti: 0,
    cikanNakit: 0,
    yontemler: { nakit: 0, kredi_karti: 0, banka_karti: 0, havale_eft: 0 },
    brutKar: 0,
    karKapsami: 0,
});

export type SiraKalemi = { ad: string; tutar: number; adet: number; aciklama?: string };

// Dönem + önceki dönemdeki hareketler (PostgREST tek istekte en fazla 1000 satır döndürür).
async function hareketleriOku(supabase: SupabaseClient, bas: string, son: string) {
    const sonuc: HareketSatiri[] = [];
    for (let i = 0; ; i += 1000) {
        const { data, error } = await supabase
            .from("kasa_hareketleri")
            .select("tarih, created_at, tip, yontem, tutar, urun_adet, kasa_kategorileri(kod), urunler(id, ad, marka, kategori_id, alis_fiyati)")
            .gte("tarih", bas)
            .lte("tarih", son)
            .order("id")
            .range(i, i + 999);
        if (error) throw new Error(error.message);
        sonuc.push(...((data ?? []) as unknown as HareketSatiri[]));
        if (!data || data.length < 1000) return sonuc;
    }
}

export async function kasaAnalizi(supabase: SupabaseClient, donem: Donem) {
    const aralik = donemAraligi(donem);
    const [hareketler, kategoriSonucu, stokSonucu] = await Promise.all([
        hareketleriOku(supabase, aralik.oncekiBas, aralik.son),
        supabase.from("urun_kategorileri").select("id, ad, ust_id, kutu_sistemi"),
        stokDegeriOku(supabase),
    ]);
    const agac = kategoriAgaci((kategoriSonucu.data ?? []) as UrunKategori[]);

    const simdi = bosToplam();
    const onceki = bosToplam();
    const grafik = new Map(aralik.kovalar.map((k) => [k.anahtar, { satis: 0, gelir: 0, gider: 0 }]));
    const kategoriler = new Map<string, SiraKalemi>();
    const markalar = new Map<string, SiraKalemi>();
    const urunler = new Map<string, SiraKalemi>();

    for (const h of hareketler) {
        const tutar = Number(h.tutar);
        const buDonem = h.tarih >= aralik.bas;
        const t = buDonem ? simdi : onceki;
        const kod = h.kasa_kategorileri?.kod;
        const satis = h.tip === "gelir" && kod === KATEGORI_KODLARI.satis;

        if (h.tip === "gelir") {
            t.gelir += tutar;
            t.yontemler[h.yontem] += tutar;
            if (h.yontem === "nakit") t.gelenNakit += tutar;
            if (h.yontem === "kredi_karti") t.gelenKrediKarti += tutar;
            if (kod === KATEGORI_KODLARI.servis) t.servis += tutar;
        } else {
            t.gider += tutar;
            if (h.yontem === "nakit") t.cikanNakit += tutar;
        }

        if (satis) {
            const adet = h.urun_adet ?? 1;
            t.satis += tutar;
            t.satisSayisi += 1;
            t.satisAdedi += adet;
            const alis = h.urunler?.alis_fiyati;
            if (alis != null) {
                t.brutKar += tutar - Number(alis) * adet;
                t.karKapsami += tutar;
            }
        }

        if (!buDonem) continue;

        // Grafik kovası: bugünse kayıt saati, yıllıkta ay, diğerlerinde gün.
        const anahtar = donem === "gun" ? saatAl(h.created_at) : donem === "yil" ? h.tarih.slice(0, 7) : h.tarih;
        const kova = grafik.get(anahtar);
        if (kova) {
            if (h.tip === "gelir") kova.gelir += tutar;
            else kova.gider += tutar;
            if (satis) kova.satis += tutar;
        }

        // Kategori / marka / ürün sıralaması: ürüne bağlı satışlar.
        if (satis && h.urunler) {
            const adet = h.urun_adet ?? 1;
            const ekle = (harita: Map<string, SiraKalemi>, anahtar: string, ad: string, aciklama?: string) => {
                const k = harita.get(anahtar) ?? { ad, tutar: 0, adet: 0, aciklama };
                k.tutar += tutar;
                k.adet += adet;
                harita.set(anahtar, k);
            };
            const yol = agac.yol(h.urunler.kategori_id);
            ekle(kategoriler, h.urunler.kategori_id, yol.split(" › ").pop() || "—", yol);
            if (h.urunler.marka?.trim()) ekle(markalar, adAnahtari(h.urunler.marka), h.urunler.marka.trim());
            ekle(urunler, h.urunler.id, h.urunler.ad);
        }
    }

    // En çok → en az (tutara göre; eşitse adede göre).
    const sirala = (harita: Map<string, SiraKalemi>) => [...harita.values()].toSorted((a, b) => b.tutar - a.tutar || b.adet - a.adet);

    return {
        donem,
        aralik,
        simdi,
        onceki,
        grafik: aralik.kovalar.map((k) => ({ ...k, ...grafik.get(k.anahtar)! })),
        kategoriler: sirala(kategoriler),
        markalar: sirala(markalar),
        urunler: sirala(urunler),
        stok: stokSonucu,
    };
}

export type KasaAnalizi = Awaited<ReturnType<typeof kasaAnalizi>>;

// Stoktaki malın alış ve satış fiyatıyla değeri (dönemden bağımsız). Fiyatı girilmemiş ürünler değere katılmaz.
async function stokDegeriOku(supabase: SupabaseClient) {
    // alisFiyatsiz / satisFiyatsiz: o fiyatı girilmemiş (değere katılmayan) stoktaki ürün sayısı.
    const sonuc = { alis: 0, satis: 0, alisFiyatsiz: 0, satisFiyatsiz: 0 };
    for (let i = 0; ; i += 1000) {
        const { data } = await supabase
            .from("urunler")
            .select("stok_adedi, alis_fiyati, satis_fiyati")
            .gt("stok_adedi", 0)
            .order("id")
            .range(i, i + 999);
        for (const u of (data ?? []) as { stok_adedi: number; alis_fiyati: number | null; satis_fiyati: number | null }[]) {
            if (u.alis_fiyati != null) sonuc.alis += Number(u.alis_fiyati) * u.stok_adedi;
            else sonuc.alisFiyatsiz += 1;
            if (u.satis_fiyati != null) sonuc.satis += Number(u.satis_fiyati) * u.stok_adedi;
            else sonuc.satisFiyatsiz += 1;
        }
        if (!data || data.length < 1000) return sonuc;
    }
}
