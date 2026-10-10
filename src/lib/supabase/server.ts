// src/lib/supabase/server.ts
// Sunucu tarafı (Server Component / Server Action) Supabase istemcisi.
// Her istek için yeniden oluşturulmalı; global bir değişkende saklanmamalı.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // Server Component içinden çağrıldığında cookie yazılamaz.
                        // Oturum yenileme proxy.ts tarafından yapıldığı için güvenle yok sayılabilir.
                    }
                },
            },
        }
    );
}
