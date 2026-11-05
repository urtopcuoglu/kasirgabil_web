// src/lib/donanim-puanlari.ts
// UserBenchmark donanım puanları: resmi CSV dosyalarının yüklenmesi ve stoktaki ürünlerle eşleştirme.
// Kaynak: https://www.userbenchmark.com/page/developer — yalnızca bu resmi dosyalar okunur; ürün sayfaları taranmaz
// (sitenin robots.txt dosyası genel botları yasaklar). Tablolar: migration 20261105130000_donanim_puanlari.sql.
import type { SupabaseClient } from "@supabase/supabase-js";
import { aramaMetni } from "@/lib/schemas/ortak";

export const DONANIM_TURLERI = {
    CPU: "İşlemci (CPU)",
    GPU: "Ekran Kartı (GPU)",
    SSD: "SSD",
    HDD: "HDD",
    RAM: "RAM",
    USB: "USB Bellek / Disk",
} as const;
export type DonanimTuru = keyof typeof DONANIM_TURLERI;
export const DONANIM_TUR_LISTESI = Object.keys(DONANIM_TURLERI) as DonanimTuru[];

export type DonanimPuani = {
    id: string;
    tur: DonanimTuru;
    url: string;
    marka: string;
    model: string;
    parca_nolar: string[];
    varyantlar: string[];
    sira: number | null;
    puan: number | null;
    ornek: number | null;
    son_gorulme: string;
};

export type DonanimGecmisi = { puan_id: string; sira: number | null; puan: number | null; ornek: number | null; tarih: string };

export const donanimEtiketi = (p: Pick<DonanimPuani, "marka" | "model">) =>
    // GPU/CPU modelleri çoğu zaman markayı zaten içerir ("Asus RTX 4090 ..."); tekrar yazılmaz.
    aramaMetni(p.model).startsWith(aramaMetni(p.marka)) ? p.model : `${p.marka} ${p.model}`;

// ─── CSV yükleme ────────────────────────────────────────────

const CSV_ADRESI = (tur: DonanimTuru) => `https://www.userbenchmark.com/resources/download/csv/${tur}_UserBenchmarks.csv`;
const BEKLENEN_BASLIK = ["Type", "Part Number", "Brand", "Model", "Rank", "Benchmark", "Samples", "URL"];
const UB_ADRESI = /^https:\/\/([a-z]+\.)?userbenchmark\.com\//;

// Tırnaklı alanları ve tırnak içindeki virgül/satır sonlarını destekleyen küçük CSV okuyucu.
// Tırnak yalnızca alanın başındaysa açılış sayılır; alan ortasındaki tırnak (örn. 2.5" disk) metindir.
export function csvOku(metin: string): string[][] {
    const satirlar: string[][] = [];
    let satir: string[] = [];
    let alan = "";
    let tirnakta = false;
    for (let i = 0; i < metin.length; i++) {
        const k = metin[i];
        if (tirnakta) {
            if (k === '"' && metin[i + 1] === '"') {
                alan += '"';
                i++;
            } else if (k === '"') tirnakta = false;
            else alan += k;
        } else if (k === '"' && alan === "") tirnakta = true;
        else if (k === ",") {
            satir.push(alan);
            alan = "";
        } else if (k === "\n" || k === "\r") {
            if (k === "\r" && metin[i + 1] === "\n") i++;
            satir.push(alan);
            if (satir.some((a) => a !== "")) satirlar.push(satir);
            satir = [];
            alan = "";
        } else alan += k;
    }
    satir.push(alan);
    if (satir.some((a) => a !== "")) satirlar.push(satir);
    return satirlar;
}

type YuklenecekKayit = Omit<DonanimPuani, "id">;

