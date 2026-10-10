// src/app/admin/(panel)/page.tsx
// Özet: role göre bugünkü kasa, servis durumu, teslime hazır cihazlar ve kritik stok.
import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Package, PackagePlus, Phone, Plus, ShieldAlert, Wallet, Wrench } from "lucide-react";
import { izinVar } from "@/lib/izinler";
import { createClient } from "@/lib/supabase/server";
import { oturum } from "@/lib/supabase/yetkili";
import { kasaOzeti, type KasaHareketi } from "@/lib/schemas/kasa";
import { DURUM_KODLARI, SERVIS_DURUMLARI, type ServisDurumu, type ServisKaydi } from "@/lib/schemas/servis";
import type { Urun } from "@/lib/schemas/stok";
import { bugunISO, paraYaz, tarihYaz } from "@/lib/tarih";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { anaButonSinifi } from "../_components/form";
import DurumRozeti from "./teknik-servis/DurumRozeti";

export const metadata: Metadata = {
    title: "Özet",
};

type AcikServis = Pick<ServisKaydi, "id" | "form_no" | "musteri_ad_soyad" | "musteri_telefon" | "cihaz_marka_model" | "durum" | "tahmini_teslim_tarihi">;

export default async function AdminOzetSayfasi({ searchParams }: { searchParams: Promise<{ yetkisiz?: string }> }) {
    const { yetkisiz } = await searchParams;
    const o = await oturum();
    const rol = o?.rol;
    const kasaGorur = izinVar(rol, "kasa");
    const bugun = bugunISO();
    const supabase = await createClient();

    const [servisSonucu, kritikSonucu, kasa] = await Promise.all([
        supabase
            .from("teknik_servis_kayitlari")
            .select("id, form_no, musteri_ad_soyad, musteri_telefon, cihaz_marka_model, durum, tahmini_teslim_tarihi")
            .neq("durum", "teslim_edildi")
            .order("giris_tarihi", { ascending: true })
            .limit(1000),
        supabase
            .from("urunler")
            .select("id, stok_kodu, ad, stok_adedi, min_stok", { count: "exact" })
            .eq("kritik", true)
            .order("stok_adedi")
            .limit(8),
        kasaGorur ? kasaVerisi(supabase, bugun) : Promise.resolve(null),
    ]);

    const acikServisler = (servisSonucu.data ?? []) as AcikServis[];
    const durumSayilari = new Map<ServisDurumu, number>();
    for (const s of acikServisler) durumSayilari.set(s.durum, (durumSayilari.get(s.durum) ?? 0) + 1);
    const gecikenler = acikServisler.filter((s) => s.tahmini_teslim_tarihi && s.tahmini_teslim_tarihi < bugun);
    const teslimHazir = acikServisler.filter((s) => s.durum === "teslim_hazir");
    const kritikler = (kritikSonucu.data ?? []) as Pick<Urun, "id" | "stok_kodu" | "ad" | "stok_adedi" | "min_stok">[];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-[var(--color-secondary)]">Hoş geldiniz{o?.ad ? `, ${o.ad}` : ""}</h1>
                <p className="mt-1 text-sm text-gray-500">{tarihYaz(bugun)} · Kasırga Bilgisayar yönetim paneli</p>
            </div>

            {yetkisiz && (
                <p role="alert" className="flex items-center gap-2 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    <ShieldAlert className="size-4 shrink-0" /> Açmaya çalıştığınız sayfa için yetkiniz yok.
                </p>
            )}

            {/* Hızlı işlemler */}
            <div className="flex flex-wrap gap-2">
                {izinVar(rol, "servis_yaz") && (
                    <Button asChild className={anaButonSinifi}>
                        <Link href="/admin/teknik-servis/yeni">
                            <Plus /> Yeni Servis Kaydı
                        </Link>
                    </Button>
                )}
                {kasaGorur && (
                    <Button variant="outline" asChild>
                        <Link href="/admin/kasa">
                            <Wallet /> Kasa Hareketi Gir
                        </Link>
                    </Button>
                )}
                {izinVar(rol, "stok_yonet") && (
                    <Button variant="outline" asChild>
                        <Link href="/admin/stok/yeni">
                            <PackagePlus /> Yeni Ürün
                        </Link>
                    </Button>
                )}
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                {/* Bugünkü kasa */}
                {kasa && (
                    <Kart baslik="Bugünkü Kasa" Ikon={Wallet} href="/admin/kasa">
                        <dl className="grid grid-cols-3 gap-2 text-center">
                            <Sayi etiket="Gelir" deger={paraYaz(kasa.ozet.gelir)} renk="text-green-700" />
                            <Sayi etiket="Gider" deger={paraYaz(kasa.ozet.gider)} renk="text-[var(--color-primary)]" />
                            <Sayi etiket="Net" deger={paraYaz(kasa.ozet.net)} />
                        </dl>
                        <div className="mt-4 space-y-1 border-t pt-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Kasada olması gereken nakit</span>
                                <span className="font-semibold tabular-nums">{paraYaz(kasa.beklenen)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Gün sonu</span>
                                <span className={kasa.kapandi ? "text-green-700" : "text-amber-700"}>{kasa.kapandi ? "Kapatıldı" : "Açık"}</span>
                            </div>
                        </div>
                        {kasa.kapanmamisGun && (
                            <Link
                                href={`/admin/kasa?tarih=${kasa.kapanmamisGun}`}
                                className="mt-3 flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800 hover:bg-amber-100"
                            >
                                <AlertTriangle className="size-4 shrink-0" /> {tarihYaz(kasa.kapanmamisGun)} günü kapatılmamış.
                            </Link>
                        )}
                    </Kart>
                )}

                {/* Teknik servis */}
                <Kart baslik="Teknik Servis" Ikon={Wrench} href="/admin/teknik-servis?durum=acik">
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">{acikServisler.length}</span>
                        <span className="text-sm text-gray-500">açık kayıt</span>
                        {gecikenler.length > 0 && (
                            <span className="ml-auto rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-[var(--color-primary)]">
                                {gecikenler.length} gecikmiş
                            </span>
                        )}
                    </div>
                    <ul className="mt-4 space-y-1.5 text-sm">
                        {DURUM_KODLARI.filter((d) => d !== "teslim_edildi").map((d) => (
                            <li key={d}>
                                <Link href={`/admin/teknik-servis?durum=${d}`} className="flex items-center justify-between gap-2 hover:underline">
                                    <span className="flex items-center gap-2">
                                        <span className={cn("size-2 rounded-full", SERVIS_DURUMLARI[d].nokta)} />
                                        {SERVIS_DURUMLARI[d].etiket}
                                    </span>
                                    <span className="tabular-nums text-gray-600">{durumSayilari.get(d) ?? 0}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </Kart>

                {/* Kritik stok */}
                <Kart baslik="Kritik Stok" Ikon={Package} href="/admin/stok?stok=kritik">
                    {kritikler.length === 0 ? (
                        <p className="text-sm text-gray-500">Minimum stok seviyesine inen ürün yok.</p>
                    ) : (
                        <>
                            <p className="mb-3 text-sm text-gray-500">
                                <span className="text-2xl font-bold text-[var(--color-primary)]">{kritikSonucu.count ?? kritikler.length}</span> ürün minimum stokta
                            </p>
                            <ul className="divide-y text-sm">
                                {kritikler.map((u) => (
                                    <li key={u.id}>
                                        <Link href={`/admin/stok/${u.id}`} className="flex items-center justify-between gap-2 py-1.5 hover:underline">
                                            <span className="min-w-0 truncate">
                                                <span className="font-mono text-xs text-gray-500">{u.stok_kodu}</span> {u.ad}
                                            </span>
                                            <span className="shrink-0 tabular-nums text-[var(--color-primary)]">
                                                {u.stok_adedi} / {u.min_stok}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </Kart>
            </div>

            {/* Teslime hazır cihazlar: müşteri aranmalı */}
            {teslimHazir.length > 0 && (
                <section className="rounded-xl border bg-white shadow-sm">
                    <h2 className="flex items-center gap-2 px-5 pt-5 font-semibold text-[var(--color-secondary)]">
                        Teslime Hazır Cihazlar <span className="font-normal text-gray-500">({teslimHazir.length})</span>
                    </h2>
                    <p className="px-5 text-xs text-gray-500">Müşteriye haber verilmesi gereken cihazlar.</p>
                    <ul className="mt-3 divide-y text-sm">
                        {teslimHazir.slice(0, 10).map((s) => (
                            <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-2.5">
                                <Link href={`/admin/teknik-servis/${s.id}`} className="min-w-0 hover:underline">
                                    <span className="font-semibold text-[var(--color-secondary)]">#{s.form_no}</span> {s.musteri_ad_soyad}
                                    <span className="text-gray-500"> · {s.cihaz_marka_model}</span>
                                </Link>
                                <span className="flex items-center gap-3">
                                    <DurumRozeti durum={s.durum} />
                                    <a href={`tel:${s.musteri_telefon}`} className="inline-flex items-center gap-1 text-[var(--color-secondary)] hover:underline">
                                        <Phone className="size-3.5" /> {s.musteri_telefon}
                                    </a>
                                </span>
                            </li>
                        ))}
                    </ul>
                    {teslimHazir.length > 10 && (
                        <Link
                            href="/admin/teknik-servis?durum=teslim_hazir"
                            className="flex items-center gap-1 px-5 py-3 text-sm text-[var(--color-secondary)] hover:underline"
                        >
                            Tümünü gör <ArrowRight className="size-4" />
                        </Link>
                    )}
                </section>
            )}
        </div>
    );
}

// Bugünün kasa özeti ve önceki günlerden kapatılmamış en eski gün.
async function kasaVerisi(supabase: Awaited<ReturnType<typeof createClient>>, bugun: string) {
    const [hareketler, gun, beklenen, oncekiHareketler, kapananlar] = await Promise.all([
        supabase.from("kasa_hareketleri").select("tip, yontem, tutar, kategori_id").eq("tarih", bugun),
        supabase.from("kasa_gunleri").select("kapandi").eq("tarih", bugun).maybeSingle(),
        supabase.rpc("kasa_beklenen_nakit", { p_tarih: bugun }),
        supabase.from("kasa_hareketleri").select("tarih").lt("tarih", bugun).order("tarih", { ascending: false }).limit(2000),
        supabase.from("kasa_gunleri").select("tarih").lt("tarih", bugun).eq("kapandi", true).order("tarih", { ascending: false }).limit(2000),
    ]);

    const kapali = new Set((kapananlar.data ?? []).map((g) => g.tarih as string));
    const acikGunler = [...new Set((oncekiHareketler.data ?? []).map((h) => h.tarih as string))].filter((t) => !kapali.has(t)).sort();

    return {
        ozet: kasaOzeti((hareketler.data ?? []) as Pick<KasaHareketi, "tip" | "yontem" | "tutar" | "kategori_id">[]),
        kapandi: !!gun.data?.kapandi,
        beklenen: Number(beklenen.data ?? 0),
        kapanmamisGun: acikGunler[0] ?? null,
    };
}

function Kart({ baslik, Ikon, href, children }: { baslik: string; Ikon: React.ComponentType<{ className?: string }>; href: string; children: React.ReactNode }) {
    return (
        <section className="flex flex-col rounded-xl border bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <Link href={href} className="font-semibold text-[var(--color-secondary)] hover:underline">
                    {baslik}
                </Link>
                <Ikon className="size-5 text-[var(--color-primary)]" />
            </div>
            <div className="flex-1">{children}</div>
        </section>
    );
}

function Sayi({ etiket, deger, renk }: { etiket: string; deger: string; renk?: string }) {
    return (
        <div className="rounded-md bg-gray-50 p-2">
            <dt className="text-xs text-gray-500">{etiket}</dt>
            <dd className={cn("text-sm font-semibold tabular-nums", renk)}>{deger}</dd>
        </div>
    );
}
