// src/app/admin/(panel)/teknik-servis/[id]/KalemTablosu.tsx
// Servis kaydının işçilik / malzeme ücret satırları: satır satır ekleme, düzenleme, silme.
"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, Pencil, Plus, X } from "lucide-react";
import { kalemKaydet, kalemSil } from "@/actions/servis";
import {
    KALEM_TIPLERI,
    kalemSemasi,
    kalemToplamlari,
    sayi,
    type KalemGirdisi,
    type ServisKalemi,
} from "@/lib/schemas/servis";
import { paraYaz } from "@/lib/tarih";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { inputSinifi } from "../../../_components/form";
import SilButonu from "../../../_components/SilButonu";

type Props = {
    servisId: string;
    kalemler: ServisKalemi[];
};

export default function KalemTablosu({ servisId, kalemler }: Props) {
    const [duzenlenenId, setDuzenlenenId] = useState<string | null>(null);
    const toplam = kalemToplamlari(kalemler);

    return (
        <div>
            <div className="-mx-5 overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                    <thead className="border-y bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                        <tr>
                            <th className="w-32 px-5 py-2 font-medium">Tip</th>
                            <th className="px-2 py-2 font-medium">Açıklama</th>
                            <th className="w-24 px-2 py-2 text-right font-medium">Miktar</th>
                            <th className="w-32 px-2 py-2 text-right font-medium">Birim Fiyat</th>
                            <th className="w-32 px-2 py-2 text-right font-medium">Tutar</th>
                            <th className="w-24 px-5 py-2" />
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {kalemler.map((kalem) =>
                            duzenlenenId === kalem.id ? (
                                <KalemSatirFormu
                                    key={kalem.id}
                                    servisId={servisId}
                                    kalem={kalem}
                                    bitti={() => setDuzenlenenId(null)}
                                />
                            ) : (
                                <tr key={kalem.id} className="hover:bg-gray-50">
                                    <td className="px-5 py-2">
                                        <TipRozeti tip={kalem.tip} />
                                    </td>
                                    <td className="px-2 py-2">{kalem.aciklama}</td>
                                    <td className="px-2 py-2 text-right">{sayi(kalem.miktar).toLocaleString("tr-TR")}</td>
                                    <td className="px-2 py-2 text-right">{paraYaz(sayi(kalem.birim_fiyat))}</td>
                                    <td className="px-2 py-2 text-right font-medium">{paraYaz(sayi(kalem.tutar))}</td>
                                    <td className="px-5 py-2">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setDuzenlenenId(kalem.id)}
                                                title="Düzenle"
                                                disabled={duzenlenenId !== null}
                                            >
                                                <Pencil />
                                            </Button>
                                            <SilButonu
                                                onay={`"${kalem.aciklama}" kalemi silinsin mi?`}
                                                sil={kalemSil.bind(null, servisId, kalem.id)}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            )
                        )}
                        {duzenlenenId === null && <KalemSatirFormu servisId={servisId} />}
                    </tbody>
                </table>
            </div>

            {kalemler.length === 0 && (
                <p className="mt-3 text-xs text-gray-500">Henüz kalem eklenmemiş. Yukarıdaki satırdan işçilik veya malzeme ekleyin.</p>
            )}

            {/* Toplamlar */}
            <dl className="ml-auto mt-4 max-w-xs space-y-1 text-sm">
                <div className="flex justify-between text-gray-600">
                    <dt>İşçilik</dt>
                    <dd>{paraYaz(toplam.iscilik)}</dd>
                </div>
                <div className="flex justify-between text-gray-600">
                    <dt>Malzeme</dt>
                    <dd>{paraYaz(toplam.malzeme)}</dd>
                </div>
                <div className="flex justify-between border-t pt-2 text-base font-bold text-[var(--color-secondary)]">
                    <dt>Genel Toplam</dt>
                    <dd>{paraYaz(toplam.genel)}</dd>
                </div>
            </dl>
        </div>
    );
}

function TipRozeti({ tip }: { tip: ServisKalemi["tip"] }) {
    return (
        <span
            className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                tip === "iscilik" ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-orange-700"
            )}
        >
            {KALEM_TIPLERI[tip]}
        </span>
    );
}

type FormProps = {
    servisId: string;
    kalem?: ServisKalemi; // verilmezse yeni kalem satırı
    bitti?: () => void;
};

