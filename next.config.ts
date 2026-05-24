import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
    async redirects() {
        return [
            // Eski WooCommerce ürün sayfaları → anasayfa
            { source: '/u/:slug*', destination: '/', permanent: true },

            // Eski kategori sayfaları → anasayfa
            { source: '/urunler/:path*', destination: '/', permanent: true },

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