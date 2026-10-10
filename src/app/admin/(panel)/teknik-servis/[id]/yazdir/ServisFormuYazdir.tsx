// src/app/admin/(panel)/teknik-servis/[id]/yazdir/ServisFormuYazdir.tsx
// A5 yatay teknik servis formu. Arıza/işlem tablosu ücret kalemlerinden otomatik dolar;
// hücreler yazdırmadan önce elle değiştirilebilir (kaydedilmez) ve boş satırlara kalemle yazılabilir.
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Info, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { A5Sayfa } from "../../../../_components/A5";
import { YazdirButonu } from "../../../../_components/Yazdir";

type FormVerisi = {
    form_no: string;
    musteri_ad_soyad: string;
    musteri_telefon: string;
    cihaz_marka_model: string;
    seri_no: string | null;
    sikayet: string;
    giris_tarihi: string;
    teslim_alan: string;
};

type Props = {
    servisId: string;
    veri: FormVerisi;
    kalemler: { aciklama: string; tutar: number }[];
};

type Satir = { aciklama: string; fiyat: string };

const EN_AZ_SATIR = 6;

// "1250" / "1.250,50" / "1250.5" gibi elle yazılmış tutarları sayıya çevirir.
function tutarOku(metin: string): number {
    const temiz = metin.replace(/[^\d.,]/g, "");
    if (!temiz) return 0;
    const normal = temiz.includes(",") ? temiz.replace(/\./g, "").replace(",", ".") : temiz;
    const sayi = Number(normal);
    return Number.isFinite(sayi) ? sayi : 0;
}

const tutarYaz = (n: number) => n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function baslangicSatirlari(kalemler: Props["kalemler"]): Satir[] {
    const satirlar = kalemler.map((k) => ({ aciklama: k.aciklama, fiyat: tutarYaz(k.tutar) }));
    while (satirlar.length < EN_AZ_SATIR) satirlar.push({ aciklama: "", fiyat: "" });
    return satirlar;
}

