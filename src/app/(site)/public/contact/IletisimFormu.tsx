// src/app/(site)/public/contact/IletisimFormu.tsx
// İletişim formu: mesaj panelde Mesajlar sayfasına düşer.
"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { iletisimMesajiGonder } from "@/actions/iletisim";
import { iletisimSemasi, type IletisimGirdisi } from "@/lib/schemas/iletisim";

const inputSinifi =
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] aria-invalid:border-[var(--color-primary)]";

export default function IletisimFormu() {
    const [gonderildi, setGonderildi] = useState(false);
    const [sunucuHatasi, setSunucuHatasi] = useState<string>();
    const [bekliyor, startTransition] = useTransition();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<IletisimGirdisi>({
        resolver: zodResolver(iletisimSemasi),
        defaultValues: { ad: "", soyad: "", telefon: "", eposta: "", mesaj: "", web_sitesi: "" },
    });

    const gonder = handleSubmit((veri) => {
        setSunucuHatasi(undefined);
        startTransition(async () => {
            const sonuc = await iletisimMesajiGonder(veri);
            if (sonuc?.hata) {
                setSunucuHatasi(sonuc.hata);
                return;
            }
            reset();
            setGonderildi(true);
        });
    });

    if (gonderildi) {
        return (
            <div role="status" className="flex flex-col items-center gap-3 rounded-lg bg-green-50 px-6 py-10 text-center">
                <CheckCircle2 size={48} className="text-green-600" />
                <p className="text-lg font-semibold text-[var(--color-secondary)]">Mesajınız bize ulaştı</p>
                <p className="text-sm text-gray-600">En kısa sürede size dönüş yapacağız. Teşekkür ederiz.</p>
                <button
                    type="button"
                    onClick={() => setGonderildi(false)}
                    className="mt-2 text-sm font-medium text-[var(--color-primary)] hover:underline"
                >
                    Yeni mesaj gönder
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={gonder} noValidate className="space-y-4">
            <Alan id="ad" etiket="Adınız" hata={errors.ad?.message}>
                <input id="ad" type="text" autoComplete="given-name" placeholder="Adınız*" aria-invalid={!!errors.ad} className={inputSinifi} {...register("ad")} />
            </Alan>
            <Alan id="soyad" etiket="Soyadınız" hata={errors.soyad?.message}>
                <input id="soyad" type="text" autoComplete="family-name" placeholder="Soyadınız" className={inputSinifi} {...register("soyad")} />
            </Alan>
            <Alan id="telefon" etiket="Telefon Numaranız" hata={errors.telefon?.message}>
                <input
                    id="telefon"
                    type="tel"
                    autoComplete="tel"
                    placeholder="Telefon Numaranız"
                    aria-invalid={!!errors.telefon}
                    className={inputSinifi}
                    {...register("telefon")}
                />
            </Alan>
            <Alan id="eposta" etiket="E-mail Adresiniz" hata={errors.eposta?.message}>
                <input
                    id="eposta"
                    type="email"
                    autoComplete="email"
                    placeholder="E-mail Adresiniz*"
                    aria-invalid={!!errors.eposta}
                    className={inputSinifi}
                    {...register("eposta")}
                />
            </Alan>
            <Alan id="mesaj" etiket="Mesajınız" hata={errors.mesaj?.message}>
                <textarea
                    id="mesaj"
                    placeholder="Mesajınız*"
                    rows={5}
                    aria-invalid={!!errors.mesaj}
                    className={`${inputSinifi} resize-none`}
                    {...register("mesaj")}
                />
            </Alan>

            {/* Bot tuzağı: ekranda ve klavye gezintisinde görünmez. */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label htmlFor="web_sitesi">Web siteniz</label>
                <input id="web_sitesi" type="text" tabIndex={-1} autoComplete="off" {...register("web_sitesi")} />
            </div>

            {sunucuHatasi && (
                <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-[var(--color-primary)]">
                    {sunucuHatasi}
                </p>
            )}

            <button
                type="submit"
                disabled={bekliyor}
                className="inline-flex w-auto items-center gap-2 px-8 py-3 bg-[var(--color-primary)] text-white font-semibold rounded-lg hover:bg-[var(--color-secondary)] transition-colors disabled:opacity-60"
            >
                {bekliyor && <Loader2 size={18} className="animate-spin" />}
                {bekliyor ? "Gönderiliyor..." : "Gönder"}
            </button>
        </form>
    );
}

function Alan({ id, etiket, hata, children }: { id: string; etiket: string; hata?: string; children: React.ReactNode }) {
    return (
        <div>
            <label htmlFor={id} className="sr-only">
                {etiket}
            </label>
            {children}
            {hata && <p className="mt-1 text-sm text-[var(--color-primary)]">{hata}</p>}
        </div>
    );
}
