// src/app/admin/(panel)/icerik/site/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SITE_ICERIKLERI, type SiteIcerikAnahtari } from "@/lib/schemas/icerik";
import { tarihSaatYaz } from "@/lib/tarih";
import { Button } from "@/components/ui/button";
import { SayfaBasligi } from "../../../_components/form";
import IcerikSekmeleri from "../IcerikSekmeleri";

export const metadata: Metadata = {
    title: "Site İçerikleri",
};

export default async function SiteIcerikleriSayfasi() {
    const supabase = await createClient();
    const { data } = await supabase.from("site_icerikleri").select("anahtar, updated_at");
    const guncelleme = new Map((data ?? []).map((r) => [r.anahtar as string, r.updated_at as string]));

    return (
        <div>
            <SayfaBasligi baslik="İçerik / Blog" aciklama="Sitedeki sabit metinler. Kaydedince vitrin hemen güncellenir." />
            <IcerikSekmeleri aktif="/admin/icerik/site" />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {(Object.keys(SITE_ICERIKLERI) as SiteIcerikAnahtari[]).map((anahtar) => {
                    const t = SITE_ICERIKLERI[anahtar];
                    const tarih = guncelleme.get(anahtar);
                    return (
                        <div key={anahtar} className="flex flex-col rounded-xl border bg-white p-4 shadow-sm">
                            <h2 className="font-semibold text-[var(--color-secondary)]">{t.baslik}</h2>
                            <p className="mt-1 flex-1 text-sm text-gray-500">{t.aciklama}</p>
                            {tarih && <p className="mt-2 text-xs text-gray-400">Son değişiklik: {tarihSaatYaz(tarih)}</p>}
                            <div className="mt-3 flex gap-2">
                                <Button size="sm" variant="outline" asChild>
                                    <Link href={`/admin/icerik/site/${anahtar}`}>
                                        <Pencil /> Düzenle
                                    </Link>
                                </Button>
                                <Button size="sm" variant="ghost" asChild>
                                    <a href={t.yol} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink /> Sitede gör
                                    </a>
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
