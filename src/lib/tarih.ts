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

// timestamptz → "14:35"
export function saatYaz(iso: string) {
    return new Intl.DateTimeFormat("tr-TR", { timeZone: SAAT_DILIMI, hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

// date ("2026-10-10") → "10.10.2026". Saat dilimi kaymasını önlemek için elle ayrıştırılır.
export function tarihYaz(gun: string) {
    const [yil, ay, gunNo] = gun.split("-");
    return `${gunNo}.${ay}.${yil}`;
}

// Para tutarı → "1.250,00 ₺"
export function paraYaz(tutar: number) {
    return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(tutar);
}

// Tarih aralığı filtreleri için gün sınırları. Türkiye sabit UTC+3 olduğu için bu ofset kullanılır.
// "2026-10-10" → "2026-10-10T00:00:00+03:00"
export function gunBasi(gun: string) {
    return `${gun}T00:00:00+03:00`;
}

// Bitiş tarihini dahil etmek için ertesi günün başlangıcı ("<" ile kullanılır).
export function sonrakiGunBasi(gun: string) {
    const d = new Date(`${gun}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + 1);
    return gunBasi(d.toISOString().slice(0, 10));
}

// Bugünün tarihi Türkiye saatine göre "YYYY-MM-DD".
export function bugunISO() {
    return new Intl.DateTimeFormat("en-CA", { timeZone: SAAT_DILIMI }).format(new Date());
}

// "2026-10-10" + n gün → "2026-10-11" (saat diliminden bağımsız).
export function gunEkle(gun: string, n: number) {
    const d = new Date(`${gun}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
}

// "2026-10-10" → "10 Ekim 2026 Cumartesi"
export function uzunTarihYaz(gun: string) {
    return new Intl.DateTimeFormat("tr-TR", { timeZone: "UTC", day: "numeric", month: "long", year: "numeric", weekday: "long" }).format(
        new Date(`${gun}T00:00:00Z`)
    );
}
