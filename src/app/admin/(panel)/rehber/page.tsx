// src/app/admin/(panel)/rehber/page.tsx
import type { Metadata } from "next";
import { izinVar } from "@/lib/izinler";
import { dbHataMesaji, oturum } from "@/lib/supabase/yetkili";
import Link from "next/link";
import { Building2, Mail, MapPin, Pencil, Phone, Plus, Search, Tags, Truck } from "lucide-react";
import { rehberKisiSil } from "@/actions/rehber";
import { createClient } from "@/lib/supabase/server";
import { TEDARIKCI_KODU, type RehberKategori, type RehberKisi } from "@/lib/schemas/rehber";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { anaButonSinifi, FormHatasi, inputSinifi, SayfaBasligi } from "../../_components/form";
import {
    aramaDeseni,
    FiltreOzeti,
    FiltreSecimi,
    gorunumOku,
    GorunumSecici,
    linkOlustur,
    sayfaAraligi,
    Sayfalama,
    sayfaOku,
    secenekOku,
    uuidMi,
} from "../../_components/liste";
import OtomatikFiltreFormu from "../../_components/OtomatikFiltreFormu";
import SilButonu from "../../_components/SilButonu";

export const metadata: Metadata = {
    title: "Rehber",
};

type Props = {
    searchParams: Promise<{ q?: string; sayfa?: string; kategori?: string; adres?: string; sirala?: string; gorunum?: string }>;
};

type KisiSatiri = RehberKisi & { rehber_kategorileri: Pick<RehberKategori, "ad" | "kod"> | null };


const ADRES_SECENEKLERI = ["", "var", "yok"] as const;
const SIRALAMALAR = {
    ad_artan: { etiket: "Ad (A → Z)", sutun: "ad_soyad_unvan", artan: true },
    ad_azalan: { etiket: "Ad (Z → A)", sutun: "ad_soyad_unvan", artan: false },
    yeni: { etiket: "En yeni eklenen", sutun: "created_at", artan: false },
    eski: { etiket: "En eski eklenen", sutun: "created_at", artan: true },
} as const;
type Siralama = keyof typeof SIRALAMALAR;


