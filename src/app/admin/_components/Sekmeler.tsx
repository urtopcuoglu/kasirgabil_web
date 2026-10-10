// src/app/admin/_components/Sekmeler.tsx
// Modül içi alt sayfalar arasında geçiş sekmeleri (Stok, Kasa...).
import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
    etiket: string; // erişilebilirlik için gezinme adı
    sekmeler: readonly { href: string; etiket: string }[];
    aktif: string;
};

export default function Sekmeler({ etiket, sekmeler, aktif }: Props) {
    return (
        <nav aria-label={etiket} className="mb-4 flex gap-1 overflow-x-auto border-b">
            {sekmeler.map((s) => (
                <Link
                    key={s.href}
                    href={s.href}
                    aria-current={aktif === s.href ? "page" : undefined}
                    className={cn(
                        "-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition",
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
