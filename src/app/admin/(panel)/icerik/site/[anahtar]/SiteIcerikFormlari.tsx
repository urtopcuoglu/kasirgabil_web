// src/app/admin/(panel)/icerik/site/[anahtar]/SiteIcerikFormlari.tsx
// Site içeriklerinin düzenleme formları (her içerik anahtarı için bir form).
"use client";

import { useState, useTransition } from "react";
import { Controller, useFieldArray, useForm, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowUp, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { siteIcerigiKaydet } from "@/actions/icerik";
import {
    bankaHesaplariSemasi,
    hakkimizdaSemasi,
    iletisimSemasi,
    sliderSemasi,
    yasalSayfaSemasi,
    type BankaHesaplari,
    type Hakkimizda,
    type Iletisim,
    type SiteIcerikAnahtari,
    type Slider,
    type YasalSayfa,
} from "@/lib/schemas/icerik";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Alan, anaButonSinifi, FormHatasi, inputSinifi } from "../../../../_components/form";
import GorselSecici from "../../../../_components/icerik/GorselSecici";
import ZenginEditor from "../../../../_components/icerik/ZenginEditor";

// ─── Ortak kaydetme ve alt çubuk ────────────────────────────

function useKaydet<T extends FieldValues>(anahtar: SiteIcerikAnahtari) {
    const [hata, setHata] = useState<string>();
    const [kaydedildi, setKaydedildi] = useState(false);
    const [bekliyor, startTransition] = useTransition();

    const kaydet = (veri: T) => {
        setHata(undefined);
        setKaydedildi(false);
        startTransition(async () => {
            const sonuc = await siteIcerigiKaydet(anahtar, veri);
            if (sonuc?.hata) setHata(sonuc.hata);
            else setKaydedildi(true);
        });
    };

    return { kaydet, hata, kaydedildi, bekliyor };
}

function KaydetCubugu({ hata, kaydedildi, bekliyor }: { hata?: string; kaydedildi: boolean; bekliyor: boolean }) {
    return (
        <div className="space-y-3">
            <FormHatasi mesaj={hata} />
            {kaydedildi && (
                <p role="status" className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
                    Kaydedildi. Sitede hemen güncellenir.
                </p>
            )}
            <Button type="submit" disabled={bekliyor} className={anaButonSinifi}>
                {bekliyor ? <Loader2 className="animate-spin" /> : <Save />} Kaydet
            </Button>
        </div>
    );
}

const kartSinifi = "space-y-4 rounded-xl border bg-white p-5 shadow-sm sm:p-6";

// Liste satırlarında yukarı / aşağı / sil düğmeleri.
function SiraDugmeleri({ i, toplam, tasi, sil }: { i: number; toplam: number; tasi: (a: number, b: number) => void; sil: () => void }) {
    return (
        <div className="flex gap-1">
            <Button type="button" variant="ghost" size="icon" disabled={i === 0} onClick={() => tasi(i, i - 1)} title="Yukarı taşı">
                <ArrowUp />
            </Button>
            <Button type="button" variant="ghost" size="icon" disabled={i === toplam - 1} onClick={() => tasi(i, i + 1)} title="Aşağı taşı">
                <ArrowDown />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={sil} title="Kaldır">
                <Trash2 />
            </Button>
        </div>
    );
}

// ─── İletişim ───────────────────────────────────────────────

