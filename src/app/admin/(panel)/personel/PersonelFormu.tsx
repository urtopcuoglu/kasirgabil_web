// src/app/admin/(panel)/personel/PersonelFormu.tsx
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { personelKaydet } from "@/actions/personel";
import { ROLLER, personelSemasi, type Personel, type PersonelGirdisi } from "@/lib/schemas/personel";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Alan, anaButonSinifi, FormHatasi, inputSinifi } from "../../_components/form";

type Props = {
    personel?: Personel; // verilmezse yeni kayıt
};

export default function PersonelFormu({ personel }: Props) {
    const [sunucuHatasi, setSunucuHatasi] = useState<string>();
    const [bekliyor, startTransition] = useTransition();

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<PersonelGirdisi>({
        resolver: zodResolver(personelSemasi),
        defaultValues: {
            ad_soyad: personel?.ad_soyad ?? "",
            telefon: personel?.telefon ?? "",
            rol: personel?.rol ?? "teknisyen",
            aktif: personel?.aktif ?? true,
        },
    });

    const gonder = handleSubmit((veri) => {
        setSunucuHatasi(undefined);
        startTransition(async () => {
            const sonuc = await personelKaydet(personel?.id ?? null, veri);
            if (sonuc?.hata) setSunucuHatasi(sonuc.hata);
        });
    });

    return (
        <form onSubmit={gonder} className="max-w-xl space-y-5 rounded-xl border bg-white p-5 shadow-sm sm:p-6">
            <Alan etiket="Ad Soyad" htmlFor="ad_soyad" hata={errors.ad_soyad?.message} zorunlu>
                <input
                    id="ad_soyad"
                    autoFocus={!personel}
                    aria-invalid={!!errors.ad_soyad}
                    className={inputSinifi}
                    {...register("ad_soyad")}
                />
            </Alan>

            <div className="grid gap-5 sm:grid-cols-2">
                <Alan etiket="Telefon" htmlFor="telefon" hata={errors.telefon?.message}>
                    <input
                        id="telefon"
                        type="tel"
                        placeholder="0532 123 45 67"
                        aria-invalid={!!errors.telefon}
                        className={inputSinifi}
                        {...register("telefon")}
                    />
                </Alan>

                <Alan etiket="Rol" htmlFor="rol" hata={errors.rol?.message} zorunlu>
                    <select id="rol" className={inputSinifi} {...register("rol")}>
                        {Object.entries(ROLLER).map(([deger, etiket]) => (
                            <option key={deger} value={deger}>
                                {etiket}
                            </option>
                        ))}
                    </select>
                </Alan>
            </div>

            <Controller
                control={control}
                name="aktif"
                render={({ field }) => (
                    <label htmlFor="aktif" className="flex items-center gap-3 text-sm">
                        <Switch
                            id="aktif"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-green-600"
                        />
                        <span>
                            <span className="font-medium">{field.value ? "Aktif" : "Pasif"}</span>
                            <span className="block text-xs text-gray-500">
                                Pasif personel, servis kaydı gibi seçim listelerinde görünmez.
                            </span>
                        </span>
                    </label>
                )}
            />

            <FormHatasi mesaj={sunucuHatasi} />

            <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={bekliyor} className={anaButonSinifi}>
                    {bekliyor ? <Loader2 className="animate-spin" /> : <Save />}
                    Kaydet
                </Button>
                <Button type="button" variant="outline" asChild>
                    <Link href="/admin/personel">Vazgeç</Link>
                </Button>
            </div>
        </form>
    );
}
