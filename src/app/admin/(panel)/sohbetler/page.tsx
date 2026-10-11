// src/app/admin/(panel)/sohbetler/page.tsx
// Web sitesindeki canlı destek penceresinden gelen sohbetler: solda liste, sağda seçili sohbet.
// Yeni mesajlarda sayfa, AdminKabuk'taki Realtime dinleyicisinin sinyaliyle yenilenir (SohbetYenileyici).
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Globe, Mail, MessagesSquare, Phone, Search } from "lucide-react";
import { sohbetSil } from "@/actions/sohbet";
import { izinVar } from "@/lib/izinler";
import type { Sohbet, SohbetMesaji } from "@/lib/schemas/sohbet";
import { createClient } from "@/lib/supabase/server";
import { dbHataMesaji, izinGerekli } from "@/lib/supabase/yetkili";
import { saatYaz, tarihSaatYaz } from "@/lib/tarih";
import { cn } from "@/lib/utils";
import { FormHatasi, inputSinifi, SayfaBasligi } from "../../_components/form";
import { aramaDeseni, linkOlustur, secenekOku, uuidMi } from "../../_components/liste";
import SilButonu from "../../_components/SilButonu";
import { DurumButonu, MesajListesi, SohbetYenileyici, YanitFormu } from "./SohbetIstemci";

export const metadata: Metadata = {
    title: "Canlı Sohbet",
};

type Props = {
    searchParams: Promise<{ id?: string; durum?: string; q?: string }>;
};

const DURUMLAR = ["acik", "kapali", "tumu"] as const;
const LISTE_SINIRI = 100;

type ListeSohbeti = Pick<Sohbet, "id" | "ad" | "telefon" | "eposta" | "durum" | "okunmamis" | "son_mesaj_at"> & {
    sohbet_mesajlari: { metin: string; gonderen: string }[];
};

