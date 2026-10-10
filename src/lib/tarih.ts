// src/lib/tarih.ts
// Tarihler sunucunun saat diliminden bağımsız olarak her zaman Türkiye saatiyle gösterilir.
const SAAT_DILIMI = "Europe/Istanbul";

// timestamptz → "10.10.2026 14:35"
export function tarihSaatYaz(iso: string) {
    return new Intl.DateTimeFormat("tr-TR", {
        timeZone: SAAT_DILIMI,
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(iso));
}

// date ("2026-10-10") → "10.10.2026". Saat dilimi kaymasını önlemek için elle ayrıştırılır.
export function tarihYaz(gun: string) {
    const [yil, ay, gunNo] = gun.split("-");
    return `${gunNo}.${ay}.${yil}`;
}

// Bugünün tarihi Türkiye saatine göre "YYYY-MM-DD".
export function bugunISO() {
    return new Intl.DateTimeFormat("en-CA", { timeZone: SAAT_DILIMI }).format(new Date());
}
