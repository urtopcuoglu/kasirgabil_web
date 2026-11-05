// src/app/admin/(panel)/donanim/stok/page.tsx
// Stoktaki parçaların donanım puanları. Bağlanmış ürünler kesin, bağlanmamışlar için otomatik öneri gösterilir;
// öneri "Onayla" ile ürüne kaydedilir. Yanlış öneri ürün sayfasından değiştirilir.
import type { Metadata } from "next";
import Link from "next/link";
import { PackageSearch } from "lucide-react";
import {
    DONANIM_SUTUNLARI,
    DONANIM_TUR_LISTESI,
    donanimEslestirici,
    donanimEtiketi,
    tumDonanimPuanlari,
    urunEslesmeMetni,
    type DonanimPuani,
} from "@/lib/donanim-puanlari";
import { izinVar } from "@/lib/izinler";
import { createClient } from "@/lib/supabase/server";
import { dbHataMesaji, oturum } from "@/lib/supabase/yetkili";
import { FormHatasi } from "../../../_components/form";
import DonanimBasligi from "../DonanimBasligi";
import { puanYaz, sayiYaz, TurRozeti, UbLinki } from "../DonanimParcalari";
import EslesmeButonu from "../EslesmeButonu";

export const metadata: Metadata = {
    title: "Stoktaki Parçalar · Donanım Puanları",
};

type UrunSatiri = {
    id: string;
    stok_kodu: string;
    ad: string;
    marka: string | null;
    model: string | null;
    stok_adedi: number;
    donanim_puanlari: DonanimPuani | null;
};

// Stokta olan veya donanımı bağlanmış ürünler (PostgREST tek istekte en fazla 1000 satır döndürür).
async function urunleriOku(supabase: Awaited<ReturnType<typeof createClient>>) {
    const SAYFA = 1000;
    const sonuc: UrunSatiri[] = [];
    for (let bas = 0; ; bas += SAYFA) {
        const { data, error } = await supabase
            .from("urunler")
            .select(`id, stok_kodu, ad, marka, model, stok_adedi, donanim_puanlari(${DONANIM_SUTUNLARI})`)
            .or("stok_adedi.gt.0,donanim_puan_id.not.is.null")
            .order("id")
            .range(bas, bas + SAYFA - 1);
        if (error) return { urunler: sonuc, error };
        sonuc.push(...((data ?? []) as unknown as UrunSatiri[]));
        if (!data || data.length < SAYFA) return { urunler: sonuc, error: null };
    }
}

export default async function DonanimStokSayfasi() {
    const supabase = await createClient();
    const o = await oturum();
    const { urunler, error } = await urunleriOku(supabase);

    const baglanmamis = urunler.filter((u) => !u.donanim_puanlari);
    const eslestir = baglanmamis.length ? donanimEslestirici(await tumDonanimPuanlari(supabase)) : null;

    const satirlar = urunler
        .map((u) => ({ u, p: u.donanim_puanlari ?? eslestir?.(urunEslesmeMetni(u)) ?? null, bagli: !!u.donanim_puanlari }))
        .filter((s): s is { u: UrunSatiri; p: DonanimPuani; bagli: boolean } => !!s.p)
        // Türe göre (CPU, GPU, ...), tür içinde en iyi sıradan.
        .toSorted(
            (a, b) =>
                DONANIM_TUR_LISTESI.indexOf(a.p.tur) - DONANIM_TUR_LISTESI.indexOf(b.p.tur) ||
                (a.p.sira ?? Number.MAX_SAFE_INTEGER) - (b.p.sira ?? Number.MAX_SAFE_INTEGER),
        );
    const eslesmeyen = urunler.length - satirlar.length;
    const oneriSayisi = satirlar.filter((s) => !s.bagli).length;
    const yonetici = izinVar(o?.rol, "stok_yonet");

    return (
        <div>
            <DonanimBasligi aktif="/admin/donanim/stok" />

            {error && <FormHatasi mesaj={dbHataMesaji(error)} />}

            <p className="mb-3 text-xs text-gray-500">
                {satirlar.length} ürün eşleşti ({satirlar.length - oneriSayisi} onaylı, {oneriSayisi} otomatik öneri)
                {eslesmeyen > 0 && ` · ${eslesmeyen} stok ürününde donanım bulunamadı (kasa, kablo, yedek parça vb.)`}. Öneriler ürün adındaki
                model numarasından bulunur; yanlışsa ürün sayfasından değiştirin.
            </p>

            {satirlar.length === 0 ? (
                <div className="rounded-xl border border-dashed bg-white p-10 text-center text-sm text-gray-500">
                    <PackageSearch className="mx-auto mb-2 size-6 text-gray-300" />
                    Stoktaki ürünlerde eşleşen işlemci, ekran kartı, SSD, HDD veya RAM bulunamadı.
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-3 py-3 font-medium">Stoktaki Ürün</th>
                                <th className="px-3 py-3 font-medium">Donanım (UserBenchmark)</th>
                                <th className="px-3 py-3 text-right font-medium">Sıra</th>
                                <th className="px-3 py-3 text-right font-medium">Puan</th>
                                <th className="px-3 py-3 text-right font-medium">Test</th>
                                <th className="px-3 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {satirlar.map(({ u, p, bagli }) => (
                                <tr key={u.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-2">
                                        <Link href={`/admin/stok/${u.id}`} className="hover:underline">
                                            <span className="font-mono text-xs font-semibold text-[var(--color-secondary)]">{u.stok_kodu}</span>{" "}
                                            <span className="font-medium">{u.ad}</span>
                                        </Link>
                                        <p className="text-xs text-gray-500">{u.stok_adedi} adet stokta</p>
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <TurRozeti tur={p.tur} />
                                            <span>{donanimEtiketi(p)}</span>
                                            {bagli ? (
                                                <span className="rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700">Onaylı</span>
                                            ) : (
                                                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">Öneri</span>
                                            )}
                                        </div>
                                        <UbLinki url={p.url} />
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums">{p.sira != null ? `#${sayiYaz(p.sira)}` : "—"}</td>
                                    <td className="whitespace-nowrap px-3 py-2 text-right font-semibold tabular-nums">{puanYaz(p.puan)}</td>
                                    <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-gray-600">{sayiYaz(p.ornek)}</td>
                                    <td className="whitespace-nowrap px-3 py-2 text-right">
                                        {yonetici && !bagli && <EslesmeButonu urunId={u.id} puanId={p.id} />}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
