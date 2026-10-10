// src/app/admin/(panel)/icerik/layout.tsx
// Bu bölüm yalnızca "icerik" iznine sahip rollere açıktır (src/lib/izinler.ts).
import { izinGerekli } from "@/lib/supabase/yetkili";

export default async function Layout({ children }: { children: React.ReactNode }) {
    await izinGerekli("icerik");
    return children;
}
