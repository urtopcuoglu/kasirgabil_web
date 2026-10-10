// src/app/admin/(panel)/stok/kutular/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown, Eye, PackagePlus, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { dbHataMesaji } from "@/lib/supabase/yetkili";
import type { Kutu } from "@/lib/schemas/stok";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FormHatasi, inputSinifi, SayfaBasligi } from "../../../_components/form";
import { aramaDeseni, FiltreOzeti, linkOlustur } from "../../../_components/liste";
import StokSekmeleri from "../StokSekmeleri";
import KutuFormu from "./KutuFormu";

export const metadata: Metadata = {
    title: "Kutular",
};

type KutuSatiri = Kutu & { urunler: { count: number }[] };

export default async function KutularSayfasi({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const q = ((await searchParams).q ?? "").trim();
    const supabase = await createClient();

    let sorgu = supabase.from("kutular").select("*, urunler(count)").order("kutu_no", { ascending: false });
    if (q) sorgu = sorgu.ilike("arama", aramaDeseni(q));

    // Liste filtreli olabilir; mükerrer kontrolü ve sıradaki numara için tüm kutular ayrıca alınır.
    const [{ data, error }, { data: tumKutular }] = await Promise.all([
        sorgu,
        supabase.from("kutular").select("id, kutu_no, marka, model"),
    ]);
    const kutular = (data ?? []) as KutuSatiri[];

    return (
        <div>
            <SayfaBasligi
                baslik="Stok"
                aciklama="Notebook yedek parça kutuları. Aynı marka/model için tek kutu açılır; parçalar o kutuya eklenir."
            />

            <StokSekmeleri aktif="/admin/stok/kutular" />

            <details className="group mb-4 rounded-xl border bg-white shadow-sm" open={kutular.length === 0 && !q}>
                <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 font-semibold text-[var(--color-secondary)]">
                    <PackagePlus className="size-4" /> Yeni Kutu Aç
                    <ChevronDown className="ml-auto size-4 transition group-open:rotate-180" />
                </summary>
                <div className="border-t p-4">
                    <KutuFormu kutular={tumKutular ?? []} />
                </div>
            </details>

            <form action="/admin/stok/kutular" className="mb-3 flex gap-2 rounded-xl border bg-white p-3 shadow-sm">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                    <input
                        name="q"
                        type="search"
                        defaultValue={q}
                        placeholder="Kutu no, marka veya model..."
                        aria-label="Kutu ara"
                        className={cn(inputSinifi, "py-1.5 pl-9")}
                    />
                </div>
                <Button type="submit" variant="outline" className="h-[34px]">
                    Ara
                </Button>
            </form>

            <FiltreOzeti sonucSayisi={kutular.length} aktifFiltre={q ? 1 : 0} temizleLinki={linkOlustur("/admin/stok/kutular", {})} />

            {error && <FormHatasi mesaj={dbHataMesaji(error)} />}

            {!error && kutular.length === 0 && (
                <div className="rounded-xl border border-dashed bg-white p-10 text-center text-sm text-gray-500">
                    {q ? "Aramaya uygun kutu bulunamadı." : "Henüz kutu açılmamış."}
                </div>
            )}

            {kutular.length > 0 && (
                <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-4 py-3 font-medium">Kutu No</th>
                                <th className="px-4 py-3 font-medium">Marka / Model</th>
                                <th className="px-4 py-3 font-medium">Konum</th>
                                <th className="px-4 py-3 text-right font-medium">Parça</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {kutular.map((k) => (
                                <tr key={k.id} className="hover:bg-gray-50">
                                    <td className="whitespace-nowrap px-4 py-3 font-mono text-base font-semibold text-[var(--color-secondary)]">
                                        {k.kutu_no}
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium">
                                            {k.marka} {k.model}
                                        </p>
                                        {k.notlar && <p className="truncate text-xs text-gray-500">{k.notlar}</p>}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{k.konum ?? <span className="text-gray-400">—</span>}</td>
                                    <td className="px-4 py-3 text-right tabular-nums">{k.urunler[0]?.count ?? 0}</td>
                                    <td className="px-4 py-3 text-right">
                                        <Button variant="ghost" size="icon" asChild title="Kutuyu aç">
                                            <Link href={`/admin/stok/kutular/${k.id}`} aria-label="Kutuyu aç">
                                                <Eye />
                                            </Link>
                                        </Button>
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
