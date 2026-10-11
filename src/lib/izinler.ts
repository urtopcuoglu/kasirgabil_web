// src/lib/izinler.ts
// Rol → izin tablosu. Veritabanındaki RLS politikalarıyla (migration 20261011020000_faz6_roller.sql) aynı olmalı;
// burası menüyü, düğmeleri ve sayfa erişimini belirler, asıl koruma RLS'tedir.
import type { Rol } from "@/lib/schemas/personel";

export const IZINLER = {
    servis_yaz: ["yonetici", "teknisyen"], // servis kaydı aç/düzenle, durum, ücret kalemleri
    stok_yonet: ["yonetici"], // ürün, kutu, kategori ekle/düzenle/sil
    stok_hareket: ["yonetici", "teknisyen"], // stok girişi/çıkışı/sayım
    kasa: ["yonetici", "kasa"], // kasa hareketleri, gün kapatma
    kasa_yonet: ["yonetici"], // günü yeniden açma, hareket silme, kasa kategorileri
    icerik: ["yonetici"], // site içerikleri ve blog
    mesajlar: ["yonetici"], // iletişim formundan gelen mesajlar
    personel: ["yonetici"], // personel ve panel girişleri
    sil: ["yonetici"], // servis, rehber, kargo vb. kayıt silme
} as const satisfies Record<string, readonly Rol[]>;

export type Izin = keyof typeof IZINLER;

export const izinVar = (rol: Rol | null | undefined, izin: Izin) => !!rol && (IZINLER[izin] as readonly Rol[]).includes(rol);

export const YETKI_HATASI = "Bu işlem için yetkiniz yok.";
