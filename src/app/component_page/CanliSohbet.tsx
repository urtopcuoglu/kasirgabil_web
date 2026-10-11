// src/app/component_page/CanliSohbet.tsx
// Vitrindeki canlı sohbet penceresi. Ziyaretçi oturum açmaz: sohbet başlatınca aldığı erişim anahtarı tarayıcıda saklanır
// ve tüm işlemler bu anahtarla veritabanı fonksiyonlarına yapılır (migration 20261011050000_canli_sohbet.sql).
// Yeni mesaj sinyali Realtime'ın herkese açık 'sohbet-<id>' kanalından gelir; içerik anahtarla çekilir.
"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MessageCircle, RotateCcw, Send, X } from "lucide-react";
import { mesajMetni, sohbetBaslatSemasi, type SohbetBaslatGirdisi, type ZiyaretciSohbeti } from "@/lib/schemas/sohbet";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { saatYaz } from "@/lib/tarih";
import { cn } from "@/lib/utils";
import YuzenEtiket from "./YuzenEtiket";

const DEPO_ANAHTARI = "kasirga-sohbet";
const YEDEK_YENILEME_MS = 15_000; // Realtime sinyali kaçarsa pencere açıkken mesajlar bu aralıkla yenilenir.

type Kayit = { id: string; anahtar: string };

// Tek istemci, ayrı depolama anahtarıyla: panel oturumunun (aynı tarayıcıda açıksa) istemcisiyle çakışmasın.
let istemci: SupabaseClient | undefined;
function sohbetIstemcisi() {
    istemci ??= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
        auth: { persistSession: false, autoRefreshToken: false, storageKey: "kasirga-sohbet-istemci" },
    });
    return istemci;
}

function kayitOku(): Kayit | null {
    try {
        const deger = JSON.parse(localStorage.getItem(DEPO_ANAHTARI) ?? "null");
        return deger?.id && deger?.anahtar ? deger : null;
    } catch {
        return null;
    }
}

function kayitYaz(kayit: Kayit | null) {
    try {
        if (kayit) localStorage.setItem(DEPO_ANAHTARI, JSON.stringify(kayit));
        else localStorage.removeItem(DEPO_ANAHTARI);
    } catch {
        // Gizli pencere vb.: sohbet bu sayfa açıkken sürer.
    }
}

// P0001: veritabanı fonksiyonlarındaki raise exception mesajları kullanıcıya gösterilebilir.
function hataMesaji(error: { code?: string; message: string }) {
    console.error("[sohbet]", error.code, error.message);
    return error.code === "P0001" ? error.message : "Bağlantı sorunu oluştu. Lütfen tekrar deneyin.";
}

const inputSinifi =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] aria-invalid:border-[var(--color-primary)]";

