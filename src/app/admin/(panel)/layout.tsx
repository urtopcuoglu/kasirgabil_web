// src/app/admin/(panel)/layout.tsx
// Giriş gerektiren admin sayfalarının kabuğu.
// proxy.ts zaten yönlendirme yapar; buradaki kontrol ikinci savunma hattıdır.
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminKabuk from "../_components/AdminKabuk";

export default async function PanelLayout({
                                              children,
                                          }: Readonly<{
    children: React.ReactNode;
}>) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();

    if (!data?.claims) {
        redirect("/admin/giris");
    }

    const email = typeof data.claims.email === "string" ? data.claims.email : "";

    return <AdminKabuk email={email}>{children}</AdminKabuk>;
}
