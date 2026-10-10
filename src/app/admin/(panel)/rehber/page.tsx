// src/app/admin/(panel)/rehber/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Mail, MapPin, Pencil, Phone, Plus, Search, Tags } from "lucide-react";
import { rehberKisiSil } from "@/actions/rehber";
import { createClient } from "@/lib/supabase/server";
import { dbHataMesaji } from "@/lib/supabase/yetkili";
import type { RehberKategori, RehberKisi } from "@/lib/schemas/rehber";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { anaButonSinifi, FormHatasi, inputSinifi, SayfaBasligi } from "../../_components/form";
import SilButonu from "../../_components/SilButonu";
import KargoKopyalaButonu from "./KargoKopyalaButonu";

export const metadata: Metadata = {
    title: "Rehber",
};

type Props = {
    searchParams: Promise<{ q?: string; kategori?: string }>;
};

type KisiSatiri = RehberKisi & { rehber_kategorileri: Pick<RehberKategori, "ad" | "kod"> | null };

// Kullanıcının yazdığı metni ilike desenine çevirir. Sadece rakam/telefon karakterleri
// içeriyorsa boşluklar atılır, böylece "0532 123" ve "0532123" aynı sonucu verir.
function aramaDeseni(q: string) {
    const temiz = /^[\d\s()+-]+$/.test(q) ? q.replace(/\D/g, "") : q;
    return `%${temiz.replace(/[\\%_]/g, (k) => `\\${k}`)}%`;
}

function filtreLinki(q: string, kategori?: string) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (kategori) params.set("kategori", kategori);
    const s = params.toString();
    return s ? `/admin/rehber?${s}` : "/admin/rehber";
}

