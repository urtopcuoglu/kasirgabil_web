// src/app/admin/(panel)/stok/DisaAktarMenusu.tsx
// Stok listesini (sayfadaki filtrelerle, tüm sayfalar) PDF, Excel veya CSV olarak indirir.
"use client";

import { Download, FileSpreadsheet, FileText, Sheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const BICIMLER = [
    { bicim: "pdf", etiket: "PDF (.pdf)", Ikon: FileText },
    { bicim: "xlsx", etiket: "Excel (.xlsx)", Ikon: FileSpreadsheet },
    { bicim: "csv", etiket: "CSV (.csv)", Ikon: Sheet },
] as const;

export default function DisaAktarMenusu({ sorgu }: { sorgu: string }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <Download /> Dışa Aktar
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel className="text-xs font-normal text-gray-500">Filtrelenmiş listenin tamamı</DropdownMenuLabel>
                {BICIMLER.map(({ bicim, etiket, Ikon }) => (
                    <DropdownMenuItem key={bicim} asChild>
                        <a href={`/admin/stok/disa-aktar?${new URLSearchParams({ ...Object.fromEntries(new URLSearchParams(sorgu)), bicim })}`} download>
                            <Ikon /> {etiket}
                        </a>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