// Aynı URL'deki satırlar tek kayıt olur: ilk satır asıl ürün (GPU'da çip), diğerleri varyant.
export function csvKayitlari(tur: DonanimTuru, metin: string, zaman: string): YuklenecekKayit[] {
    const [baslik, ...satirlar] = csvOku(metin.replace(/^﻿/, ""));
    if (!baslik || BEKLENEN_BASLIK.some((b, i) => baslik[i]?.trim() !== b)) {
        throw new Error(`${tur} dosyasının biçimi beklenenden farklı (sütunlar değişmiş olabilir).`);
    }
    const sayi = (v: string, tam: boolean) => {
        const n = tam ? Number.parseInt(v, 10) : Number.parseFloat(v);
        return Number.isFinite(n) ? n : null;
    };

    const kayitlar = new Map<string, YuklenecekKayit>();
    for (const [, parcaNo, marka, model, sira, puan, ornek, url] of satirlar) {
        const adres = url?.trim();
        if (!adres || !UB_ADRESI.test(adres) || !model?.trim()) continue;
        const pn = parcaNo?.trim();
        const mevcut = kayitlar.get(adres);
        if (mevcut) {
            if (pn && !mevcut.parca_nolar.includes(pn)) mevcut.parca_nolar.push(pn);
            const ad = model.trim();
            if (ad !== mevcut.model && !mevcut.varyantlar.includes(ad)) mevcut.varyantlar.push(ad);
            continue;
        }
        kayitlar.set(adres, {
            tur,
            url: adres,
            marka: marka?.trim() || "—",
            model: model.trim(),
            parca_nolar: pn ? [pn] : [],
            varyantlar: [],
            sira: sayi(sira ?? "", true),
            puan: sayi(puan ?? "", false),
            ornek: sayi(ornek ?? "", true),
            son_gorulme: zaman,
        });
    }
    return [...kayitlar.values()];
}

export type GuncellemeSonucu = { basarili: boolean; ozet: Partial<Record<DonanimTuru, number>>; hata?: string };

// Altı dosyayı indirip veritabanına yazar. Bir dosya alınamazsa diğerleri yine yüklenir; sonuç kayıt altına alınır.
// Sıra/puan değişiklikleri veritabanı tetikleyicisiyle geçmiş tablosuna yazılır.
export async function donanimPuanlariniGuncelle(supabase: SupabaseClient, kaynak: "zamanlanmis" | "elle"): Promise<GuncellemeSonucu> {
    const zaman = new Date().toISOString();
    const ozet: GuncellemeSonucu["ozet"] = {};
    const hatalar: string[] = [];

    await Promise.all(
        DONANIM_TUR_LISTESI.map(async (tur) => {
            try {
                const yanit = await fetch(CSV_ADRESI(tur), {
                    headers: { "User-Agent": "KasirgaBilgisayarPanel/1.0 (+userbenchmark developer CSV)" },
                    cache: "no-store",
                    signal: AbortSignal.timeout(30_000),
                });
                if (!yanit.ok) throw new Error(`${tur} dosyası indirilemedi (HTTP ${yanit.status}).`);
                const kayitlar = csvKayitlari(tur, await yanit.text(), zaman);
                if (kayitlar.length === 0) throw new Error(`${tur} dosyası boş geldi.`);
                for (let i = 0; i < kayitlar.length; i += 500) {
                    const { error } = await supabase.from("donanim_puanlari").upsert(kayitlar.slice(i, i + 500), { onConflict: "url" });
                    if (error) throw new Error(`${tur} kaydedilemedi: ${error.message}`);
                }
                ozet[tur] = kayitlar.length;
            } catch (e) {
                hatalar.push(e instanceof Error ? e.message : `${tur}: bilinmeyen hata`);
            }
        }),
    );

    const sonuc: GuncellemeSonucu = { basarili: hatalar.length === 0, ozet, hata: hatalar.join(" ") || undefined };
    const { error } = await supabase
        .from("donanim_guncellemeleri")
        .insert({ kaynak, basarili: sonuc.basarili, ozet, hata: sonuc.hata ?? null });
    if (error) console.error("[donanimPuanlariniGuncelle] kayıt yazılamadı:", error.message);
    return sonuc;
}

