// src/lib/supabase/client.ts
// Tarayıcı tarafı (Client Component) Supabase istemcisi.
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );
}
