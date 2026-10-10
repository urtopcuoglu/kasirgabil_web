// src/proxy.ts
// Next.js 16 proxy'si (eski adı middleware). Yalnızca /admin altında çalışır;
// vitrin sayfaları statik kalır ve Supabase'e istek atmaz.
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
    return updateSession(request);
}

export const config = {
    matcher: ["/admin", "/admin/:path*"],
};