export default function ServisFormuYazdir({ servisId, veri, kalemler }: Props) {
    const [satirlar, setSatirlar] = useState<Satir[]>(() => baslangicSatirlari(kalemler));
    const [fiyatlarBos, setFiyatlarBos] = useState(false);

    const guncelle = (i: number, alan: keyof Satir, deger: string) =>
        setSatirlar((onceki) => onceki.map((s, j) => (j === i ? { ...s, [alan]: deger } : s)));

    const toplam = satirlar.reduce((t, s) => t + tutarOku(s.fiyat), 0);
    const toplamVar = satirlar.some((s) => s.fiyat.trim() !== "");

    return (
        <div>
            {/* Araç çubuğu (çıktıda görünmez) */}
            <div className="mb-4 space-y-3 print:hidden">
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href={`/admin/teknik-servis/${servisId}`}>
                            <ArrowLeft /> Servis Kaydı
                        </Link>
                    </Button>
                    <Button variant="outline" onClick={() => setSatirlar((s) => [...s, { aciklama: "", fiyat: "" }])}>
                        <Plus /> Satır Ekle
                    </Button>
                    <label className="flex cursor-pointer items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm">
                        <input type="checkbox" checked={fiyatlarBos} onChange={(e) => setFiyatlarBos(e.target.checked)} />
                        Fiyatları boş bırak (elle yazılacak)
                    </label>
                    <div className="ml-auto">
                        <YazdirButonu />
                    </div>
                </div>
                <p className="flex items-start gap-2 text-xs text-gray-500">
                    <Info className="mt-0.5 size-3.5 shrink-0" />
                    Tablo, servis kaydının ücret kalemleriyle otomatik doldu. Hücrelere tıklayıp yazdırmadan önce değiştirebilirsiniz;
                    buradaki değişiklikler kayda işlenmez. Kalıcı fiyat için servis kaydındaki ücret kalemlerini kullanın.
                </p>
            </div>

            <div className="overflow-x-auto rounded-xl bg-gray-200 p-4 print:overflow-visible print:rounded-none print:bg-white print:p-0">
                <A5Sayfa>
                    {/* Başlık */}
                    <div className="flex items-center gap-[5mm] border-b-2 border-[var(--color-secondary)] pb-[3mm]">
                        <Image src="/logo/logo.png" alt="Kasırga Bilgisayar" width={150} height={50} loading="eager" className="h-[12mm] w-auto" />
                        <div className="flex-1">
                            <p className="text-[13pt] font-bold tracking-wide text-[var(--color-secondary)]">TEKNİK SERVİS FORMU</p>
                            <p className="text-[8pt] text-gray-600">Kasırga Bilgisayar · 0505 387 79 39</p>
                        </div>
                        <div className="rounded-md border-2 border-[var(--color-primary)] px-[4mm] py-[1.5mm] text-center">
                            <p className="text-[7pt] font-semibold uppercase tracking-wider text-gray-600">Form No</p>
                            <p className="text-[16pt] font-bold leading-tight text-[var(--color-primary)]">{veri.form_no}</p>
                        </div>
                    </div>

                    {/* Bilgi kutuları */}
                    <div className="mt-[3mm] grid grid-cols-3 gap-[3mm] text-[8.5pt]">
                        <Kutu baslik="MÜŞTERİ">
                            <Bilgi etiket="Ad Soyad" deger={veri.musteri_ad_soyad} kalin />
                            <Bilgi etiket="Telefon" deger={veri.musteri_telefon} kalin />
                        </Kutu>
                        <Kutu baslik="CİHAZ">
                            <Bilgi etiket="Marka / Model" deger={veri.cihaz_marka_model} kalin />
                            <Bilgi etiket="Seri No" deger={veri.seri_no ?? "—"} />
                        </Kutu>
                        <Kutu baslik="KAYIT">
                            <Bilgi etiket="Alınma Tarihi" deger={veri.giris_tarihi} />
                            <Bilgi etiket="Teslim Alan" deger={veri.teslim_alan || "—"} />
                        </Kutu>
                    </div>

                    {/* Müşteri şikayeti */}
                    <div className="mt-[3mm] rounded-md border border-gray-400 px-[3mm] py-[1.5mm] text-[8.5pt]">
                        <span className="mr-[2mm] text-[7pt] font-semibold uppercase text-gray-500">Müşteri Şikayeti:</span>
                        <span className="line-clamp-2 inline">{veri.sikayet}</span>
                    </div>

                    {/* Arıza / işlem tablosu */}
                    <div className="mt-[3mm] min-h-0 flex-1 overflow-hidden">
                        <table className="w-full border-collapse text-[9pt]">
                            <thead>
                                <tr className="bg-[var(--color-secondary)] text-left text-[8pt] text-white">
                                    <th className="w-[8mm] border border-[var(--color-secondary)] px-[2mm] py-[1.2mm] text-center">#</th>
                                    <th className="border border-[var(--color-secondary)] px-[2mm] py-[1.2mm]">ARIZA / YAPILAN İŞLEM</th>
                                    <th className="w-[34mm] border border-[var(--color-secondary)] px-[2mm] py-[1.2mm] text-right">FİYAT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {satirlar.map((s, i) => (
                                    <tr key={i} className="h-[6.5mm]">
                                        <td className="border border-gray-400 text-center text-[8pt] text-gray-500">{i + 1}</td>
                                        <td className="border border-gray-400 px-[1mm]">
                                            <HucreGirdisi
                                                deger={s.aciklama}
                                                degisti={(v) => guncelle(i, "aciklama", v)}
                                                etiket={`${i + 1}. satır açıklama`}
                                            />
                                        </td>
                                        <td className="border border-gray-400 px-[1mm]">
                                            {!fiyatlarBos && (
                                                <div className="flex items-center justify-end">
                                                    <HucreGirdisi
                                                        deger={s.fiyat}
                                                        degisti={(v) => guncelle(i, "fiyat", v)}
                                                        etiket={`${i + 1}. satır fiyat`}
                                                        sag
                                                    />
                                                    {s.fiyat.trim() && <span className="ml-[1mm]">₺</span>}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="h-[7mm] font-bold">
                                    <td colSpan={2} className="border border-gray-400 px-[2mm] text-right text-[8pt] uppercase">
                                        Toplam
                                    </td>
                                    <td className="border-2 border-black px-[2mm] text-right text-[10pt]">
                                        {!fiyatlarBos && toplamVar ? `${tutarYaz(toplam)} ₺` : ""}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* İmzalar */}
                    <div className="mt-[3mm] grid grid-cols-2 gap-[10mm] text-[7.5pt]">
                        <div className="border-t border-gray-500 pt-[1mm] text-center text-gray-600">Cihazı Teslim Eden (Müşteri) · İmza</div>
                        <div className="border-t border-gray-500 pt-[1mm] text-center text-gray-600">Teslim Alan (Kasırga Bilgisayar) · İmza</div>
                    </div>
                    <p className="mt-[1.5mm] text-center text-[6.5pt] text-gray-500">
                        Cihazınızın durumunu web sitemizdeki Teknik Servis Sorgulama sayfasından form numaranız ve telefon numaranızla takip edebilirsiniz.
                    </p>
                </A5Sayfa>
            </div>
        </div>
    );
}

function Kutu({ baslik, children }: { baslik: string; children: React.ReactNode }) {
    return (
        <section className="rounded-md border border-gray-400">
            <h2 className="bg-gray-100 px-[2mm] py-[0.8mm] text-[7pt] font-bold tracking-wider text-[var(--color-secondary)]">{baslik}</h2>
            <dl className="space-y-[0.8mm] px-[2mm] py-[1.5mm]">{children}</dl>
        </section>
    );
}

function Bilgi({ etiket, deger, kalin }: { etiket: string; deger: string; kalin?: boolean }) {
    return (
        <div>
            <dt className="text-[6.5pt] uppercase text-gray-500">{etiket}</dt>
            <dd className={cn("truncate", kalin && "font-bold")}>{deger}</dd>
        </div>
    );
}

// Ekranda düzenlenebilir, çıktıda düz metin gibi görünen hücre girdisi.
function HucreGirdisi({ deger, degisti, etiket, sag }: { deger: string; degisti: (v: string) => void; etiket: string; sag?: boolean }) {
    return (
        <input
            value={deger}
            onChange={(e) => degisti(e.target.value)}
            aria-label={etiket}
            inputMode={sag ? "decimal" : undefined}
            className={cn(
                "w-full bg-transparent px-[1mm] py-[0.5mm] outline-none hover:bg-blue-50 focus:bg-blue-50 print:hover:bg-transparent",
                sag && "text-right"
            )}
        />
    );
}