export default async function RehberSayfasi({ searchParams }: Props) {
    const p = await searchParams;
    const sayfa = sayfaOku(p.sayfa);
    const q = (p.q ?? "").trim();
    // Elle bozulmuş bir URL veritabanı hatasına yol açmasın diye değerler doğrulanarak okunur.
    const kategori = uuidMi(p.kategori) ? p.kategori : undefined;
    const adres = secenekOku(p.adres, ADRES_SECENEKLERI, "");
    const sirala = secenekOku(p.sirala, Object.keys(SIRALAMALAR) as Siralama[], "ad_artan");
    const gorunum = gorunumOku(p.gorunum);

    // Varsayılan değerler URL'e yazılmaz.
    const filtreler = {
        q: q || undefined,
        kategori,
        adres: adres || undefined,
        sirala: sirala === "ad_artan" ? undefined : sirala,
    };
    const aktifFiltre = [filtreler.q, filtreler.kategori, filtreler.adres, filtreler.sirala].filter(Boolean).length;

    const supabase = await createClient();
    const o = await oturum();
    const { sutun, artan } = SIRALAMALAR[sirala];

    let sorgu = supabase
        .from("rehber_kisiler")
        .select("*, rehber_kategorileri(ad, kod)", { count: "exact" })
        .order(sutun, { ascending: artan })
        .range(...sayfaAraligi(sayfa));

    if (q) sorgu = sorgu.ilike("arama", aramaDeseni(q));
    if (kategori) sorgu = sorgu.eq("kategori_id", kategori);
    if (adres === "var") sorgu = sorgu.not("adres", "is", null).neq("adres", "");
    if (adres === "yok") sorgu = sorgu.or('adres.is.null,adres.eq.""');

    const [kisilerSonucu, kategorilerSonucu] = await Promise.all([
        sorgu,
        supabase.from("rehber_kategorileri").select("id, ad, kod, sistem").order("sistem", { ascending: false }).order("ad"),
    ]);

    const kisiler = (kisilerSonucu.data ?? []) as KisiSatiri[];
    const toplam = kisilerSonucu.count ?? 0;
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

            {/* Filtre çubuğu */}
            <OtomatikFiltreFormu
                action="/admin/rehber"
                className="mb-3 grid gap-3 rounded-xl border bg-white p-3 shadow-sm sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))_auto]"
            >
                {gorunum === "kart" && <input type="hidden" name="gorunum" value="kart" />}
                <label className="flex min-w-0 flex-col gap-1 text-xs font-medium text-gray-500 sm:col-span-2 lg:col-span-1">
                    Ara
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                            <input
                                name="q"
                                type="search"
                                defaultValue={q}
                                placeholder="İsim, firma veya telefon..."
                                className={cn(inputSinifi, "py-1.5 pl-9")}
                            />
                        </div>
                        <Button type="submit" variant="outline" className="h-[34px]">
                            Ara
                        </Button>
                    </div>
                </label>
                <FiltreSecimi
                    etiket="Kategori"
                    name="kategori"
                    deger={kategori ?? ""}
                    secenekler={[{ deger: "", etiket: "Tümü" }, ...kategoriler.map((k) => ({ deger: k.id, etiket: k.ad }))]}
                />
                <FiltreSecimi
                    etiket="Adres"
                    name="adres"
                    deger={adres}
                    secenekler={[
                        { deger: "", etiket: "Tümü" },
                        { deger: "var", etiket: "Adresi olanlar" },
                        { deger: "yok", etiket: "Adresi olmayanlar" },
                    ]}
                />
                <FiltreSecimi
                    etiket="Sıralama"
                    name="sirala"
                    deger={sirala}
                    secenekler={Object.entries(SIRALAMALAR).map(([deger, { etiket }]) => ({ deger, etiket }))}
                />
                <div className="flex items-end">
                    <GorunumSecici
                        aktif={gorunum}
                        link={(g) => linkOlustur("/admin/rehber", { ...filtreler, gorunum: g === "kart" ? "kart" : undefined })}
                    />
                </div>
            </OtomatikFiltreFormu>

            <FiltreOzeti
                sonucSayisi={toplam}
                aktifFiltre={aktifFiltre}
                temizleLinki={linkOlustur("/admin/rehber", { gorunum: gorunum === "kart" ? "kart" : undefined })}
            />

            {hata && <FormHatasi mesaj={dbHataMesaji(hata)} />}

            {!hata && kisiler.length === 0 && (
                <div className="rounded-xl border border-dashed bg-white p-10 text-center text-sm text-gray-500">
                    {aktifFiltre > 0 ? "Filtrelere uygun kayıt bulunamadı." : "Rehberde henüz kayıt yok."}
                </div>
            )}

            {kisiler.length > 0 &&
                (gorunum === "kart" ? (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {kisiler.map((k) => (
                            <KisiKarti key={k.id} kisi={k} silebilir={izinVar(o?.rol, "sil")} />
                        ))}
                    </div>
                ) : (
                    <KisiTablosu kisiler={kisiler} silebilir={izinVar(o?.rol, "sil")} />
                ))}

            <Sayfalama
                sayfa={sayfa}
                toplam={toplam}
                link={(n) => linkOlustur("/admin/rehber", { ...filtreler, gorunum: gorunum === "kart" ? "kart" : undefined, sayfa: n > 1 ? String(n) : undefined })}
            />
        </div>
    );
}

// ─── Ortak parçalar ─────────────────────────────────────────

function KategoriRozeti({ kategori }: { kategori: KisiSatiri["rehber_kategorileri"] }) {
    if (!kategori) return null;
    return (
        <span
            className={cn(
                "shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium",
                kategori.kod === TEDARIKCI_KODU ? "bg-red-50 text-[var(--color-primary)]" : "bg-gray-100 text-gray-600"
            )}
        >
            {kategori.ad}
        </span>
    );
}

