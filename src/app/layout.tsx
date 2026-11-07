// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SITE_ADRESI } from "@/lib/site-adresi";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    // Göreli canonical ve Open Graph adresleri bu adrese göre mutlak yapılır.
    metadataBase: new URL(SITE_ADRESI),
    title: "Kasırga Bilgisayar",
    description: "Güvenin Başkenti.",
    icons: {
        icon: '/logo.ico?v=2',

    },
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="tr">
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        {children}
        </body>
        </html>
    );
}
