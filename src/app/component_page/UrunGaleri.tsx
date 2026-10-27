// src/app/component_page/UrunGaleri.tsx
// Ürün detay sayfasının görsel galerisi: büyük görsel + küçük resimler.
"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

export default function UrunGaleri({ gorseller, ad }: { gorseller: string[]; ad: string }) {
    const [secili, setSecili] = useState(0);
    const buyuk = gorseller[secili];

    return (
        <div className="space-y-3">
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
                {buyuk ? (
                    <Image src={buyuk} alt={ad} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-contain p-4" />
                ) : (
                    <span className="flex size-full items-center justify-center text-gray-300">
                        <ImageOff size={56} />
                    </span>
                )}
            </div>
            {gorseller.length > 1 && (
                <ul className="grid grid-cols-6 gap-2">
                    {gorseller.map((g, i) => (
                        <li key={g}>
                            <button
                                type="button"
                                onClick={() => setSecili(i)}
                                aria-label={`${i + 1}. görsel`}
                                aria-current={i === secili ? "true" : undefined}
                                className={cn(
                                    "relative block aspect-square w-full overflow-hidden rounded-lg border-2 bg-white transition dark:bg-zinc-900",
                                    i === secili ? "border-[var(--color-primary)]" : "border-gray-200 hover:border-gray-400 dark:border-zinc-700"
                                )}
                            >
                                <Image src={g} alt="" fill sizes="96px" className="object-contain p-1" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
