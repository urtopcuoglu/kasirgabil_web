// src/actions/sifre-sifirlama.ts
// Şifremi unuttum (/admin/sifremi-unuttum): e-posta + doğrulama uygulamasındaki (TOTP) kod.
// E-posta gönderilmez. Kod doğruysa kullanıcı aal2 oturumla girer ve Hesabım'da yeni şifresini belirlemek zorunda kalır.
//
// Akış: gizli anahtarla tek kullanımlık giriş bağlantısı (magic link) üretilir ama gönderilmez; anahtarı sunucuda
// bellekteki bir istemcide oturuma çevrilir, ardından TOTP kodu Supabase'e doğrulatılır. Kod yanlışsa oturum atılır.
// Kaba kuvvet denemelerine karşı e-posta ve IP başına deneme sınırı vardır (sifre_sifirlama_denemeleri).
"use server";

import { createClient as supabaseIstemcisi } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { GIZLI_ANAHTAR_EKSIK, yoneticiIstemci } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const semasi = z.object({
    email: z.email({ error: "Geçerli bir e-posta adresi girin." }),
    kod: z
        .string()
        .transform((v) => v.replace(/\s/g, ""))
        .pipe(z.string().regex(/^\d{6}$/, { error: "Doğrulama uygulamasındaki 6 haneli kodu girin." })),
});

// Hangi bilginin yanlış olduğu (e-posta kayıtlı mı, uygulama kurulu mu) belli edilmez.
const GENEL_HATA = "E-posta veya doğrulama kodu hatalı.";
const SINIR_HATASI = "Çok fazla deneme yapıldı. 15 dakika sonra tekrar deneyin.";
const EPOSTA_SINIRI = 5; // 15 dakikada aynı e-postayla başarısız deneme
const IP_SINIRI = 20; // 15 dakikada aynı IP'den başarısız deneme

export type SifirlamaDurumu = { hata?: string; email?: string };

export async function sifreSifirla(_onceki: SifirlamaDurumu, formData: FormData): Promise<SifirlamaDurumu> {
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const sonuc = semasi.safeParse({ email, kod: String(formData.get("kod") ?? "") });
    if (!sonuc.success) return { hata: sonuc.error.issues[0]?.message, email };

    const yonetici = yoneticiIstemci();
    if (!yonetici) return { hata: GIZLI_ANAHTAR_EKSIK, email };

    const basliklar = await headers();
    const ip = (basliklar.get("x-forwarded-for")?.split(",")[0] ?? basliklar.get("x-real-ip") ?? "").trim() || null;

    // Deneme sınırı
    const esik = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const denemeler = yonetici.from("sifre_sifirlama_denemeleri");
    const [epostaSayisi, ipSayisi] = await Promise.all([
        denemeler.select("id", { count: "exact", head: true }).eq("eposta", email).eq("basarili", false).gte("created_at", esik),
        ip
            ? yonetici.from("sifre_sifirlama_denemeleri").select("id", { count: "exact", head: true }).eq("ip", ip).eq("basarili", false).gte("created_at", esik)
            : Promise.resolve({ count: 0, error: null }),
    ]);
    if (epostaSayisi.error) {
        console.error("[sifre-sifirlama] deneme sayımı", epostaSayisi.error.code, epostaSayisi.error.message);
        return { hata: "Şu anda işlem yapılamıyor. Lütfen daha sonra tekrar deneyin.", email };
    }
    if ((epostaSayisi.count ?? 0) >= EPOSTA_SINIRI || (ipSayisi.count ?? 0) >= IP_SINIRI) return { hata: SINIR_HATASI, email };

    const denemeKaydet = (basarili: boolean) => yonetici.from("sifre_sifirlama_denemeleri").insert({ eposta: email, ip, basarili });
    const basarisiz = async () => {
        await denemeKaydet(false);
        return { hata: GENEL_HATA, email };
    };

    // Kullanıcı, aktif personele bağlı olmalı ve doğrulanmış bir TOTP uygulaması bulunmalı.
    const { data: kullaniciId } = await yonetici.rpc("auth_kullanici_kimligi", { p_eposta: email });
    if (!kullaniciId) return basarisiz();
    const { data: personel } = await yonetici.from("personel").select("id").eq("auth_user_id", kullaniciId).eq("aktif", true).maybeSingle();
    if (!personel) return basarisiz();
    const { data: faktorler } = await yonetici.auth.admin.mfa.listFactors({ userId: kullaniciId as string });
    const faktor = faktorler?.factors.find((f) => f.factor_type === "totp" && f.status === "verified");
    if (!faktor) return basarisiz();

    // Gönderilmeyen tek kullanımlık giriş anahtarı → bellekteki istemcide aal1 oturum.
    const { data: baglanti, error: baglantiHatasi } = await yonetici.auth.admin.generateLink({ type: "magiclink", email });
    if (baglantiHatasi) {
        console.error("[sifre-sifirlama] generateLink", baglantiHatasi.code, baglantiHatasi.message);
        return { hata: "Şu anda işlem yapılamıyor. Lütfen daha sonra tekrar deneyin.", email };
    }
    const gecici = supabaseIstemcisi(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error: otpHatasi } = await gecici.auth.verifyOtp({ token_hash: baglanti.properties.hashed_token, type: "magiclink" });
    if (otpHatasi) {
        console.error("[sifre-sifirlama] verifyOtp", otpHatasi.code, otpHatasi.message);
        return { hata: "Şu anda işlem yapılamıyor. Lütfen daha sonra tekrar deneyin.", email };
    }

    // TOTP kodu → aal2. Yanlışsa geçici oturum kapatılır.
    const { data: dogrulama, error: kodHatasi } = await gecici.auth.mfa.challengeAndVerify({ factorId: faktor.id, code: sonuc.data.kod });
    if (kodHatasi) {
        await gecici.auth.signOut({ scope: "local" });
        return basarisiz();
    }
    await denemeKaydet(true);

    // Yeni şifre zorunlu; ardından oturum tarayıcı cookie'sine yazılır.
    await yonetici.auth.admin.updateUserById(kullaniciId as string, { user_metadata: { sifre_degismeli: true } });
    const supabase = await createClient();
    const { error: oturumHatasi } = await supabase.auth.setSession({ access_token: dogrulama.access_token, refresh_token: dogrulama.refresh_token });
    if (oturumHatasi) {
        console.error("[sifre-sifirlama] setSession", oturumHatasi.code, oturumHatasi.message);
        return { hata: "Şu anda işlem yapılamıyor. Lütfen daha sonra tekrar deneyin.", email };
    }
    // Yeni anahtarda "şifre değişmeli" bilgisi yer alsın.
    await supabase.auth.refreshSession();

    redirect("/admin/hesabim");
}
