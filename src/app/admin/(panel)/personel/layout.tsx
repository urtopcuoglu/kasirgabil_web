// src/app/admin/(panel)/personel/layout.tsx
// Bu bölüm yalnızca "personel" iznine sahip rollere açıktır (src/lib/izinler.ts).
import { izinGerekli } from "@/lib/supabase/yetkili";

export default async function Layout({ children }: { children: React.ReactNode }) {
    await izinGerekli("personel");
    return children;
}
