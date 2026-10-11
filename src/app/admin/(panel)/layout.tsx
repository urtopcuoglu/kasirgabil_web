// src/app/admin/(panel)/layout.tsx
// Giriş gerektiren admin sayfalarının kabuğu.
// proxy.ts zaten yönlendirme yapar; buradaki kontrol ikinci savunma hattıdır.
// Yetki, hesabın bağlı olduğu aktif personelin rolüdür; bağlı değilse panel açılmaz (RLS de hiçbir veri döndürmez).
import Image from "next/image";
import { redirect } from "next/navigation";
import { LogOut, ShieldOff } from "lucide-react";
import { cikisYap } from "@/actions/auth";
import { izinVar } from "@/lib/izinler";
import { createClient } from "@/lib/supabase/server";
import { oturum } from "@/lib/supabase/yetkili";
import AdminKabuk from "../_components/AdminKabuk";

export default async function PanelLayout({
                                              children,
                                          }: Readonly<{
    children: React.ReactNode;
}>) {
    const o = await oturum();
    if (!o) redirect("/admin/giris");

    if (!o.rol) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-tertiary)] px-4">
                <div className="w-full max-w-sm space-y-4 rounded-xl bg-white p-8 text-center shadow-xl">
                    <Image src="/logo/logo.png" alt="Kasırga Bilgisayar" width={150} height={50} className="mx-auto" />
                    <ShieldOff className="mx-auto size-10 text-[var(--color-primary)]" />
                    <h1 className="text-lg font-semibold text-[var(--color-secondary)]">Panele erişiminiz yok</h1>
                    <p className="text-sm text-gray-600">
                        <span className="font-medium">{o.email}</span> hesabı aktif bir personele bağlı değil. Yöneticinizden hesabınızı
                        personel kaydınıza bağlamasını isteyin.
                    </p>
                    <form action={cikisYap}>
                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
                        >
                            <LogOut className="size-4" /> Çıkış Yap
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Menüdeki "Mesajlar" rozeti için okunmamış iletişim mesajı sayısı.
    let okunmamisMesaj = 0;
    if (izinVar(o.rol, "mesajlar")) {
        const supabase = await createClient();
        const { count } = await supabase.from("iletisim_mesajlari").select("id", { count: "exact", head: true }).eq("okundu", false);
        okunmamisMesaj = count ?? 0;
    }

    return (
        <AdminKabuk email={o.email} ad={o.ad} rol={o.rol} okunmamisMesaj={okunmamisMesaj}>
            {children}
        </AdminKabuk>
    );
}
