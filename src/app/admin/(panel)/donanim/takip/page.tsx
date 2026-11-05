// src/app/admin/(panel)/donanim/takip/page.tsx
// Takip listesi: takip edilen parçaların güncel sıra/puanı, son değişim ve takibe alındığından beri değişim.
// Geçmiş, her güncellemede sıra veya puan değişince veritabanı tetikleyicisiyle yazılır.
import type { Metadata } from "next";
import { Star } from "lucide-react";
import { DONANIM_SUTUNLARI, donanimEtiketi, type DonanimGecmisi, type DonanimPuani } from "@/lib/donanim-puanlari";
import { izinVar } from "@/lib/izinler";
import { createClient } from "@/lib/supabase/server";
import { dbHataMesaji, oturum } from "@/lib/supabase/yetkili";
import { tarihSaatYaz } from "@/lib/tarih";
import { FormHatasi } from "../../../_components/form";
import DonanimBasligi from "../DonanimBasligi";
import { PuanDegisimi, puanYaz, SiraDegisimi, sayiYaz, TurRozeti, UbLinki } from "../DonanimParcalari";
import TakipButonu from "../TakipButonu";

export const metadata: Metadata = {
    title: "Takip Listesi · Donanım Puanları",
};

type TakipSatiri = { created_at: string; donanim_puanlari: DonanimPuani };

export default async function DonanimTakipSayfasi() {
    const supabase = await createClient();
    const o = await oturum();
    const { data, error } = await supabase
        .from("donanim_takip")
        .select(`created_at, donanim_puanlari(${DONANIM_SUTUNLARI})`)
        .order("created_at", { ascending: false });
    const satirlar = ((data ?? []) as unknown as TakipSatiri[]).filter((s) => s.donanim_puanlari);

    const ids = satirlar.map((s) => s.donanim_puanlari.id);
    const { data: gecmisData } = ids.length
        ? await supabase
              .from("donanim_puan_gecmisi")
              .select("puan_id, sira, puan, ornek, tarih")
              .in("puan_id", ids)
              .order("tarih", { ascending: false })
              .limit(5000)
        : { data: [] };
    const gecmisler = new Map<string, DonanimGecmisi[]>();
    for (const g of (gecmisData ?? []) as DonanimGecmisi[]) {
        gecmisler.set(g.puan_id, [...(gecmisler.get(g.puan_id) ?? []), g]);
    }
    const takipYetkisi = izinVar(o?.rol, "donanim");

    return (
        <div>
            <DonanimBasligi aktif="/admin/donanim/takip" />

            {error && <FormHatasi mesaj={dbHataMesaji(error)} />}

            {!error && satirlar.length === 0 && (
                <div className="rounded-xl border border-dashed bg-white p-10 text-center text-sm text-gray-500">
                    <Star className="mx-auto mb-2 size-6 text-gray-300" />
                    Takip edilen parça yok. Tüm Parçalar sekmesinde yıldıza tıklayarak parça ekleyin; her güncellemede sıra ve puan
                    değişimleri burada görünür.
                </div>
            )}

            {satirlar.length > 0 && (
                <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="w-10 px-3 py-3" aria-label="Takip" />
                                <th className="px-3 py-3 font-medium">Parça</th>
                                <th className="px-3 py-3 text-right font-medium">Sıra</th>
                                <th className="px-3 py-3 text-right font-medium">Puan</th>
                                <th className="px-3 py-3 text-right font-medium" title="Takibe alındığı andaki değere göre">
                                    Takipten beri
                                </th>
                                <th className="px-3 py-3 font-medium">Geçmiş</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y align-top">
                            {satirlar.map(({ created_at, donanim_puanlari: p }) => {
                                const gecmis = gecmisler.get(p.id) ?? [];
                                // gecmis[0] güncel durum; gecmis[1] bir önceki değer.
                                const onceki = gecmis[1];
                                // Takibe alındığı andaki durum: o tarihten önceki son kayıt (yoksa en eski kayıt).
                                const baslangic = gecmis.find((g) => g.tarih <= created_at) ?? gecmis.at(-1);
                                return (
                                    <tr key={p.id} className="hover:bg-gray-50">
                                        <td className="px-3 py-2">
                                            <TakipButonu puanId={p.id} takipte pasif={!takipYetkisi} />
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="flex items-center gap-2">
                                                <TurRozeti tur={p.tur} />
                                                <span className="font-medium">{donanimEtiketi(p)}</span>
                                            </div>
                                            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-gray-500">
                                                <span>{sayiYaz(p.ornek)} test</span>
                                                <span>· takipte: {tarihSaatYaz(created_at)}</span>
                                                <UbLinki url={p.url} />
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-2 text-right">
                                            <span className="font-semibold tabular-nums">{p.sira != null ? `#${sayiYaz(p.sira)}` : "—"}</span>{" "}
                                            <SiraDegisimi simdi={p.sira} once={onceki?.sira} />
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-2 text-right">
                                            <span className="font-semibold tabular-nums">{puanYaz(p.puan)}</span>{" "}
                                            <PuanDegisimi simdi={p.puan} once={onceki?.puan} />
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-2 text-right">
                                            <SiraDegisimi simdi={p.sira} once={baslangic?.sira} />{" "}
                                            <PuanDegisimi simdi={p.puan} once={baslangic?.puan} />
                                        </td>
                                        <td className="px-3 py-2">
                                            {gecmis.length <= 1 ? (
                                                <span className="text-xs text-gray-400">Henüz değişiklik yok</span>
                                            ) : (
                                                <details>
                                                    <summary className="cursor-pointer text-xs text-[var(--color-secondary)]">
                                                        {gecmis.length - 1} değişiklik · son: {tarihSaatYaz(gecmis[0].tarih)}
                                                    </summary>
                                                    <ul className="mt-1 space-y-0.5 text-xs tabular-nums text-gray-600">
                                                        {gecmis.slice(0, 12).map((g) => (
                                                            <li key={g.tarih}>
                                                                {tarihSaatYaz(g.tarih)}: #{sayiYaz(g.sira)} · {puanYaz(g.puan)} puan
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </details>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
