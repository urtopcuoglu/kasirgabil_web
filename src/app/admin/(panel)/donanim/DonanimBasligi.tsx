// src/app/admin/(panel)/donanim/DonanimBasligi.tsx
// Donanım Puanları sayfalarının ortak başlığı: son güncelleme bilgisi, "Şimdi Güncelle" ve sekmeler.
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { izinVar } from "@/lib/izinler";
import { createClient } from "@/lib/supabase/server";
import { oturum } from "@/lib/supabase/yetkili";
import { tarihSaatYaz } from "@/lib/tarih";
import { SayfaBasligi } from "../../_components/form";
import Sekmeler from "../../_components/Sekmeler";
import GuncelleButonu from "./GuncelleButonu";

const SEKMELER = [
    { href: "/admin/donanim", etiket: "Tüm Parçalar" },
    { href: "/admin/donanim/takip", etiket: "Takip Listesi" },
    { href: "/admin/donanim/stok", etiket: "Stoktaki Parçalar" },
] as const;

export type DonanimSekmesi = (typeof SEKMELER)[number]["href"];

export default async function DonanimBasligi({ aktif }: { aktif: DonanimSekmesi }) {
    const supabase = await createClient();
    const [o, { data: son }, { count }] = await Promise.all([
        oturum(),
        supabase.from("donanim_guncellemeleri").select("tarih, basarili, kaynak, hata").order("tarih", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("donanim_puanlari").select("id", { count: "exact", head: true }),
    ]);

    return (
        <>
            <SayfaBasligi
                baslik="Donanım Puanları"
                aciklama="UserBenchmark'ın geliştiricilere sunduğu resmi veriler (CPU, GPU, SSD, HDD, RAM, USB). Her pazartesi otomatik güncellenir."
            >
                {izinVar(o?.rol, "donanim") && <GuncelleButonu />}
            </SayfaBasligi>

            <p className="-mt-4 mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                {son ? (
                    <span className={son.basarili ? "flex items-center gap-1" : "flex items-center gap-1 text-[var(--color-primary)]"}>
                        {son.basarili ? <CheckCircle2 className="size-3.5 text-green-600" /> : <AlertTriangle className="size-3.5" />}
                        Son güncelleme: {tarihSaatYaz(son.tarih)} ({son.kaynak === "elle" ? "elle" : "otomatik"}
                        {son.basarili ? "" : `, hatalı: ${son.hata ?? "bilinmeyen hata"}`})
                    </span>
                ) : (
                    <span>Henüz güncelleme yapılmadı.</span>
                )}
                <span>· {(count ?? 0).toLocaleString("tr-TR")} parça</span>
                <span>
                    · Kaynak:{" "}
                    <a href="https://www.userbenchmark.com/page/developer" target="_blank" rel="noopener noreferrer" className="underline">
                        UserBenchmark
                    </a>
                </span>
            </p>

            <Sekmeler etiket="Donanım bölümleri" sekmeler={SEKMELER} aktif={aktif} />
        </>
    );
}
