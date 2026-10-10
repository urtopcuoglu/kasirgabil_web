// src/app/admin/(panel)/kasa/layout.tsx
// Bu bölüm yalnızca "kasa" iznine sahip rollere açıktır (src/lib/izinler.ts).
import { izinGerekli } from "@/lib/supabase/yetkili";

export default async function Layout({ children }: { children: React.ReactNode }) {
    await izinGerekli("kasa");
    return children;
}
