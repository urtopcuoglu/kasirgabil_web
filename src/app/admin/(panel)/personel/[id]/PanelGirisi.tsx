// src/app/admin/(panel)/personel/[id]/PanelGirisi.tsx
// Personelin panel girişi: aç (e-posta + geçici şifre), şifre sıfırla, kapat.
"use client";

import { useState, useTransition } from "react";
import { Check, Copy, KeyRound, Loader2, LogIn, RefreshCw, UserX } from "lucide-react";
import { panelGirisiAc, panelGirisiKapat, panelSifresiSifirla } from "@/actions/kullanici";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { anaButonSinifi, FormHatasi, inputSinifi } from "../../../_components/form";

type Props = {
    personelId: string;
    aktif: boolean;
    girisEmail: string | null; // girişi varsa e-postası
    girisVar: boolean;
    kendisi: boolean; // oturumdaki kullanıcının kendi kaydı
    anahtarVar: boolean; // SUPABASE_SECRET_KEY tanımlı mı
    anahtarMesaji: string;
};

// Okunması kolay geçici şifre: karışan karakterler (0/O, 1/l/I) yok, en az bir harf ve rakam.
function geciciSifreUret() {
    const harfler = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
    const rakamlar = "23456789";
    const tum = harfler + rakamlar;
    const rastgele = crypto.getRandomValues(new Uint32Array(10));
    const karakterler = Array.from(rastgele, (n, i) => (i === 0 ? harfler : i === 1 ? rakamlar : tum)[n % (i === 0 ? harfler.length : i === 1 ? rakamlar.length : tum.length)]);
    return karakterler.sort(() => (crypto.getRandomValues(new Uint8Array(1))[0] > 127 ? 1 : -1)).join("");
}

export default function PanelGirisi({ personelId, aktif, girisEmail, girisVar, kendisi, anahtarVar, anahtarMesaji }: Props) {
    const [email, setEmail] = useState("");
    // Boş başlar (sunucu/tarayıcı aynı render etsin); gönderimde boşsa üretilir.
    const [sifre, setSifre] = useState("");
    const [verilenSifre, setVerilenSifre] = useState<string>();
    const [hata, setHata] = useState<string>();
    const [kopyalandi, setKopyalandi] = useState(false);
    const [bekliyor, startTransition] = useTransition();

    const calistir = (islem: () => Promise<{ hata: string } | undefined>, sonrakiSifre?: string) => {
        setHata(undefined);
        setVerilenSifre(undefined);
        startTransition(async () => {
            const sonuc = await islem();
            if (sonuc?.hata) setHata(sonuc.hata);
            else if (sonrakiSifre) {
                setVerilenSifre(sonrakiSifre);
                setSifre("");
            }
        });
    };

    async function kopyala(metin: string) {
        await navigator.clipboard.writeText(metin);
        setKopyalandi(true);
        setTimeout(() => setKopyalandi(false), 1500);
    }

    if (!anahtarVar) return <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">{anahtarMesaji}</p>;

    return (
        <div className="space-y-4">
            {verilenSifre && (
                <div role="status" className="space-y-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                    <p>Geçici şifre oluşturuldu. Personele iletin; ilk girişte kendi şifresini belirleyecek. Bu şifre bir daha gösterilmez.</p>
                    <div className="flex items-center gap-2">
                        <code className="rounded bg-white px-2 py-1 font-mono text-base text-gray-900">{verilenSifre}</code>
                        <Button type="button" variant="outline" size="sm" onClick={() => kopyala(verilenSifre)}>
                            {kopyalandi ? <Check /> : <Copy />} {kopyalandi ? "Kopyalandı" : "Kopyala"}
                        </Button>
                    </div>
                </div>
            )}

            {girisVar ? (
                <>
                    <p className="text-sm">
                        Giriş e-postası: <span className="font-medium">{girisEmail ?? "—"}</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={bekliyor}
                            onClick={() => {
                                const yeni = geciciSifreUret();
                                calistir(() => panelSifresiSifirla(personelId, yeni), yeni);
                            }}
                        >
                            {bekliyor ? <Loader2 className="animate-spin" /> : <KeyRound />} Şifreyi sıfırla
                        </Button>
                        {!kendisi && (
                            <Button
                                type="button"
                                variant="outline"
                                disabled={bekliyor}
                                onClick={() => {
                                    if (window.confirm("Bu personelin panel girişi kapatılsın mı? Personel kaydı silinmez.")) {
                                        calistir(() => panelGirisiKapat(personelId));
                                    }
                                }}
                                className="text-[var(--color-primary)]"
                            >
                                <UserX /> Girişi kapat
                            </Button>
                        )}
                    </div>
                </>
            ) : aktif ? (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const gecici = sifre.trim() || geciciSifreUret();
                        calistir(() => panelGirisiAc(personelId, email, gecici), gecici);
                    }}
                    className="space-y-3"
                >
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="giris_email">E-posta</Label>
                            <input
                                id="giris_email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="off"
                                className={inputSinifi}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="giris_sifre">Geçici şifre</Label>
                            <div className="flex gap-2">
                                <input
                                    id="giris_sifre"
                                    placeholder="Boş bırakılırsa üretilir"
                                    value={sifre}
                                    onChange={(e) => setSifre(e.target.value)}
                                    autoComplete="off"
                                    className={`${inputSinifi} font-mono`}
                                />
                                <Button type="button" variant="outline" size="icon" title="Yeni şifre üret" onClick={() => setSifre(geciciSifreUret())}>
                                    <RefreshCw />
                                </Button>
                            </div>
                        </div>
                    </div>
                    <Button type="submit" disabled={bekliyor} className={anaButonSinifi}>
                        {bekliyor ? <Loader2 className="animate-spin" /> : <LogIn />} Panel girişi aç
                    </Button>
                </form>
            ) : (
                <p className="text-sm text-gray-500">Pasif personele panel girişi açılamaz.</p>
            )}

            <FormHatasi mesaj={hata} />
        </div>
    );
}
