// src/lib/supabase/yetkili.ts
// Oturum, rol ve yetki kontrolleri (sunucu tarafı).
// RLS zaten yetkisiz işlemleri engeller; buradaki kontroller kullanıcıya anlaşılır mesaj vermek ve
// RLS'in sessizce 0 satır güncellediği durumları önlemek içindir.
import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { izinVar, YETKI_HATASI, type Izin } from "@/lib/izinler";
import type { Rol } from "@/lib/schemas/personel";
import { createClient } from "./server";

export const OTURUM_HATASI = "Oturumunuz sona ermiş. Lütfen tekrar giriş yapın.";

export type Oturum = {
    kullaniciId: string;
    email: string;
    personelId: string | null;
    ad: string | null;
    rol: Rol | null; // aktif personele bağlı değilse null → panelde hiçbir veriye erişemez
    sifreDegismeli: boolean;
};

// İstek başına bir kez okunur (layout, sayfa ve action aynı sonucu kullanır).
export const oturum = cache(async (): Promise<Oturum | null> => {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const claims = data?.claims;
    if (!claims) return null;

    const { data: personel } = await supabase
        .from("personel")
        .select("id, ad_soyad, rol")
        .eq("auth_user_id", claims.sub)
        .eq("aktif", true)
        .maybeSingle();

    return {
        kullaniciId: claims.sub,
        email: typeof claims.email === "string" ? claims.email : "",
        personelId: personel?.id ?? null,
        ad: personel?.ad_soyad ?? null,
        rol: (personel?.rol as Rol | undefined) ?? null,
        sifreDegismeli: (claims.user_metadata as { sifre_degismeli?: boolean } | undefined)?.sifre_degismeli === true,
    };
});

// Server Action'larda: oturum yoksa null döner (rol gerektirmeyen işlemler için).
export async function yetkiliIstemci() {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    return data?.claims ? supabase : null;
}

// Server Action'larda: oturum ve izin varsa istemciyi, yoksa kullanıcıya gösterilecek hatayı döndürür.
export async function izinliIstemci(izin: Izin): Promise<{ hata: string } | { supabase: SupabaseClient }> {
    const o = await oturum();
    if (!o) return { hata: OTURUM_HATASI };
    if (!izinVar(o.rol, izin)) return { hata: YETKI_HATASI };
    return { supabase: await createClient() };
}

// Sayfa / layout koruması: izni olmayan özet sayfasına yönlendirilir.
export async function izinGerekli(izin: Izin) {
    const o = await oturum();
    if (!izinVar(o?.rol, izin)) redirect("/admin?yetkisiz=1");
    return o!;
}

type DbHatasi = { code?: string; message: string };

// Postgres/PostgREST hata kodlarını kullanıcıya gösterilecek Türkçe mesaja çevirir.
export function dbHataMesaji(error: DbHatasi): string {
    console.error("[db]", error.code, error.message);

    switch (error.code) {
        case "23505":
            return "Bu bilgilerle bir kayıt zaten mevcut.";
        case "23503":
            return "Bu kayıt başka kayıtlarda kullanıldığı için silinemez.";
        case "42501": // RLS: rolün bu işleme izni yok
            return YETKI_HATASI;
        case "P0001": // trigger'lardan gelen raise exception
            return error.message;
        case "42P01":
        case "PGRST205":
            return "Veritabanı tablosu bulunamadı. Migration çalıştırıldı mı?";
        default:
            return "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.";
    }
}

// Formdan gelen boş metinleri veritabanına null olarak yazmak için.
export function bosIseNull<T extends Record<string, unknown>>(veri: T): T {
    return Object.fromEntries(
        Object.entries(veri).map(([k, v]) => [k, typeof v === "string" && v.trim() === "" ? null : v])
    ) as T;
}
