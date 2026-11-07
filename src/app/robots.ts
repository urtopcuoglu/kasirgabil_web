// src/app/robots.ts
// Arama motorları paneli ve API'yi taramaz; site haritasının adresi bildirilir.
import type { MetadataRoute } from "next";
import { mutlakAdres } from "@/lib/site-adresi";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
        sitemap: mutlakAdres("/sitemap.xml"),
    };
}
