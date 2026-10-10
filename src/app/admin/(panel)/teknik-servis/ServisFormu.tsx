// src/app/admin/(panel)/teknik-servis/ServisFormu.tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, UserCheck } from "lucide-react";
import { musteriAra, servisKaydet } from "@/actions/servis";
import {
    servisSemasi,
    type MusteriCihazi,
    type MusteriSecenegi,
    type ServisGirdisi,
    type ServisKaydi,
} from "@/lib/schemas/servis";
import type { Personel } from "@/lib/schemas/personel";
import { tarihSaatYaz } from "@/lib/tarih";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Alan, anaButonSinifi, FormHatasi, inputSinifi } from "../../_components/form";

type Props = {
    personeller: Pick<Personel, "id" | "ad_soyad" | "aktif">[];
    kayit?: ServisKaydi; // verilmezse yeni kayıt
    musteri?: MusteriSecenegi; // düzenlemede kaydın bağlı olduğu müşteri
};

const YENI_CIHAZ = "yeni";
const telefonu = (m: MusteriSecenegi) => m.telefon_1 ?? m.telefon_2 ?? "";

// Yazılan telefon (en az 4 rakam) ya da ad (en az 3 harf) ile rehberde aranır.
function aramaMetni(ad: string, telefon: string) {
    const rakam = telefon.replace(/\D/g, "");
    if (rakam.length >= 4) return rakam;
    return ad.trim().length >= 3 ? ad.trim() : "";
}

