// src/actions/personel.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { personelSemasi, type PersonelGirdisi } from "@/lib/schemas/personel";
import { bosIseNull, dbHataMesaji, izinliIstemci, oturum } from "@/lib/supabase/yetkili";

export type IslemSonucu = { hata: string } | undefined;

// id null ise yeni kayıt, değilse güncelleme.
export async function personelKaydet(id: string | null, girdi: PersonelGirdisi): Promise<IslemSonucu> {
    const sonuc = personelSemasi.safeParse(girdi);
    if (!sonuc.success) return { hata: sonuc.error.issues[0]?.message ?? "Geçersiz veri." };

    const yetki = await izinliIstemci("personel");
    if ("hata" in yetki) return yetki;
    const { supabase } = yetki;

    // Yönetici kendi rolünü düşürür ya da kaydını pasif yaparsa panele erişimini kaybeder.
    if (id && id === (await oturum())?.personelId && (sonuc.data.rol !== "yonetici" || !sonuc.data.aktif)) {
        return { hata: "Kendi rolünüzü değiştiremez veya kaydınızı pasif yapamazsınız." };
    }

    const veri = bosIseNull(sonuc.data);
    const { error } = id
        ? await supabase.from("personel").update(veri).eq("id", id)
        : await supabase.from("personel").insert(veri);

    if (error) return { hata: dbHataMesaji(error) };

    revalidatePath("/admin/personel");
    redirect("/admin/personel");
}

export async function personelSil(id: string): Promise<IslemSonucu> {
    const yetki = await izinliIstemci("personel");
    if ("hata" in yetki) return yetki;
    const { supabase } = yetki;
    if (id === (await oturum())?.personelId) return { hata: "Kendi personel kaydınızı silemezsiniz." };

    const { error } = await supabase.from("personel").delete().eq("id", id);
    if (error) {
        return {
            hata:
                error.code === "23503"
                    ? "Bu personel başka kayıtlarda kullanılıyor. Silmek yerine pasif yapabilirsiniz."
                    : dbHataMesaji(error),
        };
    }

    revalidatePath("/admin/personel");
}
