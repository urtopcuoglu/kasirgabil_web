// src/lib/supabase/auth-hata.ts
// Supabase Auth (yönetici API) hatalarını Türkçeleştirir.
export function authHataMesaji(error: { message: string; code?: string }) {
    console.error("[auth]", error.code, error.message);
    if (error.code === "email_exists" || /already been registered/i.test(error.message)) return "Bu e-posta ile kayıtlı bir giriş zaten var.";
    if (error.code === "weak_password") return "Şifre çok zayıf; daha uzun ve tahmini zor bir şifre seçin.";
    return "Giriş işlemi yapılamadı. Lütfen tekrar deneyin.";
}
