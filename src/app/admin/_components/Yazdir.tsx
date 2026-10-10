// src/app/admin/_components/Yazdir.tsx
"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { anaButonSinifi } from "./form";

export function YazdirButonu() {
    return (
        <Button type="button" onClick={() => window.print()} className={anaButonSinifi}>
            <Printer /> Yazdır
        </Button>
    );
}

// Önizlemeden "Yazdır" ile gelindiğinde (?yazdir=1) yazdırma penceresini bir kez açar
// ve sayfa yenilenince tekrar açılmasın diye parametreyi URL'den kaldırır.
export function OtomatikYazdir() {
    const router = useRouter();
    const pathname = usePathname();
    const calisti = useRef(false);

    useEffect(() => {
        if (calisti.current) return;
        calisti.current = true;

        const yazdir = () => {
            window.print();
            router.replace(pathname, { scroll: false });
        };

        // Logo yüklenmeden yazdırılmasın.
        if (document.readyState === "complete") setTimeout(yazdir, 150);
        else window.addEventListener("load", () => setTimeout(yazdir, 150), { once: true });
    }, [pathname, router]);

    return null;
}