// ─── Okuma ──────────────────────────────────────────────────

export const DONANIM_SUTUNLARI = "id, tur, url, marka, model, parca_nolar, varyantlar, sira, puan, ornek, son_gorulme";

// Eşleştirme için tüm kayıtlar (yaklaşık 4-5 bin). PostgREST tek istekte en fazla 1000 satır döndürür.
export async function tumDonanimPuanlari(supabase: SupabaseClient) {
    const SAYFA = 1000;
    const sonuc: DonanimPuani[] = [];
    for (let bas = 0; ; bas += SAYFA) {
        const { data } = await supabase.from("donanim_puanlari").select(DONANIM_SUTUNLARI).order("id").range(bas, bas + SAYFA - 1);
        sonuc.push(...((data ?? []) as DonanimPuani[]));
        if (!data || data.length < SAYFA) return sonuc;
    }
}

// ─── Stok eşleştirme ────────────────────────────────────────

const sikistir = (s: string) => aramaMetni(s).replace(/[^a-z0-9]/g, "");

// Bir kaydın ürün metninde aranacak anahtarları: tam model ("corei78550u") ve ilk kelimesiz hali ("i78550u").
// Kısa veya rakamsız anahtarlar yanlış eşleşme üretir, alınmaz.
function anahtarlar(p: Pick<DonanimPuani, "model" | "varyantlar">) {
    const sonuc = new Set<string>();
    const ekle = (s: string, enAz: number) => {
        const k = sikistir(s);
        if (k.length >= enAz && /\d/.test(k)) sonuc.add(k);
    };
    for (const model of [p.model, ...p.varyantlar]) {
        ekle(model, 5);
        const kelimeler = model.trim().split(/\s+/);
        if (kelimeler.length >= 2) ekle(kelimeler.slice(1).join(" "), 6);
    }
    return [...sonuc];
}

export type DonanimEslestirici = (metin: string) => DonanimPuani | null;

// Ürün metnine (marka + model + ad) en iyi uyan kayıt: en uzun anahtar, eşitse en çok test yapılmış olan.
// Yalnızca öneridir; panelde elle onaylanır veya değiştirilir.
export function donanimEslestirici(puanlar: DonanimPuani[]): DonanimEslestirici {
    const liste = puanlar.flatMap((p) => anahtarlar(p).map((anahtar) => ({ anahtar, p })));
    return (metin) => {
        const hedef = sikistir(metin);
        if (hedef.length < 5) return null;
        let en: { anahtar: string; p: DonanimPuani } | null = null;
        for (const aday of liste) {
            if (!hedef.includes(aday.anahtar)) continue;
            if (
                !en ||
                aday.anahtar.length > en.anahtar.length ||
                (aday.anahtar.length === en.anahtar.length && (aday.p.ornek ?? 0) > (en.p.ornek ?? 0))
            ) {
                en = aday;
            }
        }
        return en?.p ?? null;
    };
}

export const urunEslesmeMetni = (u: { marka: string | null; model: string | null; ad: string }) => `${u.marka ?? ""} ${u.model ?? ""} ${u.ad}`;

// Tek ürün için öneri (ürün sayfası): tüm kayıtları çekmek yerine ürün metnindeki 3+ haneli rakam gruplarını
// ("8250", "1050") içeren adaylar veritabanından alınır, eşleştirici yalnızca onlarda çalışır.
export async function donanimOnerisi(supabase: SupabaseClient, metin: string): Promise<DonanimPuani | null> {
    const rakamlar = [...new Set(metin.match(/\d{3,}/g) ?? [])].slice(0, 6);
    if (rakamlar.length === 0) return null;
    const { data } = await supabase
        .from("donanim_puanlari")
        .select(DONANIM_SUTUNLARI)
        .or(rakamlar.map((r) => `arama.like.*${r}*`).join(","))
        .limit(1000);
    return donanimEslestirici((data ?? []) as DonanimPuani[])(metin);
}
