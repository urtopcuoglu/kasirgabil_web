// src/lib/site-adresi.ts
// Sitenin kalıcı adresi (sitemap, robots, canonical ve JSON-LD için mutlak URL).
// Öncelik: SITE_URL (production'da tanımlı, proxy ve panel de bunu kullanır) → NEXT_PUBLIC_SITE_URL → kasirgabilgisayar.com.
// Vercel'in üretim alan adı kullanılmaz: panel alan adı (admin.) ya da vercel.app adresi olabilir.
const hamAdres = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://kasirgabilgisayar.com";

export const SITE_ADRESI = hamAdres.replace(/\/+$/, "");

export const mutlakAdres = (yol: string) => `${SITE_ADRESI}${yol.startsWith("/") ? yol : `/${yol}`}`;

// JSON-LD'yi <script> içine güvenle gömer: "</script>" kapanışı ve HTML yorum açılışı kaçırılır.
export const jsonLd = (veri: unknown) => JSON.stringify(veri).replace(/</g, "\\u003c");
