// src/lib/supabase/yetkili.ts
// Server Action'larda kullanılır: oturum yoksa null döner.
// RLS zaten yetkisiz yazmayı engeller; bu kontrol kullanıcıya anlaşılır bir mesaj vermek içindir.
import { createClient } from "./server";

export const OTURUM_HATASI = "Oturumunuz sona ermiş. Lütfen tekrar giriş yapın.";

export async function yetkiliIstemci() {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    return data?.claims ? supabase : null;
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