export function IletisimFormu({ deger }: { deger: Iletisim }) {
    const { kaydet, ...durum } = useKaydet<Iletisim>("iletisim");
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<Iletisim>({ resolver: zodResolver(iletisimSemasi), defaultValues: deger });

    return (
        <form onSubmit={handleSubmit(kaydet)} className={cn(kartSinifi, "max-w-3xl")}>
            <Alan etiket="Telefonlar" htmlFor="telefon_0" hata={errors.telefonlar?.message ?? errors.telefonlar?.root?.message}>
                <Controller
                    control={control}
                    name="telefonlar"
                    render={({ field, fieldState }) => (
                        <div className="space-y-2">
                            {field.value.map((tel, i) => (
                                <div key={i} className="flex gap-2">
                                    <input
                                        id={`telefon_${i}`}
                                        value={tel}
                                        onChange={(e) => field.onChange(field.value.map((t, j) => (j === i ? e.target.value : t)))}
                                        placeholder="0 (312) 123 45 67"
                                        aria-invalid={!!fieldState.error}
                                        className={inputSinifi}
                                    />
                                    <SiraDugmeleri
                                        i={i}
                                        toplam={field.value.length}
                                        tasi={(a, b) => {
                                            const yeni = [...field.value];
                                            [yeni[a], yeni[b]] = [yeni[b], yeni[a]];
                                            field.onChange(yeni);
                                        }}
                                        sil={() => field.onChange(field.value.filter((_, j) => j !== i))}
                                    />
                                </div>
                            ))}
                            {Array.isArray(errors.telefonlar) &&
                                errors.telefonlar.map((e, i) => e && <p key={i} className="text-xs text-[var(--color-primary)]">{i + 1}. telefon: {e.message}</p>)}
                            {field.value.length < 5 && (
                                <Button type="button" variant="outline" size="sm" onClick={() => field.onChange([...field.value, ""])}>
                                    <Plus /> Telefon ekle
                                </Button>
                            )}
                            <p className="text-xs text-gray-500">İlk sıradaki numara header&apos;da öne çıkar.</p>
                        </div>
                    )}
                />
            </Alan>
            <div className="grid gap-4 sm:grid-cols-2">
                <Alan etiket="WhatsApp numarası" htmlFor="whatsapp" hata={errors.whatsapp?.message}>
                    <input id="whatsapp" inputMode="numeric" placeholder="905051234567" className={inputSinifi} {...register("whatsapp")} />
                </Alan>
                <Alan etiket="E-posta" htmlFor="eposta" hata={errors.eposta?.message}>
                    <input id="eposta" type="email" className={inputSinifi} {...register("eposta")} />
                </Alan>
            </div>
            <Alan etiket="Adres" htmlFor="adres" hata={errors.adres?.message}>
                <textarea id="adres" rows={2} className={inputSinifi} {...register("adres")} />
            </Alan>
            <Alan etiket="Google Haritalar yerleştirme adresi" htmlFor="harita_url" hata={errors.harita_url?.message}>
                <input id="harita_url" placeholder="https://www.google.com/maps/embed?pb=..." className={cn(inputSinifi, "font-mono text-xs")} {...register("harita_url")} />
            </Alan>
            <div className="grid gap-4 sm:grid-cols-3">
                <Alan etiket="Instagram" htmlFor="instagram" hata={errors.instagram?.message}>
                    <input id="instagram" className={inputSinifi} {...register("instagram")} />
                </Alan>
                <Alan etiket="LinkedIn" htmlFor="linkedin" hata={errors.linkedin?.message}>
                    <input id="linkedin" className={inputSinifi} {...register("linkedin")} />
                </Alan>
                <Alan etiket="Sahibinden mağazası" htmlFor="sahibinden" hata={errors.sahibinden?.message}>
                    <input id="sahibinden" className={inputSinifi} {...register("sahibinden")} />
                </Alan>
            </div>
            <KaydetCubugu {...durum} />
        </form>
    );
}

// ─── Banka hesapları ────────────────────────────────────────

