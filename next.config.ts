import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Stok PDF'i Türkçe karakterler için bu fontları dosyadan okur; dağıtım paketine dahil edilmeli.
    outputFileTracingIncludes: {
        "/admin/stok/disa-aktar": ["./src/assets/fonts/*.ttf"],
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                port: '',
                pathname: '/**',
            },
            // Panelden yüklenen görseller (blog, slider, banka logoları) — Supabase Storage "site" bucket'ı
            {
                protocol: 'https',
                hostname: '*.supabase.co',
                pathname: '/storage/v1/object/public/site/**',
            },
        ],
    },
    async headers() {
        return [
            // Başka sitelere giden isteklerde yalnızca alan adı gönderilir; yol ve sorgu (?ara=, ?q=) sızmaz.
            {
                source: '/:path*',
                headers: [{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }],
            },
            // Panel (/admin dahil): dış sitelere hiç referrer gönderilmez, arama motorları dizine eklemez.
            // Aynı başlığı ayarlayan sonraki kural öncekini ezer.
            {
                source: '/admin/:path*',
                headers: [
                    { key: 'Referrer-Policy', value: 'same-origin' },
                    { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
                ],
            },
        ];
    },
    async redirects() {
        return [
            // Eski WooCommerce ürün sayfaları → anasayfa
            { source: '/u/:slug*', destination: '/', permanent: true },

            // Eski kategori sayfaları → anasayfa (/urunler artık vitrinin ürünler sayfası)
            { source: '/urunler/:path+', destination: '/urunler', permanent: true },
            { source: '/public/products', destination: '/urunler', permanent: true },

            // Eski sepet, hesap, ödeme sayfaları → anasayfa
            { source: '/sepet', destination: '/', permanent: true },
            { source: '/hesabim', destination: '/', permanent: true },
            { source: '/odeme', destination: '/', permanent: true },

            // Eski yasal sayfa URL'lerinden yeni sayfalara
            { source: '/kisisel-verilerin-korunmasi', destination: '/kvkk', permanent: true },

            // Diğer eski sayfalar
            { source: '/alisveris-rehberi', destination: '/', permanent: true },
            { source: '/banka-hesap-numaralarimiz', destination: '/public/contact', permanent: true },
            { source: '/medya-kiti', destination: '/', permanent: true },
        ];
    },
};

export default nextConfig;