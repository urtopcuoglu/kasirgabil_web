// src/actions/personel.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { personelSemasi, type PersonelGirdisi } from "@/lib/schemas/personel";
import { bosIseNull, dbHataMesaji, OTURUM_HATASI, yetkiliIstemci } from "@/lib/supabase/yetkili";

export type IslemSonucu = { hata: string } | undefined;

// id null ise yeni kayıt, değilse güncelleme.
export async function personelKaydet(id: string | null, girdi: PersonelGirdisi): Promise<IslemSonucu> {
    const sonuc = personelSemasi.safeParse(girdi);
    if (!sonuc.success) return { hata: sonuc.error.issues[0]?.message ?? "Geçersiz veri." };

    const supabase = await yetkiliIstemci();
    if (!supabase) return { hata: OTURUM_HATASI };

    const veri = bosIseNull(sonuc.data);
    const { error } = id
        ? await supabase.from("personel").update(veri).eq("id", id)
        : await supabase.from("personel").insert(veri);

    if (error) return { hata: dbHataMesaji(error) };

    revalidatePath("/admin/personel");
    redirect("/admin/personel");
}

export async function personelSil(id: string): Promise<IslemSonucu> {
    const supabase = await yetkiliIstemci();
    if (!supabase) return { hata: OTURUM_HATASI };

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
