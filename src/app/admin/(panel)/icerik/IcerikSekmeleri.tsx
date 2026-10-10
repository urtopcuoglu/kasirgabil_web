// src/app/admin/(panel)/icerik/IcerikSekmeleri.tsx
import Sekmeler from "../../_components/Sekmeler";

const SEKMELER = [
    { href: "/admin/icerik", etiket: "Blog Yazıları" },
    { href: "/admin/icerik/kategoriler", etiket: "Blog Kategorileri" },
    { href: "/admin/icerik/site", etiket: "Site İçerikleri" },
] as const;

export default function IcerikSekmeleri({ aktif }: { aktif: (typeof SEKMELER)[number]["href"] }) {
    return <Sekmeler etiket="İçerik bölümleri" sekmeler={SEKMELER} aktif={aktif} />;
}
