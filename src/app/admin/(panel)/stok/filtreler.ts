// src/app/admin/(panel)/stok/filtreler.ts
// Stok listesinin filtreleri: liste sayfası ve dışa aktarma (PDF / Excel / CSV) aynı sonucu üretsin diye ortak.
import type { SupabaseClient } from "@supabase/supabase-js";
import { kategoriAgaci } from "@/lib/schemas/stok";
import { aramaDeseni, secenekOku, uuidMi } from "../../_components/liste";

export const DURUM_FILTRELERI = ["", "sifir", "ikinci_el"] as const;
export const STOK_FILTRELERI = ["", "var", "yok", "kritik"] as const;
export const SITE_FILTRELERI = ["", "evet", "hayir"] as const;
export const SIRALAMALAR = {
    yeni: { etiket: "En yeni eklenen", sutun: "created_at", artan: false },
    kod: { etiket: "Stok kodu", sutun: "stok_kodu", artan: true },
    ad: { etiket: "Ürün adı (A → Z)", sutun: "ad", artan: true },
    adet_az: { etiket: "Stok adedi (azdan çoğa)", sutun: "stok_adedi", artan: true },
} as const;
export type Siralama = keyof typeof SIRALAMALAR;

export type StokParametreleri = { q?: string; kategori?: string; durum?: string; stok?: string; site?: string; sirala?: string };

export function stokFiltreleriOku(p: StokParametreleri) {
    return {
        q: (p.q ?? "").trim(),
        kategori: uuidMi(p.kategori) ? p.kategori : undefined,
        durum: secenekOku(p.durum, DURUM_FILTRELERI, ""),
        stok: secenekOku(p.stok, STOK_FILTRELERI, ""),
        site: secenekOku(p.site, SITE_FILTRELERI, ""),
        sirala: secenekOku(p.sirala, Object.keys(SIRALAMALAR) as Siralama[], "yeni"),
    };
}

export type StokFiltreleri = ReturnType<typeof stokFiltreleriOku>;

// Linklerde taşınacak (varsayılandan farklı) filtreler.
export const filtreParametreleri = (f: StokFiltreleri) => ({
    q: f.q || undefined,
    kategori: f.kategori,
    durum: f.durum || undefined,
    stok: f.stok || undefined,
    site: f.site || undefined,
    sirala: f.sirala === "yeni" ? undefined : f.sirala,
});

// Filtrelenmiş ve sıralanmış ürün sorgusu; sayfalama (range) çağıran tarafta eklenir.
export function stokSorgusu(
    supabase: SupabaseClient,
    sutunlar: string,
    f: StokFiltreleri,
    agac: ReturnType<typeof kategoriAgaci>,
    sayim = false
) {
    const { sutun, artan } = SIRALAMALAR[f.sirala];
    let sorgu = supabase
        .from("urunler")
        .select(sutunlar, sayim ? { count: "exact" } : undefined)
        .order(sutun, { ascending: artan })
        .order("id");

    if (f.q) sorgu = sorgu.ilike("arama", aramaDeseni(f.q));
    if (f.kategori) sorgu = sorgu.in("kategori_id", agac.altlariyla(f.kategori));
    if (f.durum) sorgu = sorgu.eq("durum", f.durum);
    if (f.stok === "var") sorgu = sorgu.gt("stok_adedi", 0);
    if (f.stok === "yok") sorgu = sorgu.eq("stok_adedi", 0);
    if (f.stok === "kritik") sorgu = sorgu.eq("kritik", true);
    if (f.site) sorgu = sorgu.eq("sitede", f.site === "evet");
    return sorgu;
}

// Barkod okuyucu / elle tam kod: stok kodu, barkod veya seri no tek ürüne denk geliyorsa o ürünün kimliği.
// Yalnızca harf/rakam/nokta/tire içeren aramalarda denenir (PostgREST filtre sözdizimi bozulmasın).
export async function stokTamEslesmesi(supabase: SupabaseClient, q: string): Promise<string | null> {
    if (!/^[\p{L}\d.-]+$/u.test(q)) return null;
    const { data } = await supabase
        .from("urunler")
        .select("id")
        .or(`stok_kodu.eq.${q},barkod.eq.${q},seri_no.ilike.${q}`)
        .limit(2);
    return data?.length === 1 ? (data[0].id as string) : null;
}
