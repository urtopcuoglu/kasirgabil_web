// src/lib/site-adresi.ts
// Sitenin kalıcı adresi (sitemap, robots, canonical ve JSON-LD için mutlak URL).
// Öncelik: NEXT_PUBLIC_SITE_URL → Vercel'in üretim alan adı → kasirgabilgisayar.com.
const hamAdres =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "https://kasirgabilgisayar.com");

export const SITE_ADRESI = hamAdres.replace(/\/+$/, "");

export const mutlakAdres = (yol: string) => `${SITE_ADRESI}${yol.startsWith("/") ? yol : `/${yol}`}`;

// JSON-LD'yi <script> içine güvenle gömer: "</script>" kapanışı ve HTML yorum açılışı kaçırılır.
export const jsonLd = (veri: unknown) => JSON.stringify(veri).replace(/</g, "\\u003c");
