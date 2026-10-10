// src/app/admin/(panel)/kasa/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { kasaHareketiSil } from "@/actions/kasa";
import { tekBaglanti } from "@/lib/kasa";
import { createClient } from "@/lib/supabase/server";
import { dbHataMesaji } from "@/lib/supabase/yetkili";
import {
    kasaOzeti,
    ODEME_YONTEMLERI,
    YONTEM_KODLARI,
    type KasaGunu,
    type KasaHareketi,
    type KasaKategori,
} from "@/lib/schemas/kasa";
import { bugunISO, gunEkle, paraYaz, uzunTarihYaz } from "@/lib/tarih";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FormHatasi, inputSinifi, SayfaBasligi } from "../../_components/form";
import { tarihMi, uuidMi } from "../../_components/liste";
import SilButonu from "../../_components/SilButonu";
import GunSonuPaneli, { AcilisNakitFormu } from "./GunSonuPaneli";
import HareketFormu from "./HareketFormu";
import KasaSekmeleri from "./KasaSekmeleri";

export const metadata: Metadata = {
    title: "Kasa",
};

type Props = {
    searchParams: Promise<{ tarih?: string; servis?: string; urun?: string }>;
};

type HareketSatiri = KasaHareketi & {
    kasa_kategorileri: { ad: string } | null;
    teknik_servis_kayitlari: { id: string; form_no: string } | null;
    urunler: { id: string; stok_kodu: string } | null;
};

const saatYaz = (iso: string) =>
    new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

