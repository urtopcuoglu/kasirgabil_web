// src/proxy.ts
// Next.js 16 proxy'si (eski adı middleware).
// - Admin alan adı (ADMIN_HOST, örn. admin.kasirgabilgisayar.com): kök adres panele gider, vitrin sayfaları ana siteye yönlenir.
// - Ana alan adında /admin istekleri admin alan adına taşınır.
// - /admin altında oturum yenilenir ve giriş kontrolü yapılır (vitrin sayfaları Supabase'e istek atmaz).
// ADMIN_HOST / SITE_URL tanımlı değilse (yerel geliştirme) alan adı yönlendirmesi yapılmaz.
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
    const { pathname, search } = request.nextUrl;
    const adminHost = process.env.ADMIN_HOST;
    const siteUrl = process.env.SITE_URL;
    const host = request.headers.get("host")?.split(":")[0];
    const adminYolu = pathname === "/admin" || pathname.startsWith("/admin/");

    if (adminHost && siteUrl) {
        if (host === adminHost && !adminYolu) {
            if (pathname === "/") return NextResponse.redirect(new URL("/admin", request.url));
            return NextResponse.redirect(new URL(pathname + search, siteUrl));
        }
        if (host !== adminHost && adminYolu) {
            return NextResponse.redirect(new URL(pathname + search, `https://${adminHost}`));
        }
    }

    if (!adminYolu) return NextResponse.next();
    return updateSession(request);
}

export const config = {
    // Statik dosyalar ve Next iç yolları hariç tüm istekler (alan adı yönlendirmesi için).
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|woff2?|txt|xml)$).*)"],
};
