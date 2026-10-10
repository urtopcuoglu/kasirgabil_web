// src/app/admin/(panel)/kasa/KasaSekmeleri.tsx
import Sekmeler from "../../_components/Sekmeler";

const SEKMELER = [
    { href: "/admin/kasa", etiket: "Günlük Kasa" },
    { href: "/admin/kasa/rapor", etiket: "Rapor" },
    { href: "/admin/kasa/kategoriler", etiket: "Kategoriler" },
] as const;

export default function KasaSekmeleri({ aktif }: { aktif: (typeof SEKMELER)[number]["href"] }) {
    return <Sekmeler etiket="Kasa bölümleri" sekmeler={SEKMELER} aktif={aktif} />;
}
