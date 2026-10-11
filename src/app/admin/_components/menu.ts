// src/app/admin/_components/menu.ts
// Admin kenar menüsü. izin verilmişse yalnızca o izne sahip roller görür (src/lib/izinler.ts).
import { BookUser, FileText, Inbox, LayoutDashboard, Package, Truck, Users, Wallet, Wrench, type LucideIcon } from "lucide-react";
import type { Izin } from "@/lib/izinler";

export type MenuOgesi = {
    href: string;
    etiket: string;
    ikon: LucideIcon;
    izin?: Izin;
    rozet?: "mesajlar"; // yanında sayı gösterilir (layout'tan gelir)
};

export const menuOgeleri: MenuOgesi[] = [
    { href: "/admin", etiket: "Özet", ikon: LayoutDashboard },
    { href: "/admin/teknik-servis", etiket: "Teknik Servis", ikon: Wrench },
    { href: "/admin/stok", etiket: "Stok", ikon: Package },
    { href: "/admin/kasa", etiket: "Kasa", ikon: Wallet, izin: "kasa" },
    { href: "/admin/rehber", etiket: "Rehber", ikon: BookUser },
    { href: "/admin/kargolar", etiket: "Kargolar", ikon: Truck },
    { href: "/admin/mesajlar", etiket: "Mesajlar", ikon: Inbox, izin: "mesajlar", rozet: "mesajlar" },
    { href: "/admin/icerik", etiket: "İçerik / Blog", ikon: FileText, izin: "icerik" },
    { href: "/admin/personel", etiket: "Personel", ikon: Users, izin: "personel" },
];
