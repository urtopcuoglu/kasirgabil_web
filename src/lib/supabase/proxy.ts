// src/lib/supabase/proxy.ts
// proxy.ts tarafından çağrılır: oturum cookie'sini yeniler ve /admin rotalarını korur.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const GIRIS_YOLU = "/admin/giris";
const HESAP_YOLU = "/admin/hesabim";

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet, headers) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    response = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                    // Oturum cookie'si içeren yanıtların CDN'de önbelleğe alınmasını engeller.
                    Object.entries(headers).forEach(([key, value]) =>
                        response.headers.set(key, value)
                    );
                },
            },
        }
    );

    // createServerClient ile getClaims arasına kod eklemeyin: oturum yenileme burada gerçekleşir.
    const { data } = await supabase.auth.getClaims();
    const girisYapmis = Boolean(data?.claims);

    const { pathname } = request.nextUrl;
    const girisSayfasi = pathname === GIRIS_YOLU;

    if (!girisYapmis && !girisSayfasi) {
        const url = request.nextUrl.clone();
        url.pathname = GIRIS_YOLU;
        url.search = "";
        return yonlendir(url, response);
    }

    if (girisYapmis && girisSayfasi) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin";
        url.search = "";
        return yonlendir(url, response);
    }

    // Yöneticinin verdiği geçici şifreyle giren kullanıcı, kendi şifresini belirleyene kadar Hesabım sayfasında kalır.
    const sifreDegismeli = (data?.claims?.user_metadata as { sifre_degismeli?: boolean } | undefined)?.sifre_degismeli === true;
    if (sifreDegismeli && pathname !== HESAP_YOLU) {
        const url = request.nextUrl.clone();
        url.pathname = HESAP_YOLU;
        url.search = "";
        return yonlendir(url, response);
    }

    return response;
}

// Yönlendirme yaparken yenilenen oturum cookie'lerini kaybetmemek için onları yeni yanıta taşır.
function yonlendir(url: URL, kaynak: NextResponse) {
    const redirect = NextResponse.redirect(url);
    kaynak.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    kaynak.headers.forEach((value, key) => {
        if (key.toLowerCase() !== "location") redirect.headers.set(key, value);
    });
    return redirect;
}
