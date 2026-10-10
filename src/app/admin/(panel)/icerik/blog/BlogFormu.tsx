// src/app/admin/(panel)/icerik/blog/BlogFormu.tsx
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { blogYazisiKaydet } from "@/actions/icerik";
import {
    BLOG_DURUMLARI,
    blogYazisiSemasi,
    slugUret,
    type BlogKategori,
    type BlogYazisi,
    type BlogYazisiGirdisi,
} from "@/lib/schemas/icerik";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Alan, anaButonSinifi, FormHatasi, inputSinifi } from "../../../_components/form";
import GorselSecici from "../../../_components/icerik/GorselSecici";
import ZenginEditor from "../../../_components/icerik/ZenginEditor";

type Props = {
    kategoriler: BlogKategori[];
    yazi?: BlogYazisi; // verilmezse yeni yazı
};

// timestamptz → datetime-local değeri (Türkiye saati)
function yerelTarih(iso: string | null) {
    if (!iso) return "";
    const p = new Intl.DateTimeFormat("sv-SE", {
        timeZone: "Europe/Istanbul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(iso));
    return p.replace(" ", "T");
}

export default function BlogFormu({ kategoriler, yazi }: Props) {
    const [sunucuHatasi, setSunucuHatasi] = useState<string>();
    const [kaydedildi, setKaydedildi] = useState(false);
    const [bekliyor, startTransition] = useTransition();
    // Slug elle değiştirilmediyse başlıkla birlikte güncellenir (kayıtlı yazıda adres değişmesin diye kapalı).
    const [slugOtomatik, setSlugOtomatik] = useState(!yazi);

    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: { errors },
    } = useForm<BlogYazisiGirdisi>({
        resolver: zodResolver(blogYazisiSemasi),
        defaultValues: {
            baslik: yazi?.baslik ?? "",
            slug: yazi?.slug ?? "",
            ozet: yazi?.ozet ?? "",
            kapak_gorsel_url: yazi?.kapak_gorsel_url ?? "",
            icerik: yazi?.icerik ?? "",
            kategori_id: yazi?.kategori_id ?? "",
            durum: yazi?.durum ?? "taslak",
            yayin_tarihi: yerelTarih(yazi?.yayin_tarihi ?? null),
            seo_baslik: yazi?.seo_baslik ?? "",
            seo_aciklama: yazi?.seo_aciklama ?? "",
        },
    });

    const [baslik, slug, ozet, seoBaslik, seoAciklama, durum] = useWatch({
        control,
        name: ["baslik", "slug", "ozet", "seo_baslik", "seo_aciklama", "durum"],
    });

    const gonder = handleSubmit((veri) => {
        setSunucuHatasi(undefined);
        setKaydedildi(false);
        startTransition(async () => {
            const sonuc = await blogYazisiKaydet(yazi?.id ?? null, veri);
            if (sonuc?.hata) setSunucuHatasi(sonuc.hata);
            else setKaydedildi(true);
        });
    });

    return (
        <form onSubmit={gonder} className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-4 rounded-xl border bg-white p-5 shadow-sm lg:col-span-2">
                <Alan etiket="Başlık" htmlFor="baslik" hata={errors.baslik?.message} zorunlu>
                    <input
                        id="baslik"
                        autoFocus={!yazi}
                        aria-invalid={!!errors.baslik}
                        className={cn(inputSinifi, "text-lg font-semibold")}
                        {...register("baslik", {
                            onChange: (e) => slugOtomatik && setValue("slug", slugUret(e.target.value), { shouldValidate: !!slug }),
                        })}
                    />
                </Alan>
                <Alan etiket="Adres (slug)" htmlFor="slug" hata={errors.slug?.message} zorunlu>
                    <div className="flex items-center gap-1 text-sm">
                        <span className="shrink-0 text-gray-500">/blog/</span>
                        <input
                            id="slug"
                            aria-invalid={!!errors.slug}
                            className={cn(inputSinifi, "font-mono")}
                            {...register("slug", { onChange: () => setSlugOtomatik(false) })}
                        />
                    </div>
                    {yazi && slug !== yazi.slug && (
                        <p className="text-xs text-amber-700">Adres değişirse eski link çalışmaz; paylaşılmış bir yazıysa dikkat edin.</p>
                    )}
                </Alan>
                <Alan etiket="Özet" htmlFor="ozet" hata={errors.ozet?.message}>
                    <textarea
                        id="ozet"
                        rows={2}
                        placeholder="Blog listesinde başlığın altında görünür."
                        className={inputSinifi}
                        {...register("ozet")}
                    />
                    <Sayac deger={ozet} azami={300} />
                </Alan>
                <Alan etiket="İçerik" htmlFor="icerik" hata={errors.icerik?.message}>
                    <Controller
                        control={control}
                        name="icerik"
                        render={({ field }) => (
                            <ZenginEditor id="icerik" deger={field.value} onChange={field.onChange} gorselKlasoru="blog" />
                        )}
                    />
                </Alan>
            </div>

            <div className="space-y-4">
                <section className="space-y-4 rounded-xl border bg-white p-5 shadow-sm">
                    <Alan etiket="Durum" htmlFor="durum_taslak">
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(BLOG_DURUMLARI).map(([deger, { etiket }]) => (
                                <label
                                    key={deger}
                                    className="flex cursor-pointer items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition has-[:checked]:border-[var(--color-secondary)] has-[:checked]:bg-[var(--color-secondary)] has-[:checked]:text-white"
                                >
                                    <input type="radio" id={`durum_${deger}`} value={deger} className="sr-only" {...register("durum")} />
                                    {etiket}
                                </label>
                            ))}
                        </div>
                    </Alan>
                    <Alan etiket="Yayın tarihi" htmlFor="yayin_tarihi" hata={errors.yayin_tarihi?.message}>
                        <input id="yayin_tarihi" type="datetime-local" className={inputSinifi} {...register("yayin_tarihi")} />
                        <p className="text-xs text-gray-500">
                            {durum === "yayinda"
                                ? "Boşsa kaydettiğiniz an yayınlanır. İleri bir tarih verirseniz o zaman görünür."
                                : "Taslak yazılar sitede görünmez."}
                        </p>
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
                        <p className="text-xs text-gray-500">
                            <Link href="/admin/icerik/kategoriler" className="underline">
                                Kategorileri yönet
                            </Link>
                        </p>
                    </Alan>
                    <Alan etiket="Kapak görseli" htmlFor="kapak_gorsel_url" hata={errors.kapak_gorsel_url?.message}>
                        <Controller
                            control={control}
                            name="kapak_gorsel_url"
                            render={({ field }) => (
                                <GorselSecici id="kapak_gorsel_url" deger={field.value} onChange={field.onChange} klasor="blog" />
                            )}
                        />
                    </Alan>
                </section>

                <section className="space-y-4 rounded-xl border bg-white p-5 shadow-sm">
                    <h2 className="font-semibold text-[var(--color-secondary)]">SEO</h2>
                    <Alan etiket="SEO başlığı" htmlFor="seo_baslik" hata={errors.seo_baslik?.message}>
                        <input id="seo_baslik" placeholder={baslik} className={inputSinifi} {...register("seo_baslik")} />
                        <Sayac deger={seoBaslik} azami={70} oneri={60} />
                    </Alan>
                    <Alan etiket="SEO açıklaması" htmlFor="seo_aciklama" hata={errors.seo_aciklama?.message}>
                        <textarea id="seo_aciklama" rows={3} placeholder={ozet} className={inputSinifi} {...register("seo_aciklama")} />
                        <Sayac deger={seoAciklama} azami={160} oneri={155} />
                    </Alan>
                    {/* Google sonuç önizlemesi */}
                    <div className="rounded-md border bg-gray-50 p-3 text-sm">
                        <p className="truncate text-xs text-green-800">kasirgabilgisayar.com › blog › {slug || "..."}</p>
                        <p className="truncate text-[#1a0dab]">{seoBaslik || baslik || "Yazı başlığı"}</p>
                        <p className="line-clamp-2 text-xs text-gray-600">{seoAciklama || ozet || "Açıklama girilmedi."}</p>
                    </div>
                </section>

                <FormHatasi mesaj={sunucuHatasi} />
                {kaydedildi && (
                    <p role="status" className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
                        Kaydedildi.
                    </p>
                )}
                <div className="flex gap-2">
                    <Button type="submit" disabled={bekliyor} className={anaButonSinifi}>
                        {bekliyor ? <Loader2 className="animate-spin" /> : <Save />} Kaydet
                    </Button>
                    <Button type="button" variant="outline" asChild>
                        <Link href="/admin/icerik">Listeye dön</Link>
                    </Button>
                </div>
            </div>
        </form>
    );
}

function Sayac({ deger, azami, oneri }: { deger: string; azami: number; oneri?: number }) {
    const uzunluk = deger.trim().length;
    return (
        <p className={cn("text-right text-xs", uzunluk > (oneri ?? azami) ? "text-amber-700" : "text-gray-400")}>
            {uzunluk} / {oneri ?? azami}
        </p>
    );
}
