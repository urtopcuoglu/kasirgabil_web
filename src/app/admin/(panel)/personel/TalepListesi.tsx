// src/app/admin/(panel)/personel/TalepListesi.tsx
// Panel kayıt talepleri: onayla (rol + şifre belirlenir, personel ve panel girişi oluşturulur) / reddet.
"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Loader2, RefreshCw, Trash2, UserCheck, UserX, X } from "lucide-react";
import { talebiOnayla, talebiReddet, talebiSil } from "@/actions/talepler";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ROLLER, type Rol } from "@/lib/schemas/personel";
import { TALEP_DURUMLARI, type PersonelTalebi } from "@/lib/schemas/talep";
import { geciciSifreUret } from "@/lib/sifre";
import { tarihSaatYaz } from "@/lib/tarih";
import { cn } from "@/lib/utils";
import { anaButonSinifi, FormHatasi, inputSinifi } from "../../_components/form";

type Props = { bekleyenler: PersonelTalebi[]; sonKararlar: PersonelTalebi[] };

type Olusturulan = { ad: string; email: string; sifre: string };

export default function TalepListesi({ bekleyenler, sonKararlar }: Props) {
    const [acikTalep, setAcikTalep] = useState<string>();
    const [rol, setRol] = useState<Rol>("teknisyen");
    const [sifre, setSifre] = useState("");
    const [olusturulan, setOlusturulan] = useState<Olusturulan>();
    const [hata, setHata] = useState<string>();
    const [kopyalandi, setKopyalandi] = useState(false);
    const [bekliyor, startTransition] = useTransition();

    function onayFormunuAc(id: string) {
        setAcikTalep(id);
        setRol("teknisyen");
        setSifre(geciciSifreUret());
        setHata(undefined);
        setOlusturulan(undefined);
    }

    function onayla(t: PersonelTalebi) {
        setHata(undefined);
        startTransition(async () => {
            const sonuc = await talebiOnayla(t.id, rol, sifre);
            if (sonuc?.hata) return setHata(sonuc.hata);
            setOlusturulan({ ad: t.ad_soyad, email: t.eposta, sifre });
            setAcikTalep(undefined);
            setSifre("");
        });
    }

    function reddet(t: PersonelTalebi) {
        if (!window.confirm(`"${t.ad_soyad}" adlı kişinin talebi reddedilsin mi?`)) return;
        setHata(undefined);
        setOlusturulan(undefined);
        startTransition(async () => {
            const sonuc = await talebiReddet(t.id);
            if (sonuc?.hata) setHata(sonuc.hata);
        });
    }

    function sil(t: PersonelTalebi) {
        setHata(undefined);
        startTransition(async () => {
            const sonuc = await talebiSil(t.id);
            if (sonuc?.hata) setHata(sonuc.hata);
        });
    }

    async function kopyala(metin: string) {
        await navigator.clipboard.writeText(metin);
        setKopyalandi(true);
        setTimeout(() => setKopyalandi(false), 1500);
    }

    return (
        <div className="space-y-4">
            {olusturulan && (
                <div role="status" className="space-y-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                    <p>
                        <span className="font-medium">{olusturulan.ad}</span> için panel girişi oluşturuldu. Giriş bilgilerini personele iletin; ilk
                        girişte doğrulama uygulamasını kuracak ve kendi şifresini belirleyecek. Bu şifre bir daha gösterilmez.
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                        <span>E-posta:</span>
                        <code className="rounded bg-white px-2 py-1 font-mono text-gray-900">{olusturulan.email}</code>
                        <span>Şifre:</span>
                        <code className="rounded bg-white px-2 py-1 font-mono text-base text-gray-900">{olusturulan.sifre}</code>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => kopyala(`Panel: https://admin.kasirgabilgisayar.com\nE-posta: ${olusturulan.email}\nŞifre: ${olusturulan.sifre}`)}
                        >
                            {kopyalandi ? <Check /> : <Copy />} {kopyalandi ? "Kopyalandı" : "Bilgileri kopyala"}
                        </Button>
                    </div>
                </div>
            )}

            <FormHatasi mesaj={hata} />

            {bekleyenler.length === 0 ? (
                <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-gray-500">Bekleyen kayıt talebi yok.</p>
            ) : (
                <ul className="divide-y rounded-lg border">
                    {bekleyenler.map((t) => (
                        <li key={t.id} className="space-y-3 p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="text-sm">
                                    <p className="font-medium">{t.ad_soyad}</p>
                                    <p className="text-gray-600">
                                        <a href={`tel:${t.telefon}`} className="hover:underline">
                                            {t.telefon}
                                        </a>{" "}
                                        ·{" "}
                                        <a href={`mailto:${t.eposta}`} className="hover:underline">
                                            {t.eposta}
                                        </a>
                                    </p>
                                    <p className="text-xs text-gray-400">{tarihSaatYaz(t.created_at)}</p>
                                </div>
                                {acikTalep !== t.id && (
                                    <div className="flex gap-2">
                                        <Button type="button" size="sm" disabled={bekliyor} onClick={() => onayFormunuAc(t.id)} className={anaButonSinifi}>
                                            <UserCheck /> Onayla
                                        </Button>
                                        <Button type="button" size="sm" variant="outline" disabled={bekliyor} onClick={() => reddet(t)}>
                                            <UserX /> Reddet
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {acikTalep === t.id && (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        onayla(t);
                                    }}
                                    className="space-y-3 rounded-lg bg-gray-50 p-3"
                                >
                                    <p className="text-sm font-medium">Panel girişi oluştur</p>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label htmlFor={`rol_${t.id}`}>Rol</Label>
                                            <select
                                                id={`rol_${t.id}`}
                                                value={rol}
                                                onChange={(e) => setRol(e.target.value as Rol)}
                                                className={inputSinifi}
                                            >
                                                {Object.entries(ROLLER).map(([deger, etiket]) => (
                                                    <option key={deger} value={deger}>
                                                        {etiket}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor={`sifre_${t.id}`}>Şifre</Label>
                                            <div className="flex gap-2">
                                                <input
                                                    id={`sifre_${t.id}`}
                                                    value={sifre}
                                                    onChange={(e) => setSifre(e.target.value)}
                                                    required
                                                    minLength={8}
                                                    autoComplete="off"
                                                    className={`${inputSinifi} font-mono`}
                                                />
                                                <Button type="button" variant="outline" size="icon" title="Yeni şifre üret" onClick={() => setSifre(geciciSifreUret())}>
                                                    <RefreshCw />
                                                </Button>
                                            </div>
                                            <p className="text-xs text-gray-500">En az 8 karakter; en az bir harf ve bir rakam.</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Button type="submit" size="sm" disabled={bekliyor} className={anaButonSinifi}>
                                            {bekliyor ? <Loader2 className="animate-spin" /> : <UserCheck />} Onayla ve hesabı oluştur
                                        </Button>
                                        <Button type="button" size="sm" variant="outline" disabled={bekliyor} onClick={() => setAcikTalep(undefined)}>
                                            <X /> Vazgeç
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {sonKararlar.length > 0 && (
                <details className="text-sm">
                    <summary className="cursor-pointer text-gray-500">Son kararlar ({sonKararlar.length})</summary>
                    <ul className="mt-2 divide-y rounded-lg border">
                        {sonKararlar.map((t) => (
                            <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2">
                                <span>
                                    {t.ad_soyad} <span className="text-gray-500">· {t.eposta}</span>
                                </span>
                                <span className="flex items-center gap-2">
                                    <span
                                        className={cn(
                                            "rounded-full px-2 py-0.5 text-xs font-medium",
                                            t.durum === "onaylandi" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                                        )}
                                    >
                                        {TALEP_DURUMLARI[t.durum]}
                                    </span>
                                    {t.karar_tarihi && <span className="text-xs text-gray-400">{tarihSaatYaz(t.karar_tarihi)}</span>}
                                    <Button type="button" variant="ghost" size="icon" title="Listeden kaldır" disabled={bekliyor} onClick={() => sil(t)}>
                                        <Trash2 />
                                    </Button>
                                </span>
                            </li>
                        ))}
                    </ul>
                </details>
            )}
        </div>
    );
}
