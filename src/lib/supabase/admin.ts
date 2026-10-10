// src/lib/supabase/admin.ts
// Supabase yönetici istemcisi (gizli anahtar): yalnızca panel girişi açma / şifre sıfırlama / kapatma için.
// RLS'i atlar; bu yüzden yalnızca yönetici izni kontrol edilmiş Server Action'lardan çağrılır.
// Anahtar NEXT_PUBLIC_ öneki almaz, tarayıcıya hiçbir zaman gönderilmez.
import { createClient } from "@supabase/supabase-js";

export const GIZLI_ANAHTAR_EKSIK =
    "Panel girişi yönetimi için SUPABASE_SECRET_KEY ortam değişkeni tanımlı değil (Supabase → Project Settings → API Keys → Secret key).";

export const yoneticiIstemciVarMi = () => !!process.env.SUPABASE_SECRET_KEY;

export function yoneticiIstemci() {
    const anahtar = process.env.SUPABASE_SECRET_KEY;
    if (!anahtar) return null;
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, anahtar, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
}