export default function CanliSohbet({ whatsappVar }: { whatsappVar: boolean }) {
    const supabase = sohbetIstemcisi();
    const [acik, setAcik] = useState(false);
    const [kayit, setKayit] = useState<Kayit | null>(null);
    const [sohbet, setSohbet] = useState<ZiyaretciSohbeti | null>(null);
    const [cevrimici, setCevrimici] = useState<boolean | null>(null);
    const [yeniMesaj, setYeniMesaj] = useState(false);
    const acikRef = useRef(acik);

    useEffect(() => {
        acikRef.current = acik;
    }, [acik]);

    useEffect(() => setKayit(kayitOku()), []);

    const yenile = useCallback(async () => {
        if (!kayit) return;
        const { data, error } = await supabase.rpc("sohbet_getir", { p_anahtar: kayit.anahtar });
        if (error) return console.error("[sohbet_getir]", error.code, error.message);
        if (!data) {
            // Sohbet panelden silinmiş.
            kayitYaz(null);
            setKayit(null);
            setSohbet(null);
            return;
        }
        setSohbet(data as ZiyaretciSohbeti);
    }, [kayit, supabase]);

    // Sohbet varsa sinyalleri dinle (pencere kapalıyken de: yanıt gelince butonda işaret çıksın).
    useEffect(() => {
        if (!kayit) return;
        yenile();
        const kanal = supabase
            .channel(`sohbet-${kayit.id}`)
            .on("broadcast", { event: "mesaj" }, ({ payload }) => {
                yenile();
                if (payload?.gonderen !== "ziyaretci" && !acikRef.current) setYeniMesaj(true);
            })
            .on("broadcast", { event: "durum" }, () => yenile())
            .subscribe();
        return () => {
            supabase.removeChannel(kanal);
        };
    }, [kayit, supabase, yenile]);

    // Pencere açıkken: çevrimiçi durumu ve yedek yenileme.
    useEffect(() => {
        if (!acik) return;
        setYeniMesaj(false);
        supabase.rpc("sohbet_cevrimici_mi").then(({ data }) => setCevrimici(data === true));
        if (!kayit) return;
        yenile();
        const zamanlayici = setInterval(() => document.visibilityState === "visible" && yenile(), YEDEK_YENILEME_MS);
        return () => clearInterval(zamanlayici);
    }, [acik, kayit, supabase, yenile]);

    const baslatildi = (yeni: Kayit) => {
        kayitYaz(yeni);
        setKayit(yeni);
    };

    const yeniSohbet = () => {
        kayitYaz(null);
        setKayit(null);
        setSohbet(null);
    };

    return (
        <>
            {acik && (
                <section
                    aria-label="Canlı destek"
                    className={cn(
                        "fixed right-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 sm:right-6",
                        whatsappVar ? "bottom-40 h-[min(520px,calc(100dvh-12rem))]" : "bottom-24 h-[min(520px,calc(100dvh-8rem))]"
                    )}
                >
                    <header className="flex items-center justify-between gap-3 bg-[var(--color-secondary)] px-4 py-3 text-white">
                        <div>
                            <p className="font-semibold">Canlı Destek</p>
                            <p className="flex items-center gap-1.5 text-xs text-white/80">
                                <span className={cn("size-2 rounded-full", cevrimici ? "bg-green-400" : "bg-gray-400")} />
                                {cevrimici === null ? "Bağlanıyor..." : cevrimici ? "Çevrimiçiyiz" : "Şu an çevrimdışıyız"}
                            </p>
                        </div>
                        <button type="button" onClick={() => setAcik(false)} aria-label="Sohbeti kapat" className="rounded-md p-1 hover:bg-white/10">
                            <X size={20} />
                        </button>
                    </header>

                    {kayit && sohbet ? (
                        <SohbetEkrani supabase={supabase} kayit={kayit} sohbet={sohbet} yenile={yenile} yeniSohbet={yeniSohbet} />
                    ) : kayit ? (
                        <div className="flex flex-1 items-center justify-center">
                            <Loader2 className="animate-spin text-gray-400" />
                        </div>
                    ) : (
                        <BaslatFormu supabase={supabase} cevrimici={cevrimici} baslatildi={baslatildi} />
                    )}
                </section>
            )}

            <button
                type="button"
                onClick={() => setAcik((a) => !a)}
                aria-label={acik ? "Canlı desteği kapat" : "Canlı destek"}
                aria-expanded={acik}
                className={cn("group fixed right-6 z-50 rounded-full focus-visible:outline-none", whatsappVar ? "bottom-[5.5rem]" : "bottom-6")}
            >
                <YuzenEtiket metin="Canlı Destek" renk="var(--color-primary)" gizli={acik} />
                <span className="relative block rounded-full bg-[var(--color-primary)] p-3 text-white shadow-lg transition-transform duration-200 group-hover:scale-110 group-focus-visible:ring-4 group-focus-visible:ring-[var(--color-primary)]/30">
                    {acik ? <X size={24} /> : <MessageCircle size={24} />}
                    {yeniMesaj && !acik && (
                        <span className="absolute -right-0.5 -top-0.5 size-3.5 rounded-full border-2 border-white bg-green-500" aria-label="Yeni mesaj" />
                    )}
                </span>
            </button>
        </>
    );
}

