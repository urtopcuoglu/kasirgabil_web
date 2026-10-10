// src/actions/servis-sorgula.ts
// Vitrindeki teknik servis sorgulama ekranı için. Giriş gerektirmez (anonim ziyaretçi).
"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ServisSorguSonucu } from "@/lib/schemas/servis";

const sorguSemasi = z.object({
    formNo: z.string().trim().min(1, { error: "Form numarasını girin." }).max(30),
    telefon: z
        .string()
        .trim()
        .refine((v) => v.replace(/\D/g, "").length >= 10, { error: "Telefon numaranızı eksiksiz girin." }),
});

export type SorguSonucu = { kayit: ServisSorguSonucu | null } | { hata: string };

export async function servisSorgula(formNo: string, telefon: string): Promise<SorguSonucu> {
    const sonuc = sorguSemasi.safeParse({ formNo, telefon });
    if (!sonuc.success) return { hata: sonuc.error.issues[0]?.message ?? "Geçersiz bilgi." };

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("servis_sorgula", {
        p_form_no: sonuc.data.formNo,
        p_telefon: sonuc.data.telefon,
    });

    if (error) {
        console.error("[servis_sorgula]", error.code, error.message);
        return { hata: "Sorgulama şu anda yapılamıyor. Lütfen daha sonra tekrar deneyin." };
    }

    const kayitlar = (data ?? []) as ServisSorguSonucu[];
    return { kayit: kayitlar[0] ?? null };
}
