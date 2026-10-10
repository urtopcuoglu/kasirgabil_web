// src/app/admin/_components/A5.tsx
// A5 yatay (210 × 148 mm) yazdırılabilir formlar için ortak parçalar (kargo fişi, servis formu).
import { cn } from "@/lib/utils";

// Bu bileşeni içeren sayfada yazdırma A5 yatay ve kenar boşluksuz yapılır.
export function A5YazdirmaStili() {
    return <style>{`@page { size: A5 landscape; margin: 0; }`}</style>;
}

// Ekranda gölgeli kağıt, çıktıda tam A5 yatay sayfa.
export function A5Sayfa({ className, children }: { className?: string; children: React.ReactNode }) {
    return (
        <div
            className={cn(
                "mx-auto flex h-[148mm] w-[210mm] shrink-0 flex-col overflow-hidden bg-white p-[7mm] text-black shadow-lg [print-color-adjust:exact] print:shadow-none",
                className
            )}
        >
            {children}
        </div>
    );
}
