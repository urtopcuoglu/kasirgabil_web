// src/app/admin/(panel)/stok/StokSekmeleri.tsx
// Stok modülünün alt sayfaları arasında geçiş (Ürünler / Kutular / Kategoriler).
import Link from "next/link";
import { cn } from "@/lib/utils";

const SEKMELER = [
    { href: "/admin/stok", etiket: "Ürünler" },
    { href: "/admin/stok/kutular", etiket: "Kutular" },
    { href: "/admin/stok/kategoriler", etiket: "Kategoriler" },
] as const;

export default function StokSekmeleri({ aktif }: { aktif: (typeof SEKMELER)[number]["href"] }) {
    return (
        <nav aria-label="Stok bölümleri" className="mb-4 flex gap-1 border-b">
            {SEKMELER.map((s) => (
                <Link
                    key={s.href}
                    href={s.href}
                    aria-current={aktif === s.href ? "page" : undefined}
                    className={cn(
                        "-mb-px border-b-2 px-3 py-2 text-sm font-medium transition",
                        aktif === s.href
                            ? "border-[var(--color-primary)] text-[var(--color-secondary)]"
                            : "border-transparent text-gray-500 hover:text-gray-900"
                    )}
                >
                    {s.etiket}
                </Link>
            ))}
        </nav>
    );
}
