// src/app/admin/(panel)/kasa/GunSonuPaneli.tsx
"use client";

import { useState, useTransition } from "react";
import { Loader2, Lock, LockOpen, Save } from "lucide-react";
import { kasaAcilisNakitKaydet, kasaGunAc, kasaGunKapat } from "@/actions/kasa";
import type { KasaGunu } from "@/lib/schemas/kasa";
import { sayiOku } from "@/lib/schemas/ortak";
import { paraYaz, tarihSaatYaz } from "@/lib/tarih";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { anaButonSinifi, FormHatasi, inputSinifi } from "../../_components/form";

type Props = {
    tarih: string;
    gun: KasaGunu | null;
    beklenenNakit: number;
    gelecekGun: boolean;
    yenidenAcabilir: boolean; // yalnızca yönetici
};

export default function GunSonuPaneli({ tarih, gun, beklenenNakit, gelecekGun, yenidenAcabilir }: Props) {
    const [sayilan, setSayilan] = useState("");
    const [not, setNot] = useState("");
    const [hata, setHata] = useState<string>();
    const [bekliyor, startTransition] = useTransition();

    const calistir = (islem: () => Promise<{ hata: string } | undefined>) => {
        setHata(undefined);
        startTransition(async () => {
            const sonuc = await islem();
            if (sonuc?.hata) setHata(sonuc.hata);
            else {
                setSayilan("");
                setNot("");
            }
        });
    };

    if (gun?.kapandi) {
        const fark = Number(gun.sayilan_nakit ?? 0) - Number(gun.beklenen_nakit ?? 0);
        return (
            <div className="space-y-3">
                <p className="flex items-center gap-2 text-sm font-medium text-green-700">
                    <Lock className="size-4" /> Gün kapatıldı
                    {gun.kapanis_zamani && <span className="font-normal text-gray-500">· {tarihSaatYaz(gun.kapanis_zamani)}</span>}
                </p>
                <dl className="space-y-1 text-sm">
                    <Satir etiket="Beklenen nakit" deger={paraYaz(Number(gun.beklenen_nakit ?? 0))} />
                    <Satir etiket="Sayılan nakit" deger={paraYaz(Number(gun.sayilan_nakit ?? 0))} />
                    <Satir etiket="Fark" deger={<FarkYazisi fark={fark} />} />
                </dl>
                {gun.kapanis_notu && <p className="rounded-md bg-gray-50 p-2 text-xs text-gray-600">{gun.kapanis_notu}</p>}
                <FormHatasi mesaj={hata} />
                {yenidenAcabilir && <Button variant="outline" size="sm" disabled={bekliyor} onClick={() => calistir(() => kasaGunAc(tarih))}>
                    {bekliyor ? <Loader2 className="animate-spin" /> : <LockOpen />} Günü yeniden aç
                </Button>}
            </div>
        );
    }

    if (gelecekGun) return <p className="text-sm text-gray-500">Gelecek bir gün kapatılamaz.</p>;

    const sayilanSayi = sayiOku(sayilan);
    const fark = sayilanSayi != null && !Number.isNaN(sayilanSayi) ? sayilanSayi - beklenenNakit : null;

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                calistir(() => kasaGunKapat(tarih, sayilan, not));
            }}
            className="space-y-3"
        >
            <div className="space-y-1.5">
                <Label htmlFor="sayilan_nakit">Kasada sayılan nakit (₺)</Label>
                <input
                    id="sayilan_nakit"
                    inputMode="decimal"
                    value={sayilan}
                    onChange={(e) => setSayilan(e.target.value)}
                    placeholder={paraYaz(beklenenNakit)}
                    className={cn(inputSinifi, "text-lg font-semibold")}
                />
                {fark != null && (
                    <p className="text-sm">
                        Fark: <FarkYazisi fark={fark} />
                    </p>
                )}
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="kapanis_notu">Not (opsiyonel)</Label>
                <input
                    id="kapanis_notu"
                    value={not}
                    onChange={(e) => setNot(e.target.value)}
                    maxLength={300}
                    placeholder="Örn. 50 TL eksik, bozuk para sayılmadı"
                    className={inputSinifi}
                />
            </div>
            <FormHatasi mesaj={hata} />
            <Button type="submit" disabled={bekliyor || sayilan.trim() === ""} className={`w-full ${anaButonSinifi}`}>
                {bekliyor ? <Loader2 className="animate-spin" /> : <Lock />} Günü Kapat
            </Button>
            <p className="text-xs text-gray-500">Kapatılan güne hareket eklenemez ve değiştirilemez. Sayılan nakit ertesi güne devreder.</p>
        </form>
    );
}

// Kasanın ilk kullanımında (öncesinde kapanmış gün yokken) açılış nakdi girişi.
export function AcilisNakitFormu({ tarih, mevcut }: { tarih: string; mevcut: number }) {
    const [tutar, setTutar] = useState(mevcut ? String(mevcut).replace(".", ",") : "");
    const [hata, setHata] = useState<string>();
    const [bekliyor, startTransition] = useTransition();

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                setHata(undefined);
                startTransition(async () => {
                    const sonuc = await kasaAcilisNakitKaydet(tarih, tutar);
                    if (sonuc?.hata) setHata(sonuc.hata);
                });
            }}
            className="space-y-1.5"
        >
            <Label htmlFor="acilis_nakit">Açılış nakdi (₺)</Label>
            <div className="flex gap-2">
                <input
                    id="acilis_nakit"
                    inputMode="decimal"
                    value={tutar}
                    onChange={(e) => setTutar(e.target.value)}
                    className={cn(inputSinifi, "py-1.5")}
                />
                <Button type="submit" variant="outline" size="icon" disabled={bekliyor} title="Kaydet">
                    {bekliyor ? <Loader2 className="animate-spin" /> : <Save />}
                </Button>
            </div>
            <p className="text-xs text-gray-500">Kasayı ilk kez kullanıyorsanız kasadaki mevcut nakdi girin. Sonraki günlere sayımla devreder.</p>
            <FormHatasi mesaj={hata} />
        </form>
    );
}

export function FarkYazisi({ fark }: { fark: number }) {
    const sifir = Math.abs(fark) < 0.005;
    return (
        <span className={cn("font-semibold tabular-nums", sifir ? "text-green-700" : "text-[var(--color-primary)]")}>
            {sifir ? "Yok (tuttu)" : `${fark > 0 ? "+" : ""}${paraYaz(fark)} ${fark > 0 ? "fazla" : "eksik"}`}
        </span>
    );
}

function Satir({ etiket, deger }: { etiket: string; deger: React.ReactNode }) {
    return (
        <div className="flex justify-between gap-2">
            <dt className="text-gray-500">{etiket}</dt>
            <dd className="tabular-nums">{deger}</dd>
        </div>
    );
}
