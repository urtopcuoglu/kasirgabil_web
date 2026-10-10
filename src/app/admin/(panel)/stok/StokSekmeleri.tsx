// src/app/admin/(panel)/stok/StokSekmeleri.tsx
import Sekmeler from "../../_components/Sekmeler";

const SEKMELER = [
    { href: "/admin/stok", etiket: "Ürünler" },
    { href: "/admin/stok/kutular", etiket: "Kutular" },
    { href: "/admin/stok/kategoriler", etiket: "Kategoriler" },
] as const;

export default function StokSekmeleri({ aktif }: { aktif: (typeof SEKMELER)[number]["href"] }) {
    return <Sekmeler etiket="Stok bölümleri" sekmeler={SEKMELER} aktif={aktif} />;
}
