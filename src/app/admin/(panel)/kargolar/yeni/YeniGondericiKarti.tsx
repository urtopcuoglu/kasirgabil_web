// src/app/admin/(panel)/kargolar/yeni/YeniGondericiKarti.tsx
"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, Loader2, Save } from "lucide-react";
import { gondericiEkle } from "@/actions/kargo";
import { gondericiSemasi, type GondericiGirdisi, type KargoGonderici } from "@/lib/schemas/kargo";
import { Button } from "@/components/ui/button";
import { Alan, anaButonSinifi, FormHatasi, inputSinifi } from "../../../_components/form";

type Props = {
    eklendi: (gonderici: KargoGonderici) => void;
    vazgec: () => void;
};

export default function YeniGondericiKarti({ eklendi, vazgec }: Props) {
    const [sunucuHatasi, setSunucuHatasi] = useState<string>();
    const [bekliyor, startTransition] = useTransition();

    const {
        register,
        handleSubmit,
        getValues,
        setValue,
        formState: { errors },
    } = useForm<GondericiGirdisi>({
        resolver: zodResolver(gondericiSemasi),
        defaultValues: { firma_adi: "", gonderici_adi: "", telefon: "", adres: "", vkn: "" },
    });

    const firmaAdiniKopyala = () =>
        setValue("gonderici_adi", getValues("firma_adi"), { shouldValidate: true, shouldDirty: true });

    // Ana kargo formunun içinde olmadığı için kendi submit'ini yönetir.
    const kaydet = handleSubmit((veri) => {
        setSunucuHatasi(undefined);
        startTransition(async () => {
            const sonuc = await gondericiEkle(veri);
            if ("hata" in sonuc) setSunucuHatasi(sonuc.hata);
            else eklendi(sonuc.gonderici);
        });
    });

    return (
        <form onSubmit={kaydet} className="space-y-4 rounded-lg border-2 border-dashed border-[var(--color-secondary)]/30 p-4">
            <h3 className="text-sm font-semibold">Yeni Firma / Gönderici</h3>

            <Alan etiket="Firma Adı" htmlFor="g_firma_adi" hata={errors.firma_adi?.message} zorunlu>
                <input
                    id="g_firma_adi"
                    autoFocus
                    aria-invalid={!!errors.firma_adi}
                    className={inputSinifi}
                    {...register("firma_adi")}
                />
            </Alan>

            <Alan etiket="Gönderici Adı" htmlFor="g_gonderici_adi" hata={errors.gonderici_adi?.message} zorunlu>
                <div className="flex gap-2">
                    <input
                        id="g_gonderici_adi"
                        aria-invalid={!!errors.gonderici_adi}
                        className={inputSinifi}
                        {...register("gonderici_adi")}
                    />
                    <Button type="button" variant="outline" onClick={firmaAdiniKopyala} title="Firma adıyla aynı olsun">
                        <Copy /> <span className="hidden sm:inline">Firma adıyla aynı</span>
                    </Button>
                </div>
            </Alan>

            <Alan etiket="Telefon" htmlFor="g_telefon" hata={errors.telefon?.message} zorunlu>
                <input
                    id="g_telefon"
                    type="tel"
                    placeholder="0505 387 79 39"
                    aria-invalid={!!errors.telefon}
                    className={inputSinifi}
                    {...register("telefon")}
                />
            </Alan>

            <Alan etiket="Adres" htmlFor="g_adres" hata={errors.adres?.message} zorunlu>
                <textarea
                    id="g_adres"
                    rows={3}
                    aria-invalid={!!errors.adres}
                    className={inputSinifi}
                    {...register("adres")}
                />
            </Alan>

            <Alan etiket="VKN / TCKN (opsiyonel)" htmlFor="g_vkn" hata={errors.vkn?.message}>
                <input
                    id="g_vkn"
                    inputMode="numeric"
                    maxLength={11}
                    aria-invalid={!!errors.vkn}
                    className={inputSinifi}
                    {...register("vkn")}
                />
            </Alan>

            <FormHatasi mesaj={sunucuHatasi} />

            <div className="flex gap-2">
                <Button type="submit" disabled={bekliyor} className={anaButonSinifi}>
                    {bekliyor ? <Loader2 className="animate-spin" /> : <Save />} Kaydet
                </Button>
                <Button type="button" variant="outline" onClick={vazgec} disabled={bekliyor}>
                    Vazgeç
                </Button>
            </div>
        </form>
    );
}
