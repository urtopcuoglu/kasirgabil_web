// src/app/api/cron/donanim-puanlari/route.ts
// Haftalık zamanlanmış görev (vercel.json → crons): UserBenchmark CSV'lerini indirip donanım puanlarını günceller.
// Vercel, CRON_SECRET tanımlıysa isteğe "Authorization: Bearer <CRON_SECRET>" ekler; başka çağrılar reddedilir.
// Oturum olmadığı için yazma işlemi gizli anahtarlı istemciyle yapılır (SUPABASE_SECRET_KEY).
import { donanimPuanlariniGuncelle } from "@/lib/donanim-puanlari";
import { GIZLI_ANAHTAR_EKSIK, yoneticiIstemci } from "@/lib/supabase/admin";

export const maxDuration = 120;

export async function GET(istek: Request) {
    const gizli = process.env.CRON_SECRET;
    if (!gizli) return Response.json({ hata: "CRON_SECRET ortam değişkeni tanımlı değil." }, { status: 500 });
    if (istek.headers.get("authorization") !== `Bearer ${gizli}`) return Response.json({ hata: "Yetkisiz." }, { status: 401 });

    const supabase = yoneticiIstemci();
    if (!supabase) return Response.json({ hata: GIZLI_ANAHTAR_EKSIK }, { status: 500 });

    const sonuc = await donanimPuanlariniGuncelle(supabase, "zamanlanmis");
    return Response.json(sonuc, { status: sonuc.basarili ? 200 : 502 });
}