function KisiIslemleri({ kisi, kargoEtiketli, silebilir }: { kisi: KisiSatiri; kargoEtiketli?: boolean; silebilir: boolean }) {
    return (
        <>
            {kisi.adres && (
                <Button
                    variant="ghost"
                    size={kargoEtiketli ? "sm" : "icon"}
                    asChild
                    className={cn("text-gray-600", kargoEtiketli && "mr-auto")}
                >
                    <Link
                        href={`/admin/kargolar/yeni?alici=${kisi.id}`}
                        title="Bu kişiye kargo şablonu oluştur"
                        aria-label="Kargo şablonu"
                    >
                        <Truck /> {kargoEtiketli && "Kargo şablonu"}
                    </Link>
                </Button>
            )}
            <Button variant="ghost" size="icon" asChild title="Düzenle">
                <Link href={`/admin/rehber/${kisi.id}`} aria-label="Düzenle">
                    <Pencil />
                </Link>
            </Button>
            {silebilir && <SilButonu onay={`"${kisi.ad_soyad_unvan}" rehberden silinsin mi?`} sil={rehberKisiSil.bind(null, kisi.id)} />}
        </>
    );
}

// ─── Liste (tablo) görünümü ─────────────────────────────────

function KisiTablosu({ kisiler, silebilir }: { kisiler: KisiSatiri[]; silebilir: boolean }) {
    return (
        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
            <table className="w-full text-left text-sm">
                <thead className="border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                        <th className="px-4 py-3 font-medium">Ad Soyad / Ünvan</th>
                        <th className="px-4 py-3 font-medium">Kategori</th>
                        <th className="px-4 py-3 font-medium">Telefon</th>
                        <th className="px-4 py-3 font-medium">E-posta</th>
                        <th className="px-4 py-3 font-medium">Adres</th>
                        <th className="px-4 py-3" />
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {kisiler.map((k) => (
                        <tr key={k.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                                <p className="font-medium text-gray-900">{k.ad_soyad_unvan}</p>
                                {k.firma && <p className="text-xs text-gray-500">{k.firma}</p>}
                            </td>
                            <td className="px-4 py-3">
                                <KategoriRozeti kategori={k.rehber_kategorileri} />
                            </td>
                            <td className="whitespace-nowrap px-4 py-3">
                                {[k.telefon_1, k.telefon_2].filter(Boolean).map((tel) => (
                                    <a key={tel} href={`tel:${tel}`} className="block hover:underline">
                                        {tel}
                                    </a>
                                ))}
                                {!k.telefon_1 && !k.telefon_2 && <span className="text-gray-400">—</span>}
                            </td>
                            <td className="px-4 py-3">
                                {k.eposta ? (
                                    <a href={`mailto:${k.eposta}`} className="hover:underline">
                                        {k.eposta}
                                    </a>
                                ) : (
                                    <span className="text-gray-400">—</span>
                                )}
                            </td>
                            <td className="max-w-xs px-4 py-3">
                                {k.adres ? (
                                    <p className="truncate text-gray-600" title={k.adres}>
                                        {k.adres}
                                    </p>
                                ) : (
                                    <span className="text-gray-400">—</span>
                                )}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex justify-end gap-1">
                                    <KisiIslemleri kisi={k} silebilir={silebilir} />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ─── Kart görünümü ──────────────────────────────────────────

function KisiKarti({ kisi: k, silebilir }: { kisi: KisiSatiri; silebilir: boolean }) {
    return (
        <div className="flex flex-col rounded-xl border bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <h2 className="truncate font-semibold text-gray-900">{k.ad_soyad_unvan}</h2>
                    {k.firma && (
                        <p className="flex items-center gap-1 truncate text-sm text-gray-500">
                            <Building2 className="size-3.5 shrink-0" /> {k.firma}
                        </p>
                    )}
                </div>
                <KategoriRozeti kategori={k.rehber_kategorileri} />
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
                <p className="mt-3 line-clamp-2 rounded-md bg-gray-50 px-2 py-1.5 text-xs text-gray-500">{k.notlar}</p>
            )}

            <div className="mt-3 flex items-center justify-end gap-1 border-t pt-3">
                <KisiIslemleri kisi={k} kargoEtiketli silebilir={silebilir} />
            </div>
        </div>
    );
}
