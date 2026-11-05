// src/actions/panel-arama.ts
// Panel filtre formlarının gönderildiği yer. Formdaki filtreler (durum, kategori, sıralama...) eskisi gibi adrese
// yazılır; yalnızca arama kelimesi (q) adrese değil sayfaya özel çereze yazılır. Boş q aramayı temizler.
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PANEL_ARAMA_EN_UZUN, panelAramaCerezi } from "@/lib/panel-arama";
import { stokTamEslesmesi } from "@/app/admin/(panel)/stok/filtreler";

// Yalnızca panel sayfalarına yönlendirilir (açık yönlendirme olmasın).
const PANEL_YOLU = /^\/admin(\/[\w-]+)*$/;

// _yol: formun gideceği sayfa; içinde sorgu varsa (örn. ?gorunum=kart) korunur, form alanları üstüne yazılır.
export async function panelFiltreUygula(form: FormData) {
    const hedef = new URL(String(form.get("_yol") ?? ""), "http://panel.local");
    const yol = hedef.pathname;
    if (!PANEL_YOLU.test(yol)) redirect("/admin");

    const parametreler = hedef.searchParams;
    for (const [anahtar, deger] of form) {
        // "_" ile başlayanlar formun kendi alanları, "$" ile başlayanlar React'in eklediği alanlar.
        if (anahtar.startsWith("_") || anahtar.startsWith("$") || anahtar === "q" || typeof deger !== "string") continue;
        parametreler.set(anahtar, deger);
    }
    parametreler.delete("q");
    parametreler.delete("sayfa"); // yeni arama/filtre ilk sayfadan başlar

    const q = String(form.get("q") ?? "").trim().slice(0, PANEL_ARAMA_EN_UZUN);
    const cerezler = await cookies();
    const cerez = panelAramaCerezi(yol);

    // Stokta barkod okutma / tam kod: tek ürüne denk geliyorsa doğrudan ürüne gidilir ve arama saklanmaz
    // (saklansaydı Stok sayfasına her dönüşte yeniden ürüne yönlenirdi).
    if (yol === "/admin/stok" && q) {
        const id = await stokTamEslesmesi(await createClient(), q);
        if (id) {
            cerezler.delete({ name: cerez, path: "/admin" });
            redirect(`/admin/stok/${id}`);
        }
    }

    if (q) {
        cerezler.set(cerez, q, {
            path: "/admin",
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 2, // 2 saat
        });
    } else {
        cerezler.delete({ name: cerez, path: "/admin" });
    }

    const sorgu = parametreler.toString();
    redirect(sorgu ? `${yol}?${sorgu}` : yol);
}
