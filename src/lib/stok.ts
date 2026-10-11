// src/lib/stok.ts
// Stok sayfalarının sunucu tarafı veri yükleyicileri.
import type { SupabaseClient } from "@supabase/supabase-js";
import { TEDARIKCI_KODU, type RehberKisi } from "@/lib/schemas/rehber";
import { kategoriAgaci, type Kutu, type Urun, type UrunKategori } from "@/lib/schemas/stok";

// Ürün formundaki seçim listeleri: kategoriler, kutular ve tedarikçi kategorisindeki rehber kişileri.
export async function urunFormuVerisi(supabase: SupabaseClient) {
    const [kategoriler, kutular, tedarikciler] = await Promise.all([
        supabase.from("urun_kategorileri").select("id, ad, ust_id, kutu_sistemi"),
        supabase.from("kutular").select("id, kutu_no, marka, model").order("kutu_no"),
        supabase
            .from("rehber_kisiler")
            .select("id, ad_soyad_unvan, firma, rehber_kategorileri!inner(kod)")
            .eq("rehber_kategorileri.kod", TEDARIKCI_KODU)
            .order("ad_soyad_unvan"),
    ]);

    return {
        kategoriler: (kategoriler.data ?? []) as UrunKategori[],
        kutular: (kutular.data ?? []) as Pick<Kutu, "id" | "kutu_no" | "marka" | "model">[],
        tedarikciler: (tedarikciler.data ?? []) as Pick<RehberKisi, "id" | "ad_soyad_unvan" | "firma">[],
    };
}

// ─── Özet sayfası stok metrikleri ───────────────────────────

// Metriklerin dayandığı kategori dalları (tam yol). Kategori adı değişirse burası güncellenir.
const OZET_DALLARI = {
    notebookModel: "Bilgisayar › Dizüstü › Modeller",
    pcModel: "Bilgisayar › Masaüstü › Modeller",
    notebookIslemci: "Bilgisayar › Dizüstü › Donanım › İşlemci CPU",
    notebookRam: "Bilgisayar › Dizüstü › Donanım › RAM",
    pcIslemci: "Bilgisayar › Masaüstü › Donanım › İşlemci CPU",
    pcRam: "Bilgisayar › Masaüstü › Donanım › RAM",
} as const;

export type OzetDali = keyof typeof OZET_DALLARI;

type StoktakiUrun = Pick<Urun, "id" | "stok_kodu" | "ad" | "marka" | "kategori_id" | "stok_adedi">;

// Bir dalın (alt kategorileriyle) stoktaki çeşit ve toplam adet sayısı. kategoriId yoksa dal bulunamamıştır.
export type DalOzeti = { kategoriId: string | null; cesit: number; adet: number };

// Stokta bulunan ürünlerden özet metrikleri: en çok stoklu ürün ve marka, PC/notebook model,
// işlemci ve RAM sayıları, en çok stoklu notebook işlemci markası.
export async function stokOzeti(supabase: SupabaseClient) {
    const [kategoriSonucu, urunler] = await Promise.all([
        supabase.from("urun_kategorileri").select("id, ad, ust_id, kutu_sistemi"),
        stoktakiUrunler(supabase),
    ]);
    const agac = kategoriAgaci((kategoriSonucu.data ?? []) as UrunKategori[]);

    const dallar = Object.fromEntries(
        (Object.keys(OZET_DALLARI) as OzetDali[]).map((anahtar) => {
            const kategori = agac.sirali.find((k) => k.yol === OZET_DALLARI[anahtar]);
            const kapsam = new Set(kategori ? agac.altlariyla(kategori.id) : []);
            const dalUrunleri = urunler.filter((u) => kapsam.has(u.kategori_id));
            return [anahtar, { kategoriId: kategori?.id ?? null, urunler: dalUrunleri }];
        }),
    ) as Record<OzetDali, { kategoriId: string | null; urunler: StoktakiUrun[] }>;

    const ozet = (anahtar: OzetDali): DalOzeti => ({
        kategoriId: dallar[anahtar].kategoriId,
        cesit: dallar[anahtar].urunler.length,
        adet: toplamAdet(dallar[anahtar].urunler),
    });

    return {
        cesit: urunler.length,
        adet: toplamAdet(urunler),
        enCokUrun: urunler.reduce<StoktakiUrun | null>((en, u) => (!en || u.stok_adedi > en.stok_adedi ? u : en), null),
        enCokMarka: enCokStokluMarka(urunler),
        notebookIslemciMarkasi: enCokStokluMarka(dallar.notebookIslemci.urunler),
        dallar: Object.fromEntries((Object.keys(OZET_DALLARI) as OzetDali[]).map((a) => [a, ozet(a)])) as Record<OzetDali, DalOzeti>,
    };
}

// Stok adedi 0'dan büyük tüm ürünler. PostgREST tek istekte en fazla 1000 satır döndürdüğü için sayfa sayfa okunur.
async function stoktakiUrunler(supabase: SupabaseClient) {
    const SAYFA = 1000;
    const sonuc: StoktakiUrun[] = [];
    for (let bas = 0; ; bas += SAYFA) {
        const { data } = await supabase
            .from("urunler")
            .select("id, stok_kodu, ad, marka, kategori_id, stok_adedi")
            .gt("stok_adedi", 0)
            .order("id")
            .range(bas, bas + SAYFA - 1);
        sonuc.push(...((data ?? []) as StoktakiUrun[]));
        if (!data || data.length < SAYFA) return sonuc;
    }
}

const toplamAdet = (urunler: StoktakiUrun[]) => urunler.reduce((t, u) => t + u.stok_adedi, 0);

// Markaya göre toplam stok; büyük/küçük harf ve fazla boşluk farkı aynı marka sayılır. Markasız ürünler sayılmaz.
function enCokStokluMarka(urunler: StoktakiUrun[]) {
    const markalar = new Map<string, { ad: string; adet: number; cesit: number }>();
    for (const u of urunler) {
        const ad = u.marka?.trim().replace(/\s+/g, " ");
        if (!ad) continue;
        const anahtar = ad.toLocaleLowerCase("tr");
        const m = markalar.get(anahtar) ?? { ad, adet: 0, cesit: 0 };
        m.adet += u.stok_adedi;
        m.cesit += 1;
        markalar.set(anahtar, m);
    }
    return [...markalar.values()].reduce<{ ad: string; adet: number; cesit: number } | null>((en, m) => (!en || m.adet > en.adet ? m : en), null);
}