export function BankaHesaplariFormu({ deger }: { deger: BankaHesaplari }) {
    const { kaydet, ...durum } = useKaydet<BankaHesaplari>("banka_hesaplari");
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<BankaHesaplari>({ resolver: zodResolver(bankaHesaplariSemasi), defaultValues: deger });
    const { fields, append, remove, move } = useFieldArray({ control, name: "hesaplar" });

    return (
        <form onSubmit={handleSubmit(kaydet)} className="max-w-4xl space-y-4">
            {fields.map((f, i) => {
                const h = errors.hesaplar?.[i];
                return (
                    <div key={f.id} className={cn(kartSinifi, "grid gap-4 sm:grid-cols-[180px_1fr]")}>
                        <Alan etiket="Banka logosu" htmlFor={`logo_${i}`} hata={h?.logo?.message}>
                            <Controller
                                control={control}
                                name={`hesaplar.${i}.logo`}
                                render={({ field }) => (
                                    <GorselSecici id={`logo_${i}`} deger={field.value} onChange={field.onChange} klasor="banka" oran="aspect-[3/2]" />
                                )}
                            />
                        </Alan>
                        <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                                <p className="font-semibold text-[var(--color-secondary)]">{i + 1}. hesap</p>
                                <SiraDugmeleri i={i} toplam={fields.length} tasi={move} sil={() => remove(i)} />
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <Alan etiket="Hesap adı" htmlFor={`hesap_adi_${i}`} hata={h?.hesap_adi?.message} zorunlu>
                                    <input id={`hesap_adi_${i}`} className={inputSinifi} {...register(`hesaplar.${i}.hesap_adi`)} />
                                </Alan>
                                <Alan etiket="Şube" htmlFor={`sube_${i}`} hata={h?.sube?.message}>
                                    <input id={`sube_${i}`} className={inputSinifi} {...register(`hesaplar.${i}.sube`)} />
                                </Alan>
                                <Alan etiket="Hesap no" htmlFor={`hesap_no_${i}`} hata={h?.hesap_no?.message}>
                                    <input id={`hesap_no_${i}`} className={inputSinifi} {...register(`hesaplar.${i}.hesap_no`)} />
                                </Alan>
                                <Alan etiket="IBAN" htmlFor={`iban_${i}`} hata={h?.iban?.message} zorunlu>
                                    <input id={`iban_${i}`} className={cn(inputSinifi, "font-mono")} {...register(`hesaplar.${i}.iban`)} />
                                </Alan>
                            </div>
                        </div>
                    </div>
                );
            })}
            <Button type="button" variant="outline" onClick={() => append({ logo: "", hesap_adi: "", sube: "", hesap_no: "", iban: "" })}>
                <Plus /> Hesap ekle
            </Button>
            <KaydetCubugu {...durum} />
        </form>
    );
}

// ─── Hakkımızda ─────────────────────────────────────────────

export function HakkimizdaFormu({ deger }: { deger: Hakkimizda }) {
    const { kaydet, ...durum } = useKaydet<Hakkimizda>("hakkimizda");
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<Hakkimizda>({ resolver: zodResolver(hakkimizdaSemasi), defaultValues: deger });

    return (
        <form onSubmit={handleSubmit(kaydet)} className={cn(kartSinifi, "max-w-4xl")}>
            <div className="grid gap-4 md:grid-cols-[1fr_260px]">
                <Alan etiket="Biz Kimiz?" htmlFor="biz_kimiz" hata={errors.biz_kimiz?.message}>
                    <Controller
                        control={control}
                        name="biz_kimiz"
                        render={({ field }) => <ZenginEditor id="biz_kimiz" deger={field.value} onChange={field.onChange} kucuk />}
                    />
                </Alan>
                <Alan etiket="Görsel" htmlFor="gorsel" hata={errors.gorsel?.message}>
                    <Controller
                        control={control}
                        name="gorsel"
                        render={({ field }) => <GorselSecici id="gorsel" deger={field.value} onChange={field.onChange} klasor="hakkimizda" />}
                    />
                </Alan>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <Alan etiket="Misyonumuz" htmlFor="misyon" hata={errors.misyon?.message}>
                    <textarea id="misyon" rows={5} className={inputSinifi} {...register("misyon")} />
                </Alan>
                <Alan etiket="Vizyonumuz" htmlFor="vizyon" hata={errors.vizyon?.message}>
                    <textarea id="vizyon" rows={5} className={inputSinifi} {...register("vizyon")} />
                </Alan>
            </div>
            <KaydetCubugu {...durum} />
        </form>
    );
}

// ─── Anasayfa slider ────────────────────────────────────────

