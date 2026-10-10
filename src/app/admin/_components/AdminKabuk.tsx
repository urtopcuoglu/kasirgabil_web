// src/app/admin/_components/AdminKabuk.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, LogOut, Menu, X } from "lucide-react";
import { cikisYap } from "@/actions/auth";
import { cn } from "@/lib/utils";
import { menuOgeleri } from "./menu";

type Props = {
    email: string;
    children: React.ReactNode;
};

export default function AdminKabuk({ email, children }: Props) {
    const pathname = usePathname();
    const [menuAcik, setMenuAcik] = useState(false);

    // Mobilde bir sayfaya geçildiğinde menüyü kapat.
    useEffect(() => {
        setMenuAcik(false);
    }, [pathname]);

    const aktifMi = (href: string) =>
        href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

    return (
        <div className="flex min-h-screen">
            {/* Mobil karartma */}
            {menuAcik && (
                <button
                    type="button"
                    aria-label="Menüyü kapat"
                    onClick={() => setMenuAcik(false)}
                    className="fixed inset-0 z-30 bg-black/40 lg:hidden"
                />
            )}

            {/* Kenar menü */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[var(--color-secondary)] text-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
                    menuAcik ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex items-center justify-between px-5 py-5">
                    <Link href="/admin">
                        <Image src="/logo/logo-beyaz.png" alt="Kasırga Bilgisayar" width={130} height={43} priority />
                    </Link>
                    <button
                        type="button"
                        aria-label="Menüyü kapat"
                        onClick={() => setMenuAcik(false)}
                        className="rounded-md p-1 hover:bg-white/10 lg:hidden"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto px-3">
                    {menuOgeleri.map(({ href, etiket, ikon: Ikon, hazir }) =>
                        hazir ? (
                            <Link
                                key={href}
                                href={href}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
                                    aktifMi(href)
                                        ? "bg-[var(--color-primary)] text-white"
                                        : "text-white/80 hover:bg-white/10 hover:text-white"
                                )}
                            >
                                <Ikon className="size-4" />
                                {etiket}
                            </Link>
                        ) : (
                            <span
                                key={href}
                                aria-disabled="true"
                                className="flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2 text-sm text-white/40"
                            >
                                <Ikon className="size-4" />
                                {etiket}
                                <span className="ml-auto rounded bg-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
                                    Yakında
                                </span>
                            </span>
                        )
                    )}
                </nav>

                <div className="space-y-1 border-t border-white/10 px-3 py-4">
                    <Link
                        href="/"
                        target="_blank"
                        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
                    >
                        <ExternalLink className="size-4" />
                        Siteyi Görüntüle
                    </Link>
                    <p className="truncate px-3 pt-2 text-xs text-white/50" title={email}>
                        {email}
                    </p>
                    <form action={cikisYap}>
                        <button
                            type="submit"
                            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
                        >
                            <LogOut className="size-4" />
                            Çıkış Yap
                        </button>
                    </form>
                </div>
            </aside>

            {/* İçerik */}
            <div className="flex min-w-0 flex-1 flex-col">
                <header className="sticky top-0 z-20 flex items-center gap-3 border-b bg-white px-4 py-3 lg:hidden">
                    <button
                        type="button"
                        aria-label="Menüyü aç"
                        onClick={() => setMenuAcik(true)}
                        className="rounded-md p-1.5 text-[var(--color-secondary)] hover:bg-gray-100"
                    >
                        <Menu className="size-5" />
                    </button>
                    <span className="font-semibold text-[var(--color-secondary)]">Kasırga Admin</span>
                </header>

                <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
}