export default async function RehberSayfasi({ searchParams }: Props) {
    const { q: hamQ = "", kategori: hamKategori } = await searchParams;
    // Elle bozulmuş bir URL veritabanı hatasına yol açmasın diye kategori yalnızca UUID ise kullanılır.
    const kategori = hamKategori && /^[0-9a-f-]{36}$/i.test(hamKategori) ? hamKategori : undefined;
    const q = hamQ.trim();
    const supabase = await createClient();

    let sorgu = supabase
        .from("rehber_kisiler")
        .select("*, rehber_kategorileri(ad, kod)")
        .order("ad_soyad_unvan")
        .limit(200);

    if (q) sorgu = sorgu.ilike("arama", aramaDeseni(q));
    if (kategori) sorgu = sorgu.eq("kategori_id", kategori);

    const [kisilerSonucu, kategorilerSonucu] = await Promise.all([
        sorgu,
        supabase.from("rehber_kategorileri").select("id, ad, kod, sistem").order("sistem", { ascending: false }).order("ad"),
    ]);

    const kisiler = (kisilerSonucu.data ?? []) as KisiSatiri[];
    const kategoriler = (kategorilerSonucu.data ?? []) as RehberKategori[];
    const hata = kisilerSonucu.error ?? kategorilerSonucu.error;

    return (
        <div>
            <SayfaBasligi baslik="Rehber" aciklama="Tedarikçi, kurye, muhasebe ve diğer önemli kişiler.">
                <Button variant="outline" asChild>
                    <Link href="/admin/rehber/kategoriler">
                        <Tags /> Kategoriler
                    </Link>
                </Button>
                <Button asChild className={anaButonSinifi}>
                    <Link href="/admin/rehber/yeni">
                        <Plus /> Yeni Kişi
                    </Link>
                </Button>
            </SayfaBasligi>

            {/* Arama */}
            <form action="/admin/rehber" className="mb-4 flex gap-2">
                {kategori && <input type="hidden" name="kategori" value={kategori} />}
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                    <input
                        name="q"
                        type="search"
                        defaultValue={q}
                        placeholder="İsim, firma veya telefon ara..."
                        className={cn(inputSinifi, "pl-9")}
                    />
                </div>
                <Button type="submit" variant="outline">
                    Ara
                </Button>
            </form>

            {/* Kategori filtresi */}
            <div className="mb-6 flex flex-wrap gap-2">
                {[{ id: undefined, ad: "Tümü" }, ...kategoriler].map((k) => {
                    const aktif = (kategori ?? undefined) === k.id;
                    return (
                        <Link
                            key={k.id ?? "tumu"}
                            href={filtreLinki(q, k.id)}
                            className={cn(
                                "rounded-full border px-3 py-1 text-xs font-medium transition",
                                aktif
                                    ? "border-[var(--color-secondary)] bg-[var(--color-secondary)] text-white"
                                    : "bg-white text-gray-600 hover:border-gray-400"
                            )}
                        >
                            {k.ad}
                        </Link>
                    );
                })}
            </div>

            {hata && <FormHatasi mesaj={dbHataMesaji(hata)} />}

            {!hata && kisiler.length === 0 && (
                <div className="rounded-xl border border-dashed bg-white p-10 text-center text-sm text-gray-500">
                    {q || kategori ? "Aramanıza uygun kayıt bulunamadı." : "Rehberde henüz kayıt yok."}
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {kisiler.map((k) => (
                    <div key={k.id} className="flex flex-col rounded-xl border bg-white p-4 shadow-sm">
                        <div className="mb-3 flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <h2 className="truncate font-semibold text-gray-900">{k.ad_soyad_unvan}</h2>
                                {k.firma && (
                                    <p className="flex items-center gap-1 truncate text-sm text-gray-500">
                                        <Building2 className="size-3.5 shrink-0" /> {k.firma}
                                    </p>
                                )}
                            </div>
                            {k.rehber_kategorileri && (
                                <span
                                    className={cn(
                                        "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                                        k.rehber_kategorileri.kod === "tedarikci"
                                            ? "bg-red-50 text-[var(--color-primary)]"
                                            : "bg-gray-100 text-gray-600"
                                    )}
                                >
                                    {k.rehber_kategorileri.ad}
                                </span>
                            )}
                        </div>

                        <ul className="flex-1 space-y-1.5 text-sm text-gray-700">
                            {[k.telefon_1, k.telefon_2].filter(Boolean).map((tel) => (
                                <li key={tel} className="flex items-center gap-2">
                                    <Phone className="size-3.5 shrink-0 text-gray-400" />
                                    <a href={`tel:${tel}`} className="hover:underline">
                                        {tel}
                                    </a>
                                </li>
                            ))}
                            {k.eposta && (
                                <li className="flex items-center gap-2">
                                    <Mail className="size-3.5 shrink-0 text-gray-400" />
                                    <a href={`mailto:${k.eposta}`} className="truncate hover:underline">
                                        {k.eposta}
                                    </a>
                                </li>
                            )}
                            {k.adres && (
                                <li className="flex items-start gap-2">
                                    <MapPin className="mt-0.5 size-3.5 shrink-0 text-gray-400" />
                                    <span className="whitespace-pre-line">{k.adres}</span>
                                </li>
                            )}
                        </ul>

                        {k.notlar && (
                            <p className="mt-3 line-clamp-2 rounded-md bg-gray-50 px-2 py-1.5 text-xs text-gray-500">
                                {k.notlar}
                            </p>
                        )}

                        <div className="mt-3 flex items-center justify-end gap-1 border-t pt-3">
                            {k.adres && <KargoKopyalaButonu kisi={k} />}
                            <Button variant="ghost" size="icon" asChild title="Düzenle">
                                <Link href={`/admin/rehber/${k.id}`} aria-label="Düzenle">
                                    <Pencil />
                                </Link>
                            </Button>
                            <SilButonu
                                onay={`"${k.ad_soyad_unvan}" rehberden silinsin mi?`}
                                sil={rehberKisiSil.bind(null, k.id)}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {kisiler.length === 200 && (
                <p className="mt-4 text-center text-xs text-gray-500">
                    İlk 200 kayıt gösteriliyor. Daha fazlası için aramayı daraltın.
                </p>
            )}
        </div>
    );
}
