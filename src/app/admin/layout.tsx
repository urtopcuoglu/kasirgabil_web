// src/app/admin/layout.tsx
// Tüm /admin sayfalarının ortak kabuğu. Vitrin Header/Footer'ı burada yoktur.
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: {
        template: "%s | Kasırga Admin",
        default: "Kasırga Admin",
    },
    // Admin sayfaları arama motorlarına kapalıdır.
    robots: { index: false, follow: false },
};

export default function AdminLayout({
                                        children,
                                    }: Readonly<{
    children: React.ReactNode;
}>) {
    return <div className="min-h-screen bg-gray-50 text-gray-900 print:bg-white">{children}</div>;
}
