// src/app/admin/(panel)/stok/kutular/KutuFormu.tsx
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PackageOpen, Save } from "lucide-react";
import { kutuKaydet } from "@/actions/stok";
import { kutuAnahtari, kutuEtiketi, kutuSemasi, type Kutu, type KutuGirdisi } from "@/lib/schemas/stok";
import { Button } from "@/components/ui/button";
import { Alan, anaButonSinifi, FormHatasi, inputSinifi } from "../../../_components/form";

type KutuOzeti = Pick<Kutu, "id" | "kutu_no" | "marka" | "model">;

type Props = {
    kutular: KutuOzeti[]; // mükerrer kontrolü ve sıradaki numara için
    kutu?: Kutu; // verilmezse yeni kutu
    bitti?: () => void;
};

export default function KutuFormu({ kutular, kutu, bitti }: Props) {
    const [sunucuHatasi, setSunucuHatasi] = useState<string>();
    const [bekliyor, startTransition] = useTransition();
    const siradakiNo = kutular.reduce((max, k) => Math.max(max, k.kutu_no), 0) + 1;

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<KutuGirdisi>({
        resolver: zodResolver(kutuSemasi),
        defaultValues: {
            kutu_no: String(kutu?.kutu_no ?? siradakiNo),
            marka: kutu?.marka ?? "",
            model: kutu?.model ?? "",
            konum: kutu?.konum ?? "",
            notlar: kutu?.notlar ?? "",
        },
    });

    // Yazılan marka/model ile benzeşen mevcut kutular: aynı cihaz için ikinci kutu açılmasın.
    const [marka, model] = useWatch({ control, name: ["marka", "model"] });
    const aranan = kutuAnahtari(marka, model);
    const benzerler =
        aranan.length >= 3
            ? kutular.filter((k) => k.id !== kutu?.id && kutuAnahtari(k.marka, k.model).includes(aranan)).slice(0, 5)
            : [];
    const birebir = benzerler.find((k) => kutuAnahtari(k.marka, k.model) === aranan);

    const gonder = handleSubmit((veri) => {
        setSunucuHatasi(undefined);
        startTransition(async () => {
            const sonuc = await kutuKaydet(kutu?.id ?? null, veri);
            if (sonuc?.hata) setSunucuHatasi(sonuc.hata);
            else bitti?.();
        });
    });

    return (
        <form onSubmit={gonder} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-[120px_1fr_1fr]">
                <Alan etiket="Kutu No" htmlFor="kutu_no" hata={errors.kutu_no?.message} zorunlu>
                    <input id="kutu_no" inputMode="numeric" aria-invalid={!!errors.kutu_no} className={inputSinifi} {...register("kutu_no")} />
                </Alan>
                <Alan etiket="Marka" htmlFor="marka" hata={errors.marka?.message} zorunlu>
                    <input
                        id="marka"
                        placeholder="Lenovo"
                        autoComplete="off"
                        aria-invalid={!!errors.marka}
                        className={inputSinifi}
                        {...register("marka")}
                    />
                </Alan>
                <Alan etiket="Model" htmlFor="model" hata={errors.model?.message} zorunlu>
                    <input
                        id="model"
                        placeholder="ThinkPad E14"
                        autoComplete="off"
                        aria-invalid={!!errors.model}
                        className={inputSinifi}
                        {...register("model")}
                    />
                </Alan>
            </div>

            {benzerler.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
                    <p className="mb-1.5 font-medium text-amber-800">
                        {birebir
                            ? "Bu marka/model için zaten kutu var. Parçaları o kutuya ekleyin:"
                            : "Benzer kutular var. Aynı cihazsa yeni kutu açmayın:"}
                    </p>
                    <ul className="space-y-1">
                        {benzerler.map((k) => (
                            <li key={k.id}>
                                <Link href={`/admin/stok/kutular/${k.id}`} className="inline-flex items-center gap-1.5 hover:underline">
                                    <PackageOpen className="size-3.5" /> {kutuEtiketi(k)}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
                <Alan etiket="Konum (raf / dolap)" htmlFor="konum" hata={errors.konum?.message}>
                    <input id="konum" placeholder="Örn. A3 rafı" className={inputSinifi} {...register("konum")} />
                </Alan>
                <Alan etiket="Not" htmlFor="notlar" hata={errors.notlar?.message}>
                    <input id="notlar" placeholder="Örn. Anakart arızalı, kasa çizik" className={inputSinifi} {...register("notlar")} />
                </Alan>
            </div>

            <FormHatasi mesaj={sunucuHatasi} />

            <div className="flex gap-2">
                <Button type="submit" disabled={bekliyor || !!birebir} className={anaButonSinifi}>
                    {bekliyor ? <Loader2 className="animate-spin" /> : <Save />}
                    {kutu ? "Kaydet" : "Kutu Aç"}
                </Button>
                {bitti && (
                    <Button type="button" variant="outline" onClick={bitti}>
                        Vazgeç
                    </Button>
                )}
            </div>
        </form>
    );
}