type Istemci = SupabaseClient;

function BaslatFormu({ supabase, cevrimici, baslatildi }: { supabase: Istemci; cevrimici: boolean | null; baslatildi: (k: Kayit) => void }) {
    const [sunucuHatasi, setSunucuHatasi] = useState<string>();
    const [bekliyor, startTransition] = useTransition();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SohbetBaslatGirdisi>({
        resolver: zodResolver(sohbetBaslatSemasi),
        defaultValues: { ad: "", telefon: "", eposta: "", mesaj: "" },
    });

    const gonder = handleSubmit((veri) => {
        setSunucuHatasi(undefined);
        startTransition(async () => {
            const { data, error } = await supabase.rpc("sohbet_baslat", {
                p_ad: veri.ad,
                p_telefon: veri.telefon,
                p_eposta: veri.eposta,
                p_mesaj: veri.mesaj,
                p_sayfa: window.location.pathname,
            });
            const yeni = (data as Kayit[] | null)?.[0];
            if (error || !yeni) {
                setSunucuHatasi(error ? hataMesaji(error) : "Sohbet başlatılamadı.");
                return;
            }
            baslatildi(yeni);
        });
    });

    return (
        <form onSubmit={gonder} noValidate className="flex-1 space-y-3 overflow-y-auto p-4">
            <p className="text-sm text-gray-600">
                {cevrimici === false
                    ? "Şu an çevrimiçi değiliz. Mesajınızı bırakın, en kısa sürede telefon ya da e-postayla size dönelim."
                    : "Merhaba! Sorunuzu yazın, ekibimiz hemen yanıtlasın."}
            </p>
            <Alan hata={errors.ad?.message}>
                <input type="text" autoComplete="name" placeholder="Adınız*" aria-label="Adınız" aria-invalid={!!errors.ad} className={inputSinifi} {...register("ad")} />
            </Alan>
            <Alan hata={errors.telefon?.message}>
                <input type="tel" autoComplete="tel" placeholder="Telefon" aria-label="Telefon" aria-invalid={!!errors.telefon} className={inputSinifi} {...register("telefon")} />
            </Alan>
            <Alan hata={errors.eposta?.message}>
                <input type="email" autoComplete="email" placeholder="E-posta" aria-label="E-posta" aria-invalid={!!errors.eposta} className={inputSinifi} {...register("eposta")} />
            </Alan>
            <Alan hata={errors.mesaj?.message}>
                <textarea rows={3} placeholder="Mesajınız*" aria-label="Mesajınız" aria-invalid={!!errors.mesaj} className={cn(inputSinifi, "resize-none")} {...register("mesaj")} />
            </Alan>

            {sunucuHatasi && (
                <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-[var(--color-primary)]">
                    {sunucuHatasi}
                </p>
            )}

            <button
                type="submit"
                disabled={bekliyor}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-secondary)] disabled:opacity-60"
            >
                {bekliyor ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Sohbeti Başlat
            </button>
            <p className="text-center text-xs text-gray-500">
                Bilgileriniz yalnızca size dönüş yapmak için kullanılır.{" "}
                <Link href="/kvkk" className="underline hover:text-[var(--color-primary)]">
                    KVKK Aydınlatma Metni
                </Link>
            </p>
        </form>
    );
}

type SohbetEkraniProps = {
    supabase: Istemci;
    kayit: Kayit;
    sohbet: ZiyaretciSohbeti;
    yenile: () => Promise<void>;
    yeniSohbet: () => void;
};