// Hem yeni kalem ekleme satırı hem de mevcut kalemin satır içi düzenlemesi.
function KalemSatirFormu({ servisId, kalem, bitti }: FormProps) {
    const [hata, setHata] = useState<string>();
    const [bekliyor, startTransition] = useTransition();

    const varsayilan: KalemGirdisi = {
        tip: kalem?.tip ?? "iscilik",
        aciklama: kalem?.aciklama ?? "",
        miktar: kalem ? sayi(kalem.miktar) : 1,
        birim_fiyat: kalem ? sayi(kalem.birim_fiyat) : 0,
    };

    const { register, handleSubmit, reset, watch, setFocus } = useForm<KalemGirdisi>({
        resolver: zodResolver(kalemSemasi),
        defaultValues: varsayilan,
    });

    const [miktar, birimFiyat] = watch(["miktar", "birim_fiyat"]);
    const onizlemeTutar = (Number.isFinite(miktar) ? miktar : 0) * (Number.isFinite(birimFiyat) ? birimFiyat : 0);

    // Form <tr> içinde olamayacağı için kaydetme butonla tetiklenir; Enter da desteklenir.
    const kaydet = handleSubmit(
        (veri) => {
            setHata(undefined);
            startTransition(async () => {
                const sonuc = await kalemKaydet(servisId, kalem?.id ?? null, veri);
                if (sonuc?.hata) {
                    setHata(sonuc.hata);
                    return;
                }
                if (kalem) bitti?.();
                else {
                    reset({ ...varsayilan, tip: veri.tip });
                    setFocus("aciklama");
                }
            });
        },
        (hatalar) => setHata(Object.values(hatalar)[0]?.message)
    );

    const enter = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            kaydet();
        }
        if (e.key === "Escape" && kalem) bitti?.();
    };

    const kucukInput = cn(inputSinifi, "px-2 py-1.5");

    return (
        <>
            <tr className={cn(kalem ? "bg-blue-50/40" : "bg-gray-50/60")} onKeyDown={enter}>
                <td className="px-5 py-2">
                    <select aria-label="Tip" className={kucukInput} {...register("tip")}>
                        {Object.entries(KALEM_TIPLERI).map(([deger, etiket]) => (
                            <option key={deger} value={deger}>
                                {etiket}
                            </option>
                        ))}
                    </select>
                </td>
                <td className="px-2 py-2">
                    <input
                        aria-label="Açıklama"
                        placeholder={kalem ? undefined : "Örn. Ekran değişimi"}
                        autoFocus={!!kalem}
                        className={kucukInput}
                        {...register("aciklama")}
                    />
                </td>
                <td className="px-2 py-2">
                    <input
                        aria-label="Miktar"
                        type="number"
                        step="0.01"
                        min="0.01"
                        inputMode="decimal"
                        className={cn(kucukInput, "text-right")}
                        {...register("miktar", { valueAsNumber: true })}
                    />
                </td>
                <td className="px-2 py-2">
                    <input
                        aria-label="Birim fiyat"
                        type="number"
                        step="0.01"
                        min="0"
                        inputMode="decimal"
                        className={cn(kucukInput, "text-right")}
                        {...register("birim_fiyat", { valueAsNumber: true })}
                    />
                </td>
                <td className="px-2 py-2 text-right text-gray-500">{paraYaz(onizlemeTutar)}</td>
                <td className="px-5 py-2">
                    <div className="flex justify-end gap-1">
                        <Button
                            type="button"
                            size="icon"
                            onClick={() => kaydet()}
                            disabled={bekliyor}
                            title={kalem ? "Kaydet" : "Kalem ekle"}
                            className="bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary)]/90"
                        >
                            {bekliyor ? <Loader2 className="animate-spin" /> : kalem ? <Check /> : <Plus />}
                        </Button>
                        {kalem && (
                            <Button type="button" variant="ghost" size="icon" onClick={bitti} title="Vazgeç">
                                <X />
                            </Button>
                        )}
                    </div>
                </td>
            </tr>
            {hata && (
                <tr>
                    <td colSpan={6} className="px-5 pb-2 text-xs text-[var(--color-primary)]">
                        {hata}
                    </td>
                </tr>
            )}
        </>
    );
}
