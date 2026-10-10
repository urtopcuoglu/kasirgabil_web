// src/actions/auth.ts
"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const girisSemasi = z.object({
    email: z.email({ error: "Geçerli bir e-posta adresi girin." }),
    sifre: z.string().min(1, { error: "Şifre boş bırakılamaz." }),
});

export type GirisDurumu = {
    hata?: string;
    email?: string;
};

export async function girisYap(_onceki: GirisDurumu, formData: FormData): Promise<GirisDurumu> {
    const email = String(formData.get("email") ?? "").trim();
    const sonuc = girisSemasi.safeParse({ email, sifre: formData.get("sifre") });

    if (!sonuc.success) {
        return { hata: sonuc.error.issues[0]?.message, email };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
        email: sonuc.data.email,
        password: sonuc.data.sifre,
    });

    if (error) {
        // Hangi alanın yanlış olduğunu belli etmemek için tek bir mesaj döndürülür.
        return { hata: "E-posta veya şifre hatalı.", email };
    }

    redirect("/admin");
}

export async function cikisYap() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/admin/giris");
}