export default async function SohbetlerSayfasi({ searchParams }: Props) {
    const o = await izinGerekli("sohbet");

    const p = await searchParams;
    const durum = secenekOku(p.durum, DURUMLAR, "acik");
    const q = (p.q ?? "").trim();
    const seciliId = uuidMi(p.id) ? p.id! : null;
    const filtreler = { durum: durum === "acik" ? undefined : durum, q: q || undefined };
    const link = (ek: Record<string, string | undefined>) => linkOlustur("/admin/sohbetler", { ...filtreler, ...ek });

    const supabase = await createClient();

    let sorgu = supabase
        .from("sohbetler")
        .select("id, ad, telefon, eposta, durum, okunmamis, son_mesaj_at, sohbet_mesajlari(metin, gonderen)")
        .order("son_mesaj_at", { ascending: false })
        .order("created_at", { referencedTable: "sohbet_mesajlari", ascending: false })
        .limit(1, { referencedTable: "sohbet_mesajlari" })
        .limit(LISTE_SINIRI);
    if (durum !== "tumu") sorgu = sorgu.eq("durum", durum);
    if (q) sorgu = sorgu.ilike("arama", aramaDeseni(q));

    const [liste, secili] = await Promise.all([
        sorgu,
        seciliId
            ? Promise.all([
                  supabase
                      .from("sohbetler")
                      .select("id, ad, telefon, eposta, sayfa, durum, okunmamis, son_mesaj_at, kapanma_at, created_at")
                      .eq("id", seciliId)
                      .maybeSingle(),
                  supabase
                      .from("sohbet_mesajlari")
                      .select("id, gonderen, metin, created_at, personel(ad_soyad)")
                      .eq("sohbet_id", seciliId)
                      .order("created_at"),
              ])
            : null,
    ]);

    const sohbetler = (liste.data ?? []) as unknown as ListeSohbeti[];
    const sohbet = (secili?.[0].data ?? null) as Sohbet | null;
    const mesajlar = (secili?.[1].data ?? []) as unknown as SohbetMesaji[];
    const hata = liste.error ?? secili?.[0].error ?? secili?.[1].error;

    return (
        <div>
            <SohbetYenileyici />
            <SayfaBasligi baslik="Canlı Sohbet" aciklama="Web sitesindeki canlı destek penceresinden gelen sohbetler." />

            {hata && <FormHatasi mesaj={dbHataMesaji(hata)} />}

            <div className="grid h-[calc(100dvh-13rem)] min-h-[480px] gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
                {/* Liste */}
                <aside className={cn("min-h-0 flex-col overflow-hidden rounded-xl border bg-white shadow-sm", seciliId ? "hidden lg:flex" : "flex")}>
                    <div className="space-y-2 border-b p-3">
                        <nav className="flex gap-1 rounded-lg bg-gray-100 p-1 text-sm">
                            {(
                                [
                                    ["acik", "Açık"],
                                    ["kapali", "Kapalı"],
                                    ["tumu", "Tümü"],
                                ] as const
                            ).map(([deger, etiket]) => (
                                <Link
                                    key={deger}
                                    href={linkOlustur("/admin/sohbetler", { durum: deger === "acik" ? undefined : deger, q: q || undefined })}
                                    className={cn(
                                        "flex-1 rounded-md px-2 py-1 text-center font-medium",
                                        durum === deger ? "bg-white text-[var(--color-secondary)] shadow-sm" : "text-gray-500 hover:text-gray-800"
                                    )}
                                >
                                    {etiket}
                                </Link>
                            ))}
                        </nav>
                        <form action="/admin/sohbetler" className="relative">
                            {filtreler.durum && <input type="hidden" name="durum" value={filtreler.durum} />}
                            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                            <input name="q" type="search" defaultValue={q} placeholder="İsim, telefon, e-posta..." className={cn(inputSinifi, "py-1.5 pl-9")} />
                        </form>
                    </div>

                    <ul className="min-h-0 flex-1 divide-y overflow-y-auto">
                        {sohbetler.length === 0 && <li className="p-6 text-center text-sm text-gray-500">Sohbet bulunamadı.</li>}
                        {sohbetler.map((s) => {
                            const son = s.sohbet_mesajlari[0];
                            return (
                                <li key={s.id}>
                                    <Link
                                        href={link({ id: s.id })}
                                        className={cn(
                                            "block px-4 py-3 hover:bg-gray-50",
                                            s.id === seciliId && "bg-[var(--color-secondary)]/5",
                                            s.okunmamis && s.durum === "acik" && "border-l-4 border-l-[var(--color-primary)]"
                                        )}
                                    >
                                        <div className="flex items-baseline justify-between gap-2">
                                            <span className={cn("truncate text-sm", s.okunmamis ? "font-semibold text-gray-900" : "font-medium text-gray-700")}>
                                                {s.ad}
                                            </span>
                                            <time dateTime={s.son_mesaj_at} className="shrink-0 text-xs text-gray-400">
                                                {listeZamani(s.son_mesaj_at)}
                                            </time>
                                        </div>
                                        <p className="mt-0.5 truncate text-xs text-gray-500">
                                            {son ? `${son.gonderen === "personel" ? "Siz: " : son.gonderen === "sistem" ? "Otomatik: " : ""}${son.metin}` : "—"}
                                        </p>
                                        {s.durum === "kapali" && <span className="mt-1 inline-block text-[11px] text-gray-400">Kapalı</span>}
                                    </Link>
                                </li>
                            );
                        })}
                        {sohbetler.length === LISTE_SINIRI && (
                            <li className="p-3 text-center text-xs text-gray-400">Son {LISTE_SINIRI} sohbet gösteriliyor. Eskiler için arama yapın.</li>
                        )}
                    </ul>
                </aside>

                {/* Seçili sohbet */}
                <section className={cn("min-h-0 flex-col overflow-hidden rounded-xl border bg-white shadow-sm", seciliId ? "flex" : "hidden lg:flex")}>
                    {!seciliId ? (
                        <BosEkran mesaj="Görüntülemek için soldan bir sohbet seçin." />
                    ) : !sohbet ? (
                        <BosEkran mesaj="Sohbet bulunamadı. Silinmiş olabilir." geriLinki={link({})} />
                    ) : (
                        <>
                            <header className="flex flex-wrap items-start justify-between gap-2 border-b px-4 py-3">
                                <div className="flex min-w-0 items-start gap-2">
                                    <Link href={link({})} aria-label="Listeye dön" className="mt-0.5 rounded-md p-1 text-gray-500 hover:bg-gray-100 lg:hidden">
                                        <ArrowLeft className="size-4" />
                                    </Link>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-gray-900">{sohbet.ad}</p>
                                        <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                                            {sohbet.telefon && (
                                                <a href={`tel:${sohbet.telefon}`} className="flex items-center gap-1 hover:underline">
                                                    <Phone className="size-3.5 text-gray-400" /> {sohbet.telefon}
                                                </a>
                                            )}
                                            {sohbet.eposta && (
                                                <a href={`mailto:${sohbet.eposta}`} className="flex items-center gap-1 hover:underline">
                                                    <Mail className="size-3.5 text-gray-400" /> {sohbet.eposta}
                                                </a>
                                            )}
                                            {sohbet.sayfa && (
                                                <span className="flex items-center gap-1" title="Sohbetin başlatıldığı sayfa">
                                                    <Globe className="size-3.5 text-gray-400" /> {sohbet.sayfa}
                                                </span>
                                            )}
                                            <span className="text-gray-400">{tarihSaatYaz(sohbet.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <DurumButonu id={sohbet.id} durum={sohbet.durum} />
                                    {izinVar(o.rol, "sil") && (
                                        <SilButonu onay={`${sohbet.ad} ile olan sohbet ve tüm mesajları silinsin mi?`} sil={sohbetSil.bind(null, sohbet.id)} />
                                    )}
                                </div>
                            </header>

                            <MesajListesi sohbetId={sohbet.id} okunmamis={!!sohbet.okunmamis} mesajSayisi={mesajlar.length}>
                                {mesajlar.map((m) => {
                                    if (m.gonderen === "sistem") {
                                        return (
                                            <li key={m.id} className="flex flex-col items-center">
                                                <p className="max-w-[85%] rounded-lg bg-amber-50 px-3 py-1.5 text-center text-xs text-amber-800">{m.metin}</p>
                                                <time dateTime={m.created_at} className="mt-0.5 text-[11px] text-gray-400">
                                                    Otomatik · {saatYaz(m.created_at)}
                                                </time>
                                            </li>
                                        );
                                    }
                                    const personel = m.gonderen === "personel";
                                    return (
                                        <li key={m.id} className={cn("flex flex-col", personel ? "items-end" : "items-start")}>
                                            <p
                                                className={cn(
                                                    "max-w-[80%] whitespace-pre-line break-words rounded-2xl px-3 py-2 text-sm",
                                                    personel
                                                        ? "rounded-br-sm bg-[var(--color-secondary)] text-white"
                                                        : "rounded-bl-sm bg-white text-gray-800 shadow-sm"
                                                )}
                                            >
                                                {m.metin}
                                            </p>
                                            <span className="mt-0.5 text-[11px] text-gray-400">
                                                {personel && `${m.personel?.ad_soyad ?? "Personel"} · `}
                                                <time dateTime={m.created_at} title={tarihSaatYaz(m.created_at)}>
                                                    {saatYaz(m.created_at)}
                                                </time>
                                            </span>
                                        </li>
                                    );
                                })}
                            </MesajListesi>

                            {sohbet.durum === "acik" ? (
                                <YanitFormu sohbetId={sohbet.id} />
                            ) : (
                                <p className="border-t px-4 py-3 text-center text-sm text-gray-500">
                                    Sohbet {sohbet.kapanma_at ? `${tarihSaatYaz(sohbet.kapanma_at)} tarihinde ` : ""}kapatıldı. Yanıt yazmak için yeniden açın.
                                </p>
                            )}
                        </>
                    )}
                </section>
            </div>
        </div>
    );
}

function BosEkran({ mesaj, geriLinki }: { mesaj: string; geriLinki?: string }) {
    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-sm text-gray-500">
            <MessagesSquare className="size-10 text-gray-300" />
            {mesaj}
            {geriLinki && (
                <Link href={geriLinki} className="text-[var(--color-secondary)] hover:underline lg:hidden">
                    Listeye dön
                </Link>
            )}
        </div>
    );
}

// Bugünse saat, değilse tarih.
function listeZamani(iso: string) {
    const tam = tarihSaatYaz(iso); // "10.10.2026 14:35"
    const bugun = tarihSaatYaz(new Date().toISOString()).slice(0, 10);
    return tam.startsWith(bugun) ? saatYaz(iso) : tam.slice(0, 10);
}
