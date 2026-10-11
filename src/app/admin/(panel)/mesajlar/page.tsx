// src/app/admin/(panel)/mesajlar/page.tsx
// Vitrindeki iletişim formundan gelen mesajlar.
import type { Metadata } from "next";
import { Mail, Phone, Reply, Search } from "lucide-react";
import { mesajSil } from "@/actions/iletisim";
import type { IletisimMesaji } from "@/lib/schemas/iletisim";
import { createClient } from "@/lib/supabase/server";
import { dbHataMesaji, izinGerekli } from "@/lib/supabase/yetkili";
import { tarihSaatYaz } from "@/lib/tarih";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FormHatasi, inputSinifi, SayfaBasligi } from "../../_components/form";
import { aramaDeseni, FiltreOzeti, FiltreSecimi, linkOlustur, sayfaAraligi, Sayfalama, sayfaOku, secenekOku } from "../../_components/liste";
import OtomatikFiltreFormu from "../../_components/OtomatikFiltreFormu";
import SilButonu from "../../_components/SilButonu";
import OkunduButonu from "./OkunduButonu";

export const metadata: Metadata = {
    title: "Mesajlar",
};

type Props = {
    searchParams: Promise<{ q?: string; sayfa?: string; durum?: string }>;
};

const DURUMLAR = ["", "okunmamis", "okundu"] as const;

export default async function MesajlarSayfasi({ searchParams }: Props) {
    await izinGerekli("mesajlar");

    const p = await searchParams;
    const sayfa = sayfaOku(p.sayfa);
    const q = (p.q ?? "").trim();
    const durum = secenekOku(p.durum, DURUMLAR, "");

    const filtreler = { q: q || undefined, durum: durum || undefined };
    const aktifFiltre = Object.values(filtreler).filter(Boolean).length;

    const supabase = await createClient();
    let sorgu = supabase
        .from("iletisim_mesajlari")
        .select("id, ad, soyad, telefon, eposta, mesaj, okundu, okunma_tarihi, created_at", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(...sayfaAraligi(sayfa));

    if (q) sorgu = sorgu.ilike("arama", aramaDeseni(q));
    if (durum) sorgu = sorgu.eq("okundu", durum === "okundu");

    const { data, count, error } = await sorgu;
    const mesajlar = (data ?? []) as IletisimMesaji[];
    const toplam = count ?? 0;

    return (
        <div>
            <SayfaBasligi baslik="Mesajlar" aciklama="Web sitesindeki iletişim formundan gelen mesajlar." />

            <OtomatikFiltreFormu
                action="/admin/mesajlar"
                className="mb-3 grid gap-3 rounded-xl border bg-white p-3 shadow-sm sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
            >
                <label className="flex min-w-0 flex-col gap-1 text-xs font-medium text-gray-500">
                    Ara
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                            <input
                                name="q"
                                type="search"
                                defaultValue={q}
                                placeholder="İsim, e-posta, telefon veya mesaj..."
                                className={cn(inputSinifi, "py-1.5 pl-9")}
                            />
                        </div>
                        <Button type="submit" variant="outline" className="h-[34px]">
                            Ara
                        </Button>
                    </div>
                </label>
                <FiltreSecimi
                    etiket="Durum"
                    name="durum"
                    deger={durum}
                    secenekler={[
                        { deger: "", etiket: "Tümü" },
                        { deger: "okunmamis", etiket: "Okunmamış" },
                        { deger: "okundu", etiket: "Okunmuş" },
                    ]}
                />
            </OtomatikFiltreFormu>

            <FiltreOzeti sonucSayisi={toplam} aktifFiltre={aktifFiltre} temizleLinki="/admin/mesajlar" />

            {error && <FormHatasi mesaj={dbHataMesaji(error)} />}

            {!error && mesajlar.length === 0 && (
                <div className="rounded-xl border border-dashed bg-white p-10 text-center text-sm text-gray-500">
                    {aktifFiltre > 0 ? "Filtrelere uygun mesaj bulunamadı." : "Henüz mesaj gelmedi."}
                </div>
            )}

            <ul className="space-y-3">
                {mesajlar.map((m) => (
                    <MesajKarti key={m.id} mesaj={m} />
                ))}
            </ul>

            <Sayfalama sayfa={sayfa} toplam={toplam} link={(n) => linkOlustur("/admin/mesajlar", { ...filtreler, sayfa: n > 1 ? String(n) : undefined })} />
        </div>
    );
}

function MesajKarti({ mesaj: m }: { mesaj: IletisimMesaji }) {
    const adSoyad = [m.ad, m.soyad].filter(Boolean).join(" ");
    const yanitLinki = `mailto:${m.eposta}?subject=${encodeURIComponent("Kasırga Bilgisayar - Mesajınız hakkında")}`;

    return (
        <li
            className={cn(
                "rounded-xl border bg-white p-4 shadow-sm",
                !m.okundu && "border-l-4 border-l-[var(--color-primary)]"
            )}
        >
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="flex items-center gap-2 font-semibold text-gray-900">
                        {adSoyad}
                        {!m.okundu && (
                            <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-[var(--color-primary)]">Yeni</span>
                        )}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                        <a href={`mailto:${m.eposta}`} className="flex items-center gap-1.5 hover:underline">
                            <Mail className="size-3.5 text-gray-400" /> {m.eposta}
                        </a>
                        {m.telefon && (
                            <a href={`tel:${m.telefon}`} className="flex items-center gap-1.5 hover:underline">
                                <Phone className="size-3.5 text-gray-400" /> {m.telefon}
                            </a>
                        )}
                    </div>
                </div>
                <time dateTime={m.created_at} className="shrink-0 text-xs text-gray-500">
                    {tarihSaatYaz(m.created_at)}
                </time>
            </div>

            <p className="mt-3 whitespace-pre-line rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-800">{m.mesaj}</p>

            <div className="mt-3 flex flex-wrap items-center justify-end gap-1 border-t pt-3">
                {m.okundu && m.okunma_tarihi && <span className="mr-auto text-xs text-gray-400">Okundu: {tarihSaatYaz(m.okunma_tarihi)}</span>}
                <Button variant="ghost" size="sm" asChild className="text-gray-600">
                    <a href={yanitLinki}>
                        <Reply /> Yanıtla
                    </a>
                </Button>
                <OkunduButonu id={m.id} okundu={m.okundu} />
                <SilButonu onay={`${adSoyad} adlı kişinin mesajı silinsin mi?`} sil={mesajSil.bind(null, m.id)} />
            </div>
        </li>
    );
}
