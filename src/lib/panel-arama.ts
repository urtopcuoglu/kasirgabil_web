// src/lib/panel-arama.ts
// Panel liste sayfalarındaki arama kelimesi adres çubuğunda (?q=) taşınmaz: tarayıcı geçmişine, sunucu/proxy
// kayıtlarına ve kopyalanan linklere düşmesin diye sayfaya özel, JS'in okuyamadığı bir çerezde tutulur.
// Yazan taraf: src/actions/panel-arama.ts → panelFiltreUygula (OtomatikFiltreFormu ve FiltreOzeti kullanır).
import { cookies } from "next/headers";

export const PANEL_ARAMA_EN_UZUN = 100;

// "/admin/stok/kutular" → "panel_ara_admin_stok_kutular". Her liste sayfasının araması ayrıdır.
export const panelAramaCerezi = (yol: string) => `panel_ara${yol.replace(/[^a-z0-9]+/gi, "_")}`;

export async function panelAramasiOku(yol: string) {
    const deger = (await cookies()).get(panelAramaCerezi(yol))?.value ?? "";
    return deger.trim().slice(0, PANEL_ARAMA_EN_UZUN);
}