export default async function KasaSayfasi({ searchParams }: Props) {
    const p = await searchParams;
    const bugun = bugunISO();
    const tarih = tarihMi(p.tarih) ? p.tarih! : bugun;
    const gelecekGun = tarih > bugun;

    const supabase = await createClient();
    const [kategoriSonucu, hareketSonucu, gunSonucu, acilisSonucu, beklenenSonucu, oncekiKapanis, gecmisSonucu, servis, urun] =
        await Promise.all([
            supabase.from("kasa_kategorileri").select("id, ad, tip, kod, sistem").order("ad"),
            supabase
                .from("kasa_hareketleri")
                .select("*, kasa_kategorileri(ad), teknik_servis_kayitlari(id, form_no), urunler(id, stok_kodu)")
                .eq("tarih", tarih)
                .order("created_at"),
            supabase.from("kasa_gunleri").select("*").eq("tarih", tarih).maybeSingle(),
            supabase.rpc("kasa_acilis_nakit", { p_tarih: tarih }),
            supabase.rpc("kasa_beklenen_nakit", { p_tarih: tarih }),
            supabase.from("kasa_gunleri").select("tarih", { count: "exact", head: true }).lt("tarih", tarih).eq("kapandi", true),
            supabase.from("kasa_hareket_gecmisi").select("id", { count: "exact", head: true }).eq("tarih", tarih),
            tekBaglanti(supabase, "servis", uuidMi(p.servis) ? p.servis : null),
            tekBaglanti(supabase, "urun", uuidMi(p.urun) ? p.urun : null),
        ]);

    const kategoriler = (kategoriSonucu.data ?? []) as KasaKategori[];
    const hareketler = (hareketSonucu.data ?? []) as HareketSatiri[];
    const gun = gunSonucu.data as KasaGunu | null;
    const acilis = Number(acilisSonucu.data ?? 0);
    const beklenen = Number(beklenenSonucu.data ?? 0);
    const ilkKullanim = !oncekiKapanis.count;
    const kapandi = !!gun?.kapandi;
    const ozet = kasaOzeti(hareketler);
    const hata = kategoriSonucu.error ?? hareketSonucu.error;

    return (
        <div>
            <SayfaBasligi baslik="Kasa" aciklama={uzunTarihYaz(tarih)}>
                <Button variant="outline" size="icon" asChild title="Önceki gün">
                    <Link href={`/admin/kasa?tarih=${gunEkle(tarih, -1)}`} aria-label="Önceki gün">
                        <ChevronLeft />
                    </Link>
                </Button>
                <form action="/admin/kasa" className="flex gap-2">
                    <input type="date" name="tarih" defaultValue={tarih} aria-label="Tarih" className={cn(inputSinifi, "py-1.5")} />
                    <Button type="submit" variant="outline">
                        Git
                    </Button>
                </form>
                {tarih !== bugun && (
                    <Button variant="outline" asChild>
                        <Link href="/admin/kasa">Bugün</Link>
                    </Button>
                )}
                <Button variant="outline" size="icon" asChild title="Sonraki gün">
                    <Link href={`/admin/kasa?tarih=${gunEkle(tarih, 1)}`} aria-label="Sonraki gün">
                        <ChevronRight />
                    </Link>
                </Button>
            </SayfaBasligi>

            <KasaSekmeleri aktif="/admin/kasa" />

            {hata && <FormHatasi mesaj={dbHataMesaji(hata)} />}

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                    {!kapandi && !gelecekGun && (
                        <Kart baslik="Yeni Hareket">
                            <HareketFormu
                                key={tarih}
                                kategoriler={kategoriler}
                                tarih={tarih}
                                bugun={bugun}
                                baslangic={{ servis, urun }}
                            />
                        </Kart>
                    )}

                    <Kart baslik={`Hareketler (${hareketler.length})`} dolgusuz>
                        {hareketler.length === 0 ? (
                            <p className="px-5 pb-5 text-sm text-gray-500">Bu güne ait hareket yok.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-y bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                                        <tr>
                                            <th className="px-4 py-2 font-medium">Saat</th>
                                            <th className="px-4 py-2 font-medium">Kategori / Açıklama</th>
                                            <th className="px-4 py-2 font-medium">Yöntem</th>
                                            <th className="px-4 py-2 text-right font-medium">Tutar</th>
                                            {!kapandi && <th className="px-4 py-2" />}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {hareketler.map((h) => (
                                            <tr key={h.id} className="hover:bg-gray-50">
                                                <td className="whitespace-nowrap px-4 py-2.5 text-gray-500">{saatYaz(h.created_at)}</td>
                                                <td className="px-4 py-2.5">
                                                    <p className="font-medium">{h.kasa_kategorileri?.ad}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {[h.kimden_kime, h.aciklama].filter(Boolean).join(" · ")}
                                                        {h.teknik_servis_kayitlari && (
                                                            <Link
                                                                href={`/admin/teknik-servis/${h.teknik_servis_kayitlari.id}`}
                                                                className="ml-1 text-[var(--color-secondary)] hover:underline"
                                                            >
                                                                Servis #{h.teknik_servis_kayitlari.form_no}
                                                            </Link>
                                                        )}
                                                        {h.urunler && (
                                                            <Link
                                                                href={`/admin/stok/${h.urunler.id}`}
                                                                className="ml-1 text-[var(--color-secondary)] hover:underline"
                                                            >
                                                                {h.urunler.stok_kodu} × {h.urun_adet}
                                                            </Link>
                                                        )}
                                                    </p>
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-2.5 text-gray-600">{ODEME_YONTEMLERI[h.yontem]}</td>
                                                <td
                                                    className={cn(
                                                        "whitespace-nowrap px-4 py-2.5 text-right font-semibold tabular-nums",
                                                        h.tip === "gelir" ? "text-green-700" : "text-[var(--color-primary)]"
                                                    )}
                                                >
                                                    {h.tip === "gelir" ? "+" : "−"}
                                                    {paraYaz(Number(h.tutar))}
                                                </td>
                                                {!kapandi && (
                                                    <td className="whitespace-nowrap px-4 py-2.5 text-right">
                                                        <Button variant="ghost" size="icon" asChild title="Düzenle">
                                                            <Link href={`/admin/kasa/${h.id}`} aria-label="Düzenle">
                                                                <Pencil />
                                                            </Link>
                                                        </Button>
                                                        <SilButonu
                                                            onay={`${paraYaz(Number(h.tutar))} tutarındaki ${h.tip} hareketi silinsin mi?${h.urunler ? " Ürünün stoğu geri alınır." : ""}`}
                                                            sil={kasaHareketiSil.bind(null, h.id)}
                                                        />
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Kart>
                </div>

                <div className="space-y-4">
                    <Kart baslik="Gün Özeti">
                        <dl className="space-y-1 text-sm">
                            <OzetSatiri etiket="Toplam gelir" deger={paraYaz(ozet.gelir)} renk="text-green-700" />
                            <OzetSatiri etiket="Toplam gider" deger={paraYaz(ozet.gider)} renk="text-[var(--color-primary)]" />
                            <OzetSatiri etiket="Net" deger={paraYaz(ozet.net)} kalin />
                        </dl>
                        <table className="mt-4 w-full text-sm">
                            <thead className="text-xs text-gray-500">
                                <tr>
                                    <th className="pb-1 text-left font-medium">Yöntem</th>
                                    <th className="pb-1 text-right font-medium">Gelir</th>
                                    <th className="pb-1 text-right font-medium">Gider</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {YONTEM_KODLARI.map((y) => (
                                    <tr key={y}>
                                        <td className="py-1">{ODEME_YONTEMLERI[y]}</td>
                                        <td className="py-1 text-right tabular-nums">{paraYaz(ozet.yontemler[y].gelir)}</td>
                                        <td className="py-1 text-right tabular-nums">{paraYaz(ozet.yontemler[y].gider)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <dl className="mt-4 space-y-1 border-t pt-3 text-sm">
                            <OzetSatiri etiket="Açılış nakdi" deger={paraYaz(acilis)} />
                            <OzetSatiri etiket="Kasada olması gereken" deger={paraYaz(beklenen)} kalin />
                        </dl>
                        {ilkKullanim && !kapandi && (
                            <div className="mt-4 border-t pt-3">
                                <AcilisNakitFormu tarih={tarih} mevcut={acilis} />
                            </div>
                        )}
                    </Kart>

                    <Kart baslik="Gün Sonu">
                        <GunSonuPaneli tarih={tarih} gun={gun} beklenenNakit={beklenen} gelecekGun={gelecekGun} />
                    </Kart>

                    {!!gecmisSonucu.count && (
                        <p className="px-1 text-xs text-gray-500">
                            Bu günde {gecmisSonucu.count} düzeltme / silme yapıldı; eski halleri kayıt altında.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

function Kart({ baslik, dolgusuz, children }: { baslik: string; dolgusuz?: boolean; children: React.ReactNode }) {
    return (
        <section className={cn("rounded-xl border bg-white shadow-sm", !dolgusuz && "p-5")}>
            <h2 className={cn("mb-3 font-semibold text-[var(--color-secondary)]", dolgusuz && "px-5 pt-5")}>{baslik}</h2>
            {children}
        </section>
    );
}

function OzetSatiri({ etiket, deger, renk, kalin }: { etiket: string; deger: string; renk?: string; kalin?: boolean }) {
    return (
        <div className={cn("flex justify-between gap-2", kalin && "font-semibold")}>
            <dt className={kalin ? undefined : "text-gray-500"}>{etiket}</dt>
            <dd className={cn("tabular-nums", renk)}>{deger}</dd>
        </div>
    );
}
