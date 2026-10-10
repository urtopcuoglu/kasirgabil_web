// src/app/admin/_components/form.tsx
// Admin formlarında ortak kullanılan küçük parçalar.
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const inputSinifi =
    "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--color-secondary)] focus:ring-2 focus:ring-[var(--color-secondary)]/20 aria-invalid:border-[var(--color-primary)]";

type AlanProps = {
    etiket: string;
    htmlFor: string;
    hata?: string;
    zorunlu?: boolean;
    className?: string;
    children: React.ReactNode;
};

export function Alan({ etiket, htmlFor, hata, zorunlu, className, children }: AlanProps) {
    return (
        <div className={cn("space-y-1.5", className)}>
            <Label htmlFor={htmlFor}>
                {etiket}
                {zorunlu && <span className="text-[var(--color-primary)]">*</span>}
            </Label>
            {children}
            {hata && <p className="text-xs text-[var(--color-primary)]">{hata}</p>}
        </div>
    );
}

export function FormHatasi({ mesaj }: { mesaj?: string }) {
    if (!mesaj) return null;
    return (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-[var(--color-primary)]">
            {mesaj}
        </p>
    );
}

type SayfaBasligiProps = {
    baslik: string;
    aciklama?: string;
    children?: React.ReactNode; // sağ taraftaki butonlar
};

export function SayfaBasligi({ baslik, aciklama, children }: SayfaBasligiProps) {
    return (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
                <h1 className="text-2xl font-bold text-[var(--color-secondary)]">{baslik}</h1>
                {aciklama && <p className="mt-1 text-sm text-gray-500">{aciklama}</p>}
            </div>
            {children && <div className="flex flex-wrap gap-2">{children}</div>}
        </div>
    );
}

export const anaButonSinifi = "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90";