export function SliderFormu({ deger }: { deger: Slider }) {
    const { kaydet, ...durum } = useKaydet<Slider>("anasayfa_slider");
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<Slider>({ resolver: zodResolver(sliderSemasi), defaultValues: deger });
    const { fields, append, remove, move } = useFieldArray({ control, name: "slaytlar" });

    return (
        <form onSubmit={handleSubmit(kaydet)} className="max-w-4xl space-y-4">
            <p className="text-sm text-gray-500">Önerilen görsel boyutu: 1920 × 500 piksel (geniş ve kısa). Sıra, sitedeki gösterim sırasıdır.</p>
            {fields.map((f, i) => {
                const s = errors.slaytlar?.[i];
                return (
                    <div key={f.id} className={cn(kartSinifi, "grid gap-4 md:grid-cols-[320px_1fr]")}>
                        <Controller
                            control={control}
                            name={`slaytlar.${i}.gorsel`}
                            render={({ field }) => (
                                <div>
                                    <GorselSecici id={`slayt_${i}`} deger={field.value} onChange={field.onChange} klasor="slider" oran="aspect-[1920/500]" />
                                    {s?.gorsel && <p className="mt-1 text-xs text-[var(--color-primary)]">{s.gorsel.message}</p>}
                                </div>
                            )}
                        />
                        <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                                <p className="font-semibold text-[var(--color-secondary)]">{i + 1}. slayt</p>
                                <SiraDugmeleri i={i} toplam={fields.length} tasi={move} sil={() => remove(i)} />
                            </div>
                            <Alan etiket="Görsel açıklaması" htmlFor={`aciklama_${i}`} hata={s?.aciklama?.message}>
                                <input
                                    id={`aciklama_${i}`}
                                    placeholder="Görme engelliler ve arama motorları için (örn. Notebook tamiri)"
                                    className={inputSinifi}
                                    {...register(`slaytlar.${i}.aciklama`)}
                                />
                            </Alan>
                            <Alan etiket="Tıklanınca gidilecek adres (opsiyonel)" htmlFor={`link_${i}`} hata={s?.link?.message}>
                                <input id={`link_${i}`} placeholder="/services/tamir-ve-bakim" className={inputSinifi} {...register(`slaytlar.${i}.link`)} />
                            </Alan>
                        </div>
                    </div>
                );
            })}
            {errors.slaytlar?.root && <FormHatasi mesaj={errors.slaytlar.root.message} />}
            {errors.slaytlar?.message && <FormHatasi mesaj={errors.slaytlar.message} />}
            {fields.length < 10 && (
                <Button type="button" variant="outline" onClick={() => append({ gorsel: "", aciklama: "", link: "" })}>
                    <Plus /> Slayt ekle
                </Button>
            )}
            <KaydetCubugu {...durum} />
        </form>
    );
}

// ─── Yasal sayfalar ─────────────────────────────────────────

export function YasalSayfaFormu({ anahtar, deger }: { anahtar: SiteIcerikAnahtari; deger: YasalSayfa }) {
    const { kaydet, ...durum } = useKaydet<YasalSayfa>(anahtar);
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<YasalSayfa>({ resolver: zodResolver(yasalSayfaSemasi), defaultValues: deger });

    return (
        <form onSubmit={handleSubmit(kaydet)} className={cn(kartSinifi, "max-w-4xl")}>
            <Alan etiket="Sayfa başlığı" htmlFor="baslik" hata={errors.baslik?.message} zorunlu>
                <input id="baslik" className={inputSinifi} {...register("baslik")} />
            </Alan>
            <Alan etiket="Metin" htmlFor="icerik" hata={errors.icerik?.message}>
                <Controller
                    control={control}
                    name="icerik"
                    render={({ field }) => <ZenginEditor id="icerik" deger={field.value} onChange={field.onChange} />}
                />
                <p className="text-xs text-gray-500">Metnin başındaki &ldquo;Son güncelleme&rdquo; tarihini değiştirmeyi unutmayın.</p>
            </Alan>
            <KaydetCubugu {...durum} />
        </form>
    );
}
