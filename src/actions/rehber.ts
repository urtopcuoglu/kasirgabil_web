// src/actions/rehber.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { rehberKategoriSemasi, rehberKisiSemasi, type RehberKisiGirdisi } from "@/lib/schemas/rehber";
import { bosIseNull, dbHataMesaji, OTURUM_HATASI, yetkiliIstemci } from "@/lib/supabase/yetkili";
import type { IslemSonucu } from "./personel";

// ─── Kişiler ────────────────────────────────────────────────

// id null ise yeni kayıt, değilse güncelleme.
export async function rehberKisiKaydet(id: string | null, girdi: RehberKisiGirdisi): Promise<IslemSonucu> {
    const sonuc = rehberKisiSemasi.safeParse(girdi);
    if (!sonuc.success) return { hata: sonuc.error.issues[0]?.message ?? "Geçersiz veri." };

    const supabase = await yetkiliIstemci();
    if (!supabase) return { hata: OTURUM_HATASI };

    const veri = bosIseNull(sonuc.data);
    const { error } = id
        ? await supabase.from("rehber_kisiler").update(veri).eq("id", id)
        : await supabase.from("rehber_kisiler").insert(veri);

    if (error) {
        // rehber_kisiler'deki tek unique kısıt telefon_1'in son 10 hanesidir.
        return {
            hata: error.code === "23505" ? "Bu telefon numarası rehberde başka bir kişiye kayıtlı." : dbHataMesaji(error),
        };
    }

    revalidatePath("/admin/rehber");
    redirect("/admin/rehber");
}

export async function rehberKisiSil(id: string): Promise<IslemSonucu> {
    const supabase = await yetkiliIstemci();
    if (!supabase) return { hata: OTURUM_HATASI };

    const { error } = await supabase.from("rehber_kisiler").delete().eq("id", id);
    if (error) return { hata: dbHataMesaji(error) };

    revalidatePath("/admin/rehber");
}

// ─── Kategoriler ────────────────────────────────────────────

export async function rehberKategoriKaydet(id: string | null, ad: string): Promise<IslemSonucu> {
    const sonuc = rehberKategoriSemasi.safeParse({ ad });
    if (!sonuc.success) return { hata: sonuc.error.issues[0]?.message ?? "Geçersiz veri." };

    const supabase = await yetkiliIstemci();
    if (!supabase) return { hata: OTURUM_HATASI };

    const { error } = id
        ? await supabase.from("rehber_kategorileri").update(sonuc.data).eq("id", id)
        : await supabase.from("rehber_kategorileri").insert(sonuc.data);

    if (error) {
        return { hata: error.code === "23505" ? "Bu isimde bir kategori zaten var." : dbHataMesaji(error) };
    }

    revalidatePath("/admin/rehber", "layout");
}

export async function rehberKategoriSil(id: string): Promise<IslemSonucu> {
    const supabase = await yetkiliIstemci();
    if (!supabase) return { hata: OTURUM_HATASI };

    // Kategorideki kişiler silinmez; kategorileri boşaltılır (on delete set null).
    const { error } = await supabase.from("rehber_kategorileri").delete().eq("id", id);
    if (error) return { hata: dbHataMesaji(error) };

    revalidatePath("/admin/rehber", "layout");
}
