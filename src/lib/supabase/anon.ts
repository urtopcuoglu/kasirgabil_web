// src/lib/supabase/anon.ts
// Vitrin sayfaları için oturumsuz (anonim) Supabase istemcisi.
// Cookie okumadığı için sayfalar statik üretilip önbellekten sunulabilir; RLS yalnızca herkese açık veriyi döndürür.
import { createClient } from "@supabase/supabase-js";

export function anonIstemci() {
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
}
