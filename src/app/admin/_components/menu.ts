// src/app/admin/_components/menu.ts
// Admin kenar menüsü. Bir modül tamamlandıkça hazir: true yapılır.
import {
    BookUser,
    FileText,
    LayoutDashboard,
    Package,
    Truck,
    Users,
    Wallet,
    Wrench,
    type LucideIcon,
} from "lucide-react";

export type MenuOgesi = {
    href: string;
    etiket: string;
    ikon: LucideIcon;
    hazir: boolean;
};

export const menuOgeleri: MenuOgesi[] = [
    { href: "/admin", etiket: "Özet", ikon: LayoutDashboard, hazir: true },
    { href: "/admin/teknik-servis", etiket: "Teknik Servis", ikon: Wrench, hazir: true },
    { href: "/admin/rehber", etiket: "Rehber", ikon: BookUser, hazir: true },
    { href: "/admin/kargolar", etiket: "Kargolar", ikon: Truck, hazir: true },
    { href: "/admin/stok", etiket: "Stok", ikon: Package, hazir: true },
    { href: "/admin/kasa", etiket: "Kasa", ikon: Wallet, hazir: false },
    { href: "/admin/icerik", etiket: "İçerik / Blog", ikon: FileText, hazir: false },
    { href: "/admin/personel", etiket: "Personel", ikon: Users, hazir: true },
];
