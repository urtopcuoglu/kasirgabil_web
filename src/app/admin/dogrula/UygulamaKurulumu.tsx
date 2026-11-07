// src/app/admin/dogrula/UygulamaKurulumu.tsx
// Doğrulama uygulaması (TOTP) kurulumu: QR kodu okutulur, uygulamadaki kod girilir; başarılı olunca panele geçilir.
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, ShieldPlus } from "lucide-react";
import { kurulumuBaslat, kurulumuTamamla, type KurulumBilgisi } from "@/actions/iki-adimli";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { anaButonSinifi, FormHatasi, inputSinifi } from "../_components/form";

export default function UygulamaKurulumu() {
    const router = useRouter();
    const [kurulum, setKurulum] = useState<KurulumBilgisi>();
    const [kod, setKod] = useState("");
    const [hata, setHata] = useState<string>();
    const [bekliyor, startTransition] = useTransition();

    const baslat = () => {
        setHata(undefined);
        startTransition(async () => {
            const sonuc = await kurulumuBaslat();
            if ("hata" in sonuc) setHata(sonuc.hata);
            else setKurulum(sonuc);
        });
    };

    const tamamla = (e: React.FormEvent) => {
        e.preventDefault();
        if (!kurulum) return;
        setHata(undefined);
        startTransition(async () => {
            const sonuc = await kurulumuTamamla(kurulum.factorId, kod);
            if (sonuc?.hata) return setHata(sonuc.hata);
            router.replace("/admin");
        });
    };

    return (
        <div className="space-y-4">
            {kurulum ? (
                <form onSubmit={tamamla} className="space-y-4">
                    <ol className="list-decimal space-y-1 pl-5 text-sm text-gray-600">
                        <li>Telefonunuza Google Authenticator veya Microsoft Authenticator uygulamasını kurun.</li>
                        <li>Uygulamada &quot;QR kodu tara&quot; seçeneğiyle aşağıdaki kodu okutun.</li>
                        <li>Uygulamanın gösterdiği 6 haneli kodu girip onaylayın.</li>
                    </ol>
                    <div className="flex flex-col items-center gap-2 rounded-lg border bg-gray-50 p-4">
                        {/* Supabase'in ürettiği SVG veri adresi; next/image gerekmez. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={kurulum.qrKodu} alt="Doğrulama uygulaması için QR kodu" width={180} height={180} className="bg-white" />
                        <p className="text-xs text-gray-500">QR okutamıyorsanız bu anahtarı elle girin:</p>
                        <code className="break-all rounded bg-white px-2 py-1 text-center font-mono text-sm">{kurulum.anahtar}</code>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="mfa_kod">Uygulamadaki kod</Label>
                        <input
                            id="mfa_kod"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={7}
                            required
                            autoFocus
                            value={kod}
                            onChange={(e) => setKod(e.target.value)}
                            placeholder="123456"
                            className={`${inputSinifi} text-center font-mono text-lg tracking-[0.4em]`}
                        />
                    </div>
                    <Button type="submit" disabled={bekliyor} className={`w-full ${anaButonSinifi}`}>
                        {bekliyor ? <Loader2 className="animate-spin" /> : <ShieldCheck />} Onayla ve devam et
                    </Button>
                </form>
            ) : (
                <>
                    <p className="text-center text-sm text-gray-600">
                        Panel güvenliği için girişte şifrenin yanında telefonunuzdaki doğrulama uygulamasının ürettiği kod da istenir. Devam
                        etmek için uygulamayı bir kez bağlayın.
                    </p>
                    <Button type="button" disabled={bekliyor} onClick={baslat} className={`w-full ${anaButonSinifi}`}>
                        {bekliyor ? <Loader2 className="animate-spin" /> : <ShieldPlus />} Kurulumu başlat
                    </Button>
                </>
            )}

            <FormHatasi mesaj={hata} />
        </div>
    );
}