function SohbetEkrani({ supabase, kayit, sohbet, yenile, yeniSohbet }: SohbetEkraniProps) {
    const [metin, setMetin] = useState("");
    const [hata, setHata] = useState<string>();
    const [bekliyor, startTransition] = useTransition();
    const listeRef = useRef<HTMLOListElement>(null);
    const kapali = sohbet.durum === "kapali";

    useEffect(() => {
        listeRef.current?.scrollTo({ top: listeRef.current.scrollHeight });
    }, [sohbet.mesajlar.length]);

    const gonder = (e?: { preventDefault(): void }) => {
        e?.preventDefault();
        const sonuc = mesajMetni.safeParse(metin);
        if (!sonuc.success) return;
        setHata(undefined);
        startTransition(async () => {
            const { error } = await supabase.rpc("sohbet_mesaj_gonder", { p_anahtar: kayit.anahtar, p_metin: sonuc.data });
            if (error) return setHata(hataMesaji(error));
            setMetin("");
            await yenile();
        });
    };

    return (
        <>
            <ol ref={listeRef} className="flex-1 space-y-2 overflow-y-auto bg-gray-50 p-4" aria-live="polite">
                {sohbet.mesajlar.map((m) => {
                    if (m.gonderen === "sistem") return <SistemMesaji key={m.id} metin={m.metin} />;
                    const benim = m.gonderen === "ziyaretci";
                    return (
                        <li key={m.id} className={cn("flex flex-col", benim ? "items-end" : "items-start")}>
                            {!benim && <span className="mb-0.5 text-xs text-gray-500">{m.personel ?? "Kasırga Destek"}</span>}
                            <p
                                className={cn(
                                    "max-w-[85%] whitespace-pre-line break-words rounded-2xl px-3 py-2 text-sm",
                                    benim ? "rounded-br-sm bg-[var(--color-secondary)] text-white" : "rounded-bl-sm bg-white text-gray-800 shadow-sm"
                                )}
                            >
                                {m.metin}
                            </p>
                            <time dateTime={m.created_at} className="mt-0.5 text-[11px] text-gray-400">
                                {saatYaz(m.created_at)}
                            </time>
                        </li>
                    );
                })}
                {sohbet.mesajlar.every((m) => m.gonderen === "ziyaretci") && !kapali && (
                    <li className="pt-2 text-center text-xs text-gray-500">Mesajınız iletildi. Ekibimiz en kısa sürede yanıtlayacak.</li>
                )}
            </ol>

            {kapali ? (
                <div className="space-y-2 border-t p-4 text-center">
                    <p className="text-sm text-gray-600">Bu sohbet sonlandırıldı.</p>
                    <button
                        type="button"
                        onClick={yeniSohbet}
                        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] hover:underline"
                    >
                        <RotateCcw size={14} /> Yeni sohbet başlat
                    </button>
                </div>
            ) : (
                <form onSubmit={gonder} className="border-t p-3">
                    {hata && (
                        <p role="alert" className="mb-2 text-xs text-[var(--color-primary)]">
                            {hata}
                        </p>
                    )}
                    <div className="flex items-end gap-2">
                        <textarea
                            value={metin}
                            onChange={(e) => setMetin(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) gonder(e);
                            }}
                            rows={1}
                            maxLength={2000}
                            placeholder="Mesajınızı yazın..."
                            aria-label="Mesajınız"
                            className={cn(inputSinifi, "max-h-28 resize-none")}
                        />
                        <button
                            type="submit"
                            disabled={bekliyor || !metin.trim()}
                            aria-label="Gönder"
                            className="shrink-0 rounded-lg bg-[var(--color-primary)] p-2.5 text-white transition-colors hover:bg-[var(--color-secondary)] disabled:opacity-50"
                        >
                            {bekliyor ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        </button>
                    </div>
                </form>
            )}
        </>
    );
}

function Alan({ hata, children }: { hata?: string; children: React.ReactNode }) {
    return (
        <div>
            {children}
            {hata && <p className="mt-1 text-xs text-[var(--color-primary)]">{hata}</p>}
        </div>
    );
}

function SistemMesaji({ metin }: { metin: string }) {
    return (
        <li className="flex justify-center">
            <p className="max-w-[90%] rounded-lg bg-amber-50 px-3 py-1.5 text-center text-xs text-amber-800">{metin}</p>
        </li>
    );
}
