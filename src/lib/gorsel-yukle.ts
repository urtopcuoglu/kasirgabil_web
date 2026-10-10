// src/lib/gorsel-yukle.ts
// Panelden Supabase Storage'a ("site" bucket'ı) görsel yükler ve herkese açık adresini döndürür.
// Tarayıcıda çalışır; yükleme yetkisi storage RLS'i ile yalnızca giriş yapmış kullanıcılara açıktır.
import { createClient } from "@/lib/supabase/client";

const IZINLI_TURLER = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const AZAMI_BOYUT = 5 * 1024 * 1024;

export async function gorselYukle(dosya: File, klasor: string): Promise<string> {
    if (!IZINLI_TURLER.includes(dosya.type)) throw new Error("Yalnızca JPG, PNG, WEBP veya GIF yüklenebilir.");
    if (dosya.size > AZAMI_BOYUT) throw new Error("Görsel en fazla 5 MB olabilir.");

    const uzanti = dosya.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const yol = `${klasor}/${new Date().getFullYear()}/${crypto.randomUUID()}.${uzanti}`;

    const supabase = createClient();
    const { error } = await supabase.storage.from("site").upload(yol, dosya, { contentType: dosya.type, cacheControl: "31536000" });
    if (error) {
        console.error("[gorselYukle]", error.message);
        throw new Error("Görsel yüklenemedi. Oturumunuzu ve bağlantınızı kontrol edin.");
    }
    return supabase.storage.from("site").getPublicUrl(yol).data.publicUrl;
}
