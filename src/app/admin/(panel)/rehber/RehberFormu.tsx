// src/app/admin/(panel)/rehber/RehberFormu.tsx
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { rehberKisiKaydet } from "@/actions/rehber";
import {
    rehberKisiSemasi,
    type RehberKategori,
    type RehberKisi,
    type RehberKisiGirdisi,
} from "@/lib/schemas/rehber";
import { Button } from "@/components/ui/button";
import { Alan, anaButonSinifi, FormHatasi, inputSinifi } from "../../_components/form";

type Props = {
    kategoriler: RehberKategori[];
    kisi?: RehberKisi; // verilmezse yeni kayıt
};

export default function RehberFormu({ kategoriler, kisi }: Props) {
    const [sunucuHatasi, setSunucuHatasi] = useState<string>();
    const [bekliyor, startTransition] = useTransition();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RehberKisiGirdisi>({
        resolver: zodResolver(rehberKisiSemasi),
        defaultValues: {
            ad_soyad_unvan: kisi?.ad_soyad_unvan ?? "",
            firma: kisi?.firma ?? "",
            kategori_id: kisi?.kategori_id ?? "",
            telefon_1: kisi?.telefon_1 ?? "",
            telefon_2: kisi?.telefon_2 ?? "",
            eposta: kisi?.eposta ?? "",
            adres: kisi?.adres ?? "",
            notlar: kisi?.notlar ?? "",
        },
    });

    const gonder = handleSubmit((veri) => {
        setSunucuHatasi(undefined);
        startTransition(async () => {
            const sonuc = await rehberKisiKaydet(kisi?.id ?? null, veri);
            if (sonuc?.hata) setSunucuHatasi(sonuc.hata);
        });
    });

    return (
        <form onSubmit={gonder} className="max-w-2xl space-y-5 rounded-xl border bg-white p-5 shadow-sm sm:p-6">
            <div className="grid gap-5 sm:grid-cols-2">
                <Alan etiket="Ad Soyad / Ünvan" htmlFor="ad_soyad_unvan" hata={errors.ad_soyad_unvan?.message} zorunlu>
                    <input
                        id="ad_soyad_unvan"
                        autoFocus={!kisi}
                        aria-invalid={!!errors.ad_soyad_unvan}
                        className={inputSinifi}
                        {...register("ad_soyad_unvan")}
                    />
                </Alan>

                <Alan etiket="Firma" htmlFor="firma" hata={errors.firma?.message}>
                    <input id="firma" className={inputSinifi} {...register("firma")} />
                </Alan>

                <Alan etiket="Kategori" htmlFor="kategori_id" hata={errors.kategori_id?.message}>
                    <select id="kategori_id" className={inputSinifi} {...register("kategori_id")}>
                        <option value="">— Kategorisiz —</option>
                        {kategoriler.map((k) => (
                            <option key={k.id} value={k.id}>
                                {k.ad}
                            </option>
                        ))}
                    </select>
                </Alan>

                <Alan etiket="E-posta" htmlFor="eposta" hata={errors.eposta?.message}>
                    <input
                        id="eposta"
                        type="email"
                        aria-invalid={!!errors.eposta}
                        className={inputSinifi}
                        {...register("eposta")}
                    />
                </Alan>

                <Alan etiket="Telefon 1" htmlFor="telefon_1" hata={errors.telefon_1?.message}>
                    <input
                        id="telefon_1"
                        type="tel"
                        placeholder="0532 123 45 67"
                        aria-invalid={!!errors.telefon_1}
                        className={inputSinifi}
                        {...register("telefon_1")}
                    />
                </Alan>

                <Alan etiket="Telefon 2" htmlFor="telefon_2" hata={errors.telefon_2?.message}>
                    <input
                        id="telefon_2"
                        type="tel"
                        aria-invalid={!!errors.telefon_2}
                        className={inputSinifi}
                        {...register("telefon_2")}
                    />
                </Alan>
            </div>

            <Alan etiket="Adres" htmlFor="adres" hata={errors.adres?.message}>
                <textarea
                    id="adres"
                    rows={3}
                    placeholder="Kargo/teslimat adresi olarak kullanılır"
                    className={inputSinifi}
                    {...register("adres")}
                />
            </Alan>

            <Alan etiket="Notlar" htmlFor="notlar" hata={errors.notlar?.message}>
                <textarea id="notlar" rows={3} className={inputSinifi} {...register("notlar")} />
            </Alan>

            <FormHatasi mesaj={sunucuHatasi} />

            <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={bekliyor} className={anaButonSinifi}>
                    {bekliyor ? <Loader2 className="animate-spin" /> : <Save />}
                    Kaydet
                </Button>
                <Button type="button" variant="outline" asChild>
                    <Link href="/admin/rehber">Vazgeç</Link>
                </Button>
            </div>
        </form>
    );
}
