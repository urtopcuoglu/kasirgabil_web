// src/app/admin/_components/sohbetBildirimi.ts
// Panel açıkken canlı sohbet bildirimleri (AdminKabuk'ta, sohbet izni olan rollerde çalışır):
// - Her dakika "çevrimiçiyim" bildirir; vitrindeki pencere buna göre çevrimiçi/çevrimdışı görünür.
// - Özel 'sohbet-panel' Realtime kanalını dinler: okunmamış sohbet sayısını günceller, ziyaretçi mesajında ses çalar
//   ve Sohbetler sayfasının yenilenmesi için SOHBET_SINYALI olayını yayar.
"use client";

import { useEffect, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export const SOHBET_SINYALI = "sohbet-sinyali";
const CEVRIMICI_ARALIGI_MS = 60_000;

export function useSohbetBildirimi(etkin: boolean, sunucuSayisi: number) {
    const [sayi, setSayi] = useState(sunucuSayisi);

    // Sayfa yenilenince (revalidatePath) sunucudan gelen sayı esas alınır.
    useEffect(() => setSayi(sunucuSayisi), [sunucuSayisi]);

    useEffect(() => {
        if (!etkin) return;
        const supabase = createClient();
        let iptal = false;
        let kanal: RealtimeChannel | undefined;

        const say = async () => {
            const { count } = await supabase
                .from("sohbetler")
                .select("id", { count: "exact", head: true })
                .eq("okunmamis", true)
                .eq("durum", "acik");
            if (!iptal && count !== null) setSayi(count);
        };

        const sinyal = (payload: Record<string, unknown>) => {
            say();
            window.dispatchEvent(new CustomEvent(SOHBET_SINYALI, { detail: payload }));
        };

        const bildir = () => supabase.rpc("sohbet_cevrimici_bildir").then(({ error }) => error && console.error("[sohbet_cevrimici_bildir]", error.message));
        bildir();
        const zamanlayici = setInterval(bildir, CEVRIMICI_ARALIGI_MS);

        (async () => {
            await supabase.realtime.setAuth(); // özel kanal: RLS oturumdaki kullanıcıya göre çalışır
            if (iptal) return;
            kanal = supabase
                .channel("sohbet-panel", { config: { private: true } })
                .on("broadcast", { event: "mesaj" }, ({ payload }) => {
                    if (payload?.gonderen === "ziyaretci") sesCal();
                    sinyal(payload);
                })
                .on("broadcast", { event: "durum" }, ({ payload }) => sinyal(payload))
                .subscribe();
        })();

        return () => {
            iptal = true;
            clearInterval(zamanlayici);
            if (kanal) supabase.removeChannel(kanal);
        };
    }, [etkin]);

    return sayi;
}

// Kısa iki tonlu uyarı sesi (dosya gerektirmez). Tarayıcı, sayfayla etkileşim olmadan sesi engelleyebilir.
function sesCal() {
    try {
        const ctx = new AudioContext();
        [880, 1175].forEach((frekans, i) => {
            const osc = ctx.createOscillator();
            const kazanc = ctx.createGain();
            const baslangic = ctx.currentTime + i * 0.15;
            osc.frequency.value = frekans;
            kazanc.gain.setValueAtTime(0.15, baslangic);
            kazanc.gain.exponentialRampToValueAtTime(0.001, baslangic + 0.14);
            osc.connect(kazanc).connect(ctx.destination);
            osc.start(baslangic);
            osc.stop(baslangic + 0.15);
        });
        setTimeout(() => ctx.close(), 500);
    } catch {
        // Ses desteklenmiyor.
    }
}
