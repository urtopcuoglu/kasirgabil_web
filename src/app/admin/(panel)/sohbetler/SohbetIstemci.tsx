// src/app/admin/(panel)/sohbetler/SohbetIstemci.tsx
// Sohbetler sayfasının istemci parçaları.
"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, RotateCcw, Send } from "lucide-react";
import { sohbetDurumDegistir, sohbetOkundu, sohbetYanitla } from "@/actions/sohbet";
import { MESAJ_UZUNLUGU, type SohbetDurumu } from "@/lib/schemas/sohbet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { inputSinifi } from "../../_components/form";
import { SOHBET_SINYALI } from "../../_components/sohbetBildirimi";

// AdminKabuk'taki dinleyiciden sinyal gelince sayfayı (liste + seçili sohbet) yeniler.
export function SohbetYenileyici() {
    const router = useRouter();

    useEffect(() => {
        const yenile = () => router.refresh();
        window.addEventListener(SOHBET_SINYALI, yenile);
        return () => window.removeEventListener(SOHBET_SINYALI, yenile);
    }, [router]);

    return null;
}

// Mesajları en alta kaydırır; açık sohbette okunmamış mesaj varsa okundu işaretler.
export function MesajListesi({
    sohbetId,
    okunmamis,
    mesajSayisi,
    children,
}: {
    sohbetId: string;
    okunmamis: boolean;
    mesajSayisi: number;
    children: React.ReactNode;
}) {
    const ref = useRef<HTMLOListElement>(null);

    useEffect(() => {
        ref.current?.scrollTo({ top: ref.current.scrollHeight });
    }, [sohbetId, mesajSayisi]);

    useEffect(() => {
        if (okunmamis && document.visibilityState === "visible") sohbetOkundu(sohbetId);
    }, [sohbetId, okunmamis, mesajSayisi]);

    return (
        <ol ref={ref} className="min-h-0 flex-1 space-y-2 overflow-y-auto bg-gray-50 p-4" aria-live="polite">
            {children}
        </ol>
    );
}

export function YanitFormu({ sohbetId }: { sohbetId: string }) {
    const [metin, setMetin] = useState("");
    const [hata, setHata] = useState<string>();
    const [bekliyor, startTransition] = useTransition();
    const alanRef = useRef<HTMLTextAreaElement>(null);

    // Sohbet değişince taslağı temizle ve alana odaklan.
    useEffect(() => {
        setMetin("");
        setHata(undefined);
        alanRef.current?.focus();
    }, [sohbetId]);

    const gonder = (e?: { preventDefault(): void }) => {
        e?.preventDefault();
        if (!metin.trim() || bekliyor) return;
        setHata(undefined);
        startTransition(async () => {
            const sonuc = await sohbetYanitla(sohbetId, metin);
            if (sonuc?.hata) return setHata(sonuc.hata);
            setMetin("");
            alanRef.current?.focus();
        });
    };

    return (
        <form onSubmit={gonder} className="border-t p-3">
            {hata && (
                <p role="alert" className="mb-2 text-xs text-[var(--color-primary)]">
                    {hata}
                </p>
            )}
            <div className="flex items-end gap-2">
                <textarea
                    ref={alanRef}
                    value={metin}
                    onChange={(e) => setMetin(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) gonder(e);
                    }}
                    rows={2}
                    maxLength={MESAJ_UZUNLUGU}
                    placeholder="Yanıtınızı yazın... (Enter: gönder, Shift+Enter: yeni satır)"
                    aria-label="Yanıt"
                    className={cn(inputSinifi, "max-h-40 resize-none")}
                />
                <Button
                    type="submit"
                    disabled={bekliyor || !metin.trim()}
                    className="h-auto shrink-0 self-stretch bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90"
                >
                    {bekliyor ? <Loader2 className="animate-spin" /> : <Send />}
                    Gönder
                </Button>
            </div>
        </form>
    );
}

export function DurumButonu({ id, durum }: { id: string; durum: SohbetDurumu }) {
    const [bekliyor, startTransition] = useTransition();
    const kapat = durum === "acik";

    const tikla = () =>
        startTransition(async () => {
            const sonuc = await sohbetDurumDegistir(id, kapat ? "kapali" : "acik");
            if (sonuc?.hata) window.alert(sonuc.hata);
        });

    return (
        <Button type="button" variant="ghost" size="sm" onClick={tikla} disabled={bekliyor} className="text-gray-600">
            {bekliyor ? <Loader2 className="animate-spin" /> : kapat ? <CheckCircle2 /> : <RotateCcw />}
            {kapat ? "Sohbeti kapat" : "Yeniden aç"}
        </Button>
    );
}