export default function ServisFormu({ personeller, kayit, musteri }: Props) {
    const [sunucuHatasi, setSunucuHatasi] = useState<string>();
    const [bekliyor, startTransition] = useTransition();

    const [secili, setSecili] = useState<MusteriSecenegi | null>(musteri ?? null);
    // null: müşterinin kayıtlı cihazı var ama henüz seçim yapılmadı
    const [cihazSecimi, setCihazSecimi] = useState<string | null>(kayit?.cihaz_id ?? YENI_CIHAZ);
    const [cihazHatasi, setCihazHatasi] = useState<string>();
    const [oneriler, setOneriler] = useState<{ q: string; liste: MusteriSecenegi[] }>({ q: "", liste: [] });

    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: { errors },
    } = useForm<ServisGirdisi>({
        resolver: zodResolver(servisSemasi),
        defaultValues: {
            musteri_id: kayit?.musteri_id ?? "",
            cihaz_id: kayit?.cihaz_id ?? "",
            musteri_ad_soyad: kayit?.musteri_ad_soyad ?? "",
            musteri_telefon: kayit?.musteri_telefon ?? "",
            cihaz_marka_model: kayit?.cihaz_marka_model ?? "",
            seri_no: kayit?.seri_no ?? "",
            sikayet: kayit?.sikayet ?? "",
            notlar: kayit?.notlar ?? "",
            teslim_alan_personel_id: kayit?.teslim_alan_personel_id ?? "",
            tahmini_teslim_tarihi: kayit?.tahmini_teslim_tarihi ?? "",
        },
    });

    const [ad, telefon] = useWatch({ control, name: ["musteri_ad_soyad", "musteri_telefon"] });
    const q = secili ? "" : aramaMetni(ad, telefon);

    useEffect(() => {
        if (!q) return;
        let iptal = false;
        const zamanlayici = setTimeout(async () => {
            const liste = await musteriAra(q);
            if (!iptal) setOneriler({ q, liste });
        }, 300);
        return () => {
            iptal = true;
            clearTimeout(zamanlayici);
        };
    }, [q]);

    const gorunenOneriler = q && oneriler.q === q ? oneriler.liste : [];

    function cihazSec(cihaz: MusteriCihazi | null) {
        setCihazHatasi(undefined);
        setCihazSecimi(cihaz?.id ?? YENI_CIHAZ);
        setValue("cihaz_id", cihaz?.id ?? "");
        setValue("cihaz_marka_model", cihaz?.marka_model ?? "");
        setValue("seri_no", cihaz?.seri_no ?? "");
    }

    function musteriSec(m: MusteriSecenegi) {
        setSecili(m);
        setValue("musteri_id", m.id);
        setValue("musteri_ad_soyad", m.ad_soyad_unvan);
        setValue("musteri_telefon", telefonu(m), { shouldValidate: true });
        // Kayıtlı cihazı varsa personel bilinçli olarak seçmeli (aynı cihaz mı, yeni cihaz mı).
        cihazSec(null);
        if (m.cihazlar.length > 0) setCihazSecimi(null);
    }

    function musteriBirak() {
        setSecili(null);
        setValue("musteri_id", "");
        setValue("musteri_ad_soyad", "");
        setValue("musteri_telefon", "");
        cihazSec(null);
    }

    const gonder = handleSubmit((veri) => {
        if (cihazSecimi === null) {
            setCihazHatasi("Kayıtlı cihazlardan birini ya da “Yeni cihaz”ı seçin.");
            return;
        }
        setSunucuHatasi(undefined);
        startTransition(async () => {
            const sonuc = await servisKaydet(kayit?.id ?? null, veri);
            if (sonuc?.hata) setSunucuHatasi(sonuc.hata);
        });
    });

    const iptalLinki = kayit ? `/admin/teknik-servis/${kayit.id}` : "/admin/teknik-servis";

    return (
        <form onSubmit={gonder} className="max-w-3xl space-y-6 rounded-xl border bg-white p-5 shadow-sm sm:p-6">
            <input type="hidden" {...register("musteri_id")} />
            <input type="hidden" {...register("cihaz_id")} />

            <fieldset className="space-y-4">
                <legend className="mb-1 font-semibold text-[var(--color-secondary)]">Müşteri</legend>
                {secili ? (
                    <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
                        <div className="flex min-w-0 gap-3">
                            <UserCheck className="mt-0.5 size-5 shrink-0 text-green-600" />
                            <div className="min-w-0">
                                <p className="font-medium">{secili.ad_soyad_unvan}</p>
                                <p className="text-sm text-gray-600">{telefonu(secili) || "Telefon kayıtlı değil"}</p>
                                {errors.musteri_telefon && (
                                    <p className="mt-1 text-xs text-[var(--color-primary)]">
                                        Servis kaydı için telefon gerekli.{" "}
                                        <Link href={`/admin/rehber/${secili.id}`} className="underline">
                                            Rehberden telefon ekleyin
                                        </Link>
                                        .
                                    </p>
                                )}
                            </div>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={musteriBirak}>
                            Değiştir
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Alan etiket="Telefon" htmlFor="musteri_telefon" hata={errors.musteri_telefon?.message} zorunlu>
                                <input
                                    id="musteri_telefon"
                                    type="tel"
                                    autoFocus={!kayit}
                                    placeholder="0532 123 45 67"
                                    autoComplete="off"
                                    aria-invalid={!!errors.musteri_telefon}
                                    className={inputSinifi}
                                    {...register("musteri_telefon")}
                                />
                            </Alan>
                            <Alan etiket="Ad Soyad" htmlFor="musteri_ad_soyad" hata={errors.musteri_ad_soyad?.message} zorunlu>
                                <input
                                    id="musteri_ad_soyad"
                                    autoComplete="off"
                                    aria-invalid={!!errors.musteri_ad_soyad}
                                    className={inputSinifi}
                                    {...register("musteri_ad_soyad")}
                                />
                            </Alan>
                        </div>
                        {gorunenOneriler.length > 0 ? (
                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                                <p className="mb-2 text-sm font-medium text-amber-800">
                                    Rehberde eşleşen kayıt var. Müşteri daha önce geldiyse listeden seçin:
                                </p>
                                <ul className="divide-y divide-amber-200/70">
                                    {gorunenOneriler.map((m) => (
                                        <li key={m.id} className="flex items-center justify-between gap-3 py-1.5">
                                            <div className="min-w-0 text-sm">
                                                <span className="font-medium">{m.ad_soyad_unvan}</span>
                                                <span className="text-gray-600"> · {telefonu(m) || "telefon yok"}</span>
                                                {m.cihazlar.length > 0 && (
                                                    <span className="text-gray-500"> · {m.cihazlar.length} cihaz</span>
                                                )}
                                            </div>
                                            <Button type="button" size="sm" variant="outline" onClick={() => musteriSec(m)}>
                                                Seç
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <p className="text-xs text-gray-500">
                                Telefon veya ad yazdıkça rehberde aranır. Eşleşme yoksa kayıt açılırken müşteri rehbere eklenir.
                            </p>
                        )}
                    </>
                )}
            </fieldset>

            <fieldset className="space-y-4">
                <legend className="mb-1 font-semibold text-[var(--color-secondary)]">Cihaz</legend>
                {secili && secili.cihazlar.length > 0 && (
                    <div role="radiogroup" aria-label="Cihaz seçimi" className="space-y-2">
                        <p className="text-sm text-gray-600">Müşterinin kayıtlı cihazları. Aynı cihaz geldiyse onu seçin:</p>
                        {secili.cihazlar.map((c) => (
                            <SecimSatiri key={c.id} secili={cihazSecimi === c.id} onSec={() => cihazSec(c)}>
                                <p className="font-medium">{c.marka_model}</p>
                                <p className="text-xs text-gray-500">
                                    Seri No: {c.seri_no ?? "—"}
                                    {c.servisler.length > 0 &&
                                        ` · ${c.servisler.length} servis kaydı, son: #${c.servisler[0].form_no} (${tarihSaatYaz(c.servisler[0].giris_tarihi)})`}
                                </p>
                            </SecimSatiri>
                        ))}
                        <SecimSatiri secili={cihazSecimi === YENI_CIHAZ} onSec={() => cihazSec(null)}>
                            <p className="font-medium">Yeni cihaz</p>
                        </SecimSatiri>
                        {cihazHatasi && <p className="text-xs text-[var(--color-primary)]">{cihazHatasi}</p>}
                    </div>
                )}
                {cihazSecimi === YENI_CIHAZ && (
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Alan etiket="Marka / Model" htmlFor="cihaz_marka_model" hata={errors.cihaz_marka_model?.message} zorunlu>
                            <input
                                id="cihaz_marka_model"
                                placeholder="Lenovo ThinkPad E14"
                                aria-invalid={!!errors.cihaz_marka_model}
                                className={inputSinifi}
                                {...register("cihaz_marka_model")}
                            />
                        </Alan>
                        <Alan etiket="Seri No" htmlFor="seri_no" hata={errors.seri_no?.message}>
                            <input id="seri_no" className={inputSinifi} {...register("seri_no")} />
                        </Alan>
                    </div>
                )}
                <Alan etiket="Şikayet / Arıza" htmlFor="sikayet" hata={errors.sikayet?.message} zorunlu>
                    <textarea
                        id="sikayet"
                        rows={3}
                        placeholder="Müşterinin bildirdiği arıza veya talep"
                        aria-invalid={!!errors.sikayet}
                        className={inputSinifi}
                        {...register("sikayet")}
                    />
                </Alan>
            </fieldset>

            <fieldset className="space-y-4">
                <legend className="mb-1 font-semibold text-[var(--color-secondary)]">Teslim Alma</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Alan
                        etiket="Cihazı Teslim Alan Personel"
                        htmlFor="teslim_alan_personel_id"
                        hata={errors.teslim_alan_personel_id?.message}
                        zorunlu
                    >
                        <select
                            id="teslim_alan_personel_id"
                            aria-invalid={!!errors.teslim_alan_personel_id}
                            className={inputSinifi}
                            {...register("teslim_alan_personel_id")}
                        >
                            <option value="">— Personel seçin —</option>
                            {personeller.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.ad_soyad}
                                    {!p.aktif ? " (pasif)" : ""}
                                </option>
                            ))}
                        </select>
                        {personeller.length === 0 && (
                            <p className="text-xs text-gray-500">
                                Aktif personel yok.{" "}
                                <Link href="/admin/personel/yeni" className="underline">
                                    Personel ekleyin
                                </Link>
                                .
                            </p>
                        )}
                    </Alan>
                    <Alan etiket="Tahmini Teslim Tarihi" htmlFor="tahmini_teslim_tarihi" hata={errors.tahmini_teslim_tarihi?.message}>
                        <input id="tahmini_teslim_tarihi" type="date" className={inputSinifi} {...register("tahmini_teslim_tarihi")} />
                    </Alan>
                </div>
                <Alan etiket="İç Not" htmlFor="notlar" hata={errors.notlar?.message}>
                    <textarea
                        id="notlar"
                        rows={2}
                        placeholder="Sadece panelde görünür (teslim alınan aksesuarlar, cihazın fiziksel durumu vb.)"
                        className={inputSinifi}
                        {...register("notlar")}
                    />
                </Alan>
            </fieldset>

            <FormHatasi mesaj={sunucuHatasi} />

            <div className="flex gap-2">
                <Button type="submit" disabled={bekliyor} className={anaButonSinifi}>
                    {bekliyor ? <Loader2 className="animate-spin" /> : <Save />}
                    {kayit ? "Kaydet" : "Servis Kaydı Aç"}
                </Button>
                <Button type="button" variant="outline" asChild>
                    <Link href={iptalLinki}>Vazgeç</Link>
                </Button>
            </div>
        </form>
    );
}

function SecimSatiri({ secili, onSec, children }: { secili: boolean; onSec: () => void; children: React.ReactNode }) {
    return (
        <label
            className={cn(
                "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition hover:bg-gray-50",
                secili && "border-[var(--color-secondary)] bg-[var(--color-secondary)]/5"
            )}
        >
            <input type="radio" name="cihaz_secimi" checked={secili} onChange={onSec} className="mt-1" />
            <div className="min-w-0 text-sm">{children}</div>
        </label>
    );
}
