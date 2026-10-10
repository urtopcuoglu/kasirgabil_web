// src/actions/kullanici.ts
// Panel girişleri: yönetici personele giriş açar / şifre sıfırlar / girişi kapatır; kullanıcı kendi şifresini değiştirir.
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { GIZLI_ANAHTAR_EKSIK, yoneticiIstemci } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { dbHataMesaji, izinliIstemci, oturum, OTURUM_HATASI } from "@/lib/supabase/yetkili";
import type { IslemSonucu } from "./personel";

const sifreAlani = z
    .string()
    .min(8, { error: "Şifre en az 8 karakter olmalı." })
    .max(72, { error: "Şifre en fazla 72 karakter olabilir." })
    .refine((v) => /[A-Za-zÇĞİÖŞÜçğıöşü]/.test(v) && /\d/.test(v), { error: "Şifrede en az bir harf ve bir rakam olmalı." });

const girisSemasi = z.object({
    email: z.email({ error: "Geçerli bir e-posta adresi girin." }),
    sifre: sifreAlani,
});

// Auth API hatalarını Türkçeleştirir.
function authHataMesaji(error: { message: string; code?: string }) {
    console.error("[auth]", error.code, error.message);
    if (error.code === "email_exists" || /already been registered/i.test(error.message)) return "Bu e-posta ile kayıtlı bir giriş zaten var.";
    if (error.code === "weak_password") return "Şifre çok zayıf; daha uzun ve tahmini zor bir şifre seçin.";
    return "Giriş işlemi yapılamadı. Lütfen tekrar deneyin.";
}

const personelYolu = (id: string) => `/admin/personel/${id}`;

// Personele e-posta + geçici şifreyle panel girişi açar. İlk girişte kullanıcıdan yeni şifre istenir.
export async function panelGirisiAc(personelId: string, email: string, sifre: string): Promise<IslemSonucu> {
    const sonuc = girisSemasi.safeParse({ email: email.trim().toLowerCase(), sifre });
    if (!sonuc.success) return { hata: sonuc.error.issues[0]?.message ?? "Geçersiz veri." };

    const yetki = await izinliIstemci("personel");
    if ("hata" in yetki) return yetki;
    const yonetici = yoneticiIstemci();
    if (!yonetici) return { hata: GIZLI_ANAHTAR_EKSIK };

    const { data: personel } = await yetki.supabase.from("personel").select("auth_user_id, aktif").eq("id", personelId).maybeSingle();
    if (!personel) return { hata: "Personel bulunamadı." };
    if (personel.auth_user_id) return { hata: "Bu personelin zaten panel girişi var." };
    if (!personel.aktif) return { hata: "Pasif personele giriş açılamaz; önce personeli aktif yapın." };

    const { data, error } = await yonetici.auth.admin.createUser({
        email: sonuc.data.email,
        password: sonuc.data.sifre,
        email_confirm: true,
        user_metadata: { sifre_degismeli: true },
    });
    if (error) return { hata: authHataMesaji(error) };

    const { error: baglamaHatasi } = await yetki.supabase.from("personel").update({ auth_user_id: data.user.id }).eq("id", personelId);
    if (baglamaHatasi) {
        // Personele bağlanamayan kullanıcı açıkta kalmasın.
        await yonetici.auth.admin.deleteUser(data.user.id);
        return { hata: dbHataMesaji(baglamaHatasi) };
    }

    revalidatePath("/admin/personel", "layout");
    revalidatePath(personelYolu(personelId));
}

// Yeni geçici şifre verir; kullanıcı bir sonraki girişte şifresini değiştirmek zorunda kalır.
export async function panelSifresiSifirla(personelId: string, sifre: string): Promise<IslemSonucu> {
    const sonuc = sifreAlani.safeParse(sifre);
    if (!sonuc.success) return { hata: sonuc.error.issues[0]?.message ?? "Geçersiz şifre." };

    const yetki = await izinliIstemci("personel");
    if ("hata" in yetki) return yetki;
    const yonetici = yoneticiIstemci();
    if (!yonetici) return { hata: GIZLI_ANAHTAR_EKSIK };

    const { data: personel } = await yetki.supabase.from("personel").select("auth_user_id").eq("id", personelId).maybeSingle();
    if (!personel?.auth_user_id) return { hata: "Bu personelin panel girişi yok." };

    const { error } = await yonetici.auth.admin.updateUserById(personel.auth_user_id, {
        password: sonuc.data,
        user_metadata: { sifre_degismeli: true },
    });
    if (error) return { hata: authHataMesaji(error) };

    revalidatePath(personelYolu(personelId));
}

// Auth kullanıcısı silinir; personel kaydı kalır (auth_user_id on delete set null ile boşalır).
export async function panelGirisiKapat(personelId: string): Promise<IslemSonucu> {
    const yetki = await izinliIstemci("personel");
    if ("hata" in yetki) return yetki;
    const yonetici = yoneticiIstemci();
    if (!yonetici) return { hata: GIZLI_ANAHTAR_EKSIK };

    const { data: personel } = await yetki.supabase.from("personel").select("auth_user_id").eq("id", personelId).maybeSingle();
    if (!personel?.auth_user_id) return { hata: "Bu personelin panel girişi yok." };
    if (personel.auth_user_id === (await oturum())?.kullaniciId) return { hata: "Kendi girişinizi kapatamazsınız." };

    const { error } = await yonetici.auth.admin.deleteUser(personel.auth_user_id);
    if (error) return { hata: authHataMesaji(error) };

    revalidatePath("/admin/personel", "layout");
    revalidatePath(personelYolu(personelId));
}

// ─── Kullanıcının kendi şifresi ─────────────────────────────

const sifreDegistirSemasi = z
    .object({ sifre: sifreAlani, tekrar: z.string() })
    .refine((v) => v.sifre === v.tekrar, { error: "Şifreler aynı değil.", path: ["tekrar"] });

export type SifreDurumu = { hata?: string; tamam?: boolean };

export async function sifreDegistir(_onceki: SifreDurumu, formData: FormData): Promise<SifreDurumu> {
    const sonuc = sifreDegistirSemasi.safeParse({ sifre: formData.get("sifre"), tekrar: formData.get("tekrar") });
    if (!sonuc.success) return { hata: sonuc.error.issues[0]?.message ?? "Geçersiz şifre." };

    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    if (!data?.claims) return { hata: OTURUM_HATASI };
    const zorunluydu = (data.claims.user_metadata as { sifre_degismeli?: boolean } | undefined)?.sifre_degismeli === true;

    const { error } = await supabase.auth.updateUser({ password: sonuc.data.sifre, data: { sifre_degismeli: false } });
    if (error) {
        if (error.code === "same_password") return { hata: "Yeni şifre eskisiyle aynı olamaz." };
        return { hata: authHataMesaji(error) };
    }
    // Oturum anahtarı yenilenir; "şifre değişmeli" bilgisi yeni anahtarda kalkar.
    await supabase.auth.refreshSession();

    if (zorunluydu) redirect("/admin");
    return { tamam: true };
}
