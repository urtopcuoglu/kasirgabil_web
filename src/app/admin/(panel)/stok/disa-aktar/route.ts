// src/app/admin/(panel)/stok/disa-aktar/route.ts
// Stok listesini liste sayfasındaki filtre ve sıralamayla (sayfalamasız) PDF, Excel veya CSV olarak indirir.
// /admin/stok/disa-aktar?bicim=pdf|xlsx|csv&q=...&kategori=...
import { readFile } from "node:fs/promises";
import path from "node:path";
import ExcelJS from "exceljs";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFFont } from "pdf-lib";
import { createClient } from "@/lib/supabase/server";
import { oturum } from "@/lib/supabase/yetkili";
import { kategoriAgaci, URUN_DURUMLARI, type Kutu, type Urun, type UrunKategori } from "@/lib/schemas/stok";
import { secenekOku } from "../../../_components/liste";
import { stokFiltreleriOku, stokSorgusu } from "../filtreler";

const BICIMLER = ["pdf", "xlsx", "csv"] as const;
const SAYFA = 1000; // PostgREST tek istekte en fazla 1000 satır döndürür

type Satir = Pick<
    Urun,
    "stok_kodu" | "ad" | "marka" | "model" | "kategori_id" | "durum" | "stok_adedi" | "min_stok" | "satis_fiyati" | "sitede" | "site_stok_kapali"
> & { kutular: Pick<Kutu, "kutu_no"> | null };

// Sütunlar: başlık, genişlik (PDF'te pt, Excel'de karakter) ve değer.
type Sutun = { baslik: string; pdf: number; excel: number; sag?: boolean; deger: (u: Satir) => string | number | null };

export async function GET(istek: Request) {
    if (!(await oturum())) return new Response("Oturum gerekli.", { status: 401 });

    const parametreler = Object.fromEntries(new URL(istek.url).searchParams);
    const bicim = secenekOku(parametreler.bicim, BICIMLER, "csv");
    const f = stokFiltreleriOku(parametreler);

    const supabase = await createClient();
    const { data: kategoriData } = await supabase.from("urun_kategorileri").select("id, ad, ust_id, kutu_sistemi");
    const agac = kategoriAgaci((kategoriData ?? []) as UrunKategori[]);

    const satirlar: Satir[] = [];
    for (let bas = 0; ; bas += SAYFA) {
        const { data, error } = await stokSorgusu(
            supabase,
            "stok_kodu, ad, marka, model, kategori_id, durum, stok_adedi, min_stok, satis_fiyati, sitede, site_stok_kapali, kutular(kutu_no)",
            f,
            agac
        ).range(bas, bas + SAYFA - 1);
        if (error) return new Response("Stok listesi okunamadı.", { status: 500 });
        satirlar.push(...((data ?? []) as unknown as Satir[]));
        if (!data || data.length < SAYFA) break;
    }

    const sutunlar: Sutun[] = [
        { baslik: "Stok Kodu", pdf: 62, excel: 12, deger: (u) => u.stok_kodu },
        { baslik: "Ürün", pdf: 189, excel: 40, deger: (u) => u.ad },
        { baslik: "Marka", pdf: 62, excel: 14, deger: (u) => u.marka },
        { baslik: "Model", pdf: 82, excel: 18, deger: (u) => u.model },
        { baslik: "Kategori", pdf: 150, excel: 40, deger: (u) => agac.yol(u.kategori_id) },
        { baslik: "Kutu", pdf: 34, excel: 8, sag: true, deger: (u) => u.kutular?.kutu_no ?? null },
        { baslik: "Durum", pdf: 50, excel: 11, deger: (u) => URUN_DURUMLARI[u.durum].etiket },
        { baslik: "Stok", pdf: 34, excel: 8, sag: true, deger: (u) => u.stok_adedi },
        { baslik: "Min.", pdf: 30, excel: 8, sag: true, deger: (u) => u.min_stok },
        { baslik: "Satış (₺)", pdf: 58, excel: 14, sag: true, deger: (u) => (u.satis_fiyati == null ? null : Number(u.satis_fiyati)) },
        { baslik: "Sitede", pdf: 50, excel: 14, deger: (u) => (!u.sitede ? "Hayır" : u.site_stok_kapali ? "Evet (stok kapalı)" : "Evet") },
    ];

    const tarih = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Istanbul" }); // 2026-10-27
    const dosyaAdi = `stok-listesi-${tarih}.${bicim}`;
    const icerik =
        bicim === "pdf" ? await pdfOlustur(satirlar, sutunlar, tarih) : bicim === "xlsx" ? await excelOlustur(satirlar, sutunlar) : csvOlustur(satirlar, sutunlar);

    return new Response(icerik, {
        headers: {
            "Content-Type": {
                pdf: "application/pdf",
                xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                csv: "text/csv; charset=utf-8",
            }[bicim],
            "Content-Disposition": `attachment; filename="${dosyaAdi}"`,
            "Cache-Control": "no-store",
        },
    });
}

// ─── CSV ────────────────────────────────────────────────────

// Excel'in Türkçe bölge ayarı ";" ayırıcı bekler; BOM ile UTF-8 olarak tanınır. Sayılar virgüllü ondalıkla yazılır.
function csvOlustur(satirlar: Satir[], sutunlar: Sutun[]) {
    const hucre = (v: string | number | null) => {
        if (v == null) return "";
        const metin = typeof v === "number" ? String(v).replace(".", ",") : v;
        // Formül enjeksiyonuna karşı (=, +, -, @ ile başlayan metinler) başına ' eklenir.
        const guvenli = typeof v === "string" && /^[=+\-@\t\r]/.test(metin) ? `'${metin}` : metin;
        return /[";\n\r]/.test(guvenli) ? `"${guvenli.replace(/"/g, '""')}"` : guvenli;
    };
    const satirMetinleri = [sutunlar.map((s) => hucre(s.baslik)).join(";"), ...satirlar.map((u) => sutunlar.map((s) => hucre(s.deger(u))).join(";"))];
    return "﻿" + satirMetinleri.join("\r\n");
}

// ─── Excel ──────────────────────────────────────────────────

async function excelOlustur(satirlar: Satir[], sutunlar: Sutun[]) {
    const kitap = new ExcelJS.Workbook();
    kitap.creator = "Kasırga Bilgisayar";
    const sayfa = kitap.addWorksheet("Stok", { views: [{ state: "frozen", ySplit: 1 }] });
    sayfa.columns = sutunlar.map((s) => ({ header: s.baslik, width: s.excel }));
    for (const u of satirlar) sayfa.addRow(sutunlar.map((s) => s.deger(u)));

    const baslik = sayfa.getRow(1);
    baslik.font = { bold: true, color: { argb: "FFFFFFFF" } };
    baslik.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2C2262" } };
    sutunlar.forEach((s, i) => {
        if (s.sag) sayfa.getColumn(i + 1).alignment = { horizontal: "right" };
    });
    sayfa.getColumn(sutunlar.findIndex((s) => s.baslik.startsWith("Satış")) + 1).numFmt = "#,##0.00";
    sayfa.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: sutunlar.length } };

    return new Uint8Array(await kitap.xlsx.writeBuffer());
}

// ─── PDF ────────────────────────────────────────────────────

// Standart PDF fontlarında ş, ğ, ı yok; Türkçe karakterler için Noto Sans gömülür.
const FONT_KLASORU = path.join(process.cwd(), "src/assets/fonts");

async function pdfOlustur(satirlar: Satir[], sutunlar: Sutun[], tarih: string) {
    const belge = await PDFDocument.create();
    belge.registerFontkit(fontkit);
    belge.setTitle(`Stok Listesi ${tarih}`);
    const [normal, kalin] = await Promise.all([
        readFile(path.join(FONT_KLASORU, "NotoSans-Regular.ttf")).then((b) => belge.embedFont(b, { subset: true })),
        readFile(path.join(FONT_KLASORU, "NotoSans-Bold.ttf")).then((b) => belge.embedFont(b, { subset: true })),
    ]);

    const [genislik, yukseklik] = [841.89, 595.28]; // A4 yatay
    const kenar = 20;
    const satirYuksekligi = 15;
    const yazi = 7.5;
    const lacivert = rgb(0.17, 0.13, 0.38);
    const para = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Sütuna sığmayan metin "…" ile kısaltılır.
    const sigdir = (metin: string, font: PDFFont, azami: number) => {
        if (font.widthOfTextAtSize(metin, yazi) <= azami) return metin;
        let kisa = metin;
        while (kisa.length > 1 && font.widthOfTextAtSize(`${kisa}…`, yazi) > azami) kisa = kisa.slice(0, -1);
        return `${kisa}…`;
    };
    const metinYap = (s: Sutun, u: Satir) => {
        const v = s.deger(u);
        if (v == null) return "";
        return typeof v === "number" && s.baslik.startsWith("Satış") ? para.format(v) : String(v);
    };

    let sayfa = belge.addPage([genislik, yukseklik]);
    let y = 0;
    const yeniSayfa = (ilk: boolean) => {
        if (!ilk) sayfa = belge.addPage([genislik, yukseklik]);
        y = yukseklik - kenar;
        if (ilk) {
            sayfa.drawText("Kasırga Bilgisayar · Stok Listesi", { x: kenar, y: y - 12, size: 13, font: kalin, color: lacivert });
            const ozet = `${tarih} · ${satirlar.length} ürün · ${satirlar.reduce((t, u) => t + u.stok_adedi, 0)} adet`;
            sayfa.drawText(ozet, { x: genislik - kenar - normal.widthOfTextAtSize(ozet, 8), y: y - 10, size: 8, font: normal });
            y -= 26;
        }
        // Başlık satırı
        sayfa.drawRectangle({ x: kenar, y: y - satirYuksekligi, width: genislik - 2 * kenar, height: satirYuksekligi, color: lacivert });
        let x = kenar;
        for (const s of sutunlar) {
            const metin = sigdir(s.baslik, kalin, s.pdf - 6);
            const mx = s.sag ? x + s.pdf - 3 - kalin.widthOfTextAtSize(metin, yazi) : x + 3;
            sayfa.drawText(metin, { x: mx, y: y - 10.5, size: yazi, font: kalin, color: rgb(1, 1, 1) });
            x += s.pdf;
        }
        y -= satirYuksekligi;
    };

    yeniSayfa(true);
    satirlar.forEach((u, i) => {
        if (y - satirYuksekligi < kenar + 14) yeniSayfa(false);
        if (i % 2 === 1) {
            sayfa.drawRectangle({ x: kenar, y: y - satirYuksekligi, width: genislik - 2 * kenar, height: satirYuksekligi, color: rgb(0.96, 0.96, 0.97) });
        }
        let x = kenar;
        for (const s of sutunlar) {
            const font = s.baslik === "Stok Kodu" ? kalin : normal;
            const metin = sigdir(metinYap(s, u), font, s.pdf - 6);
            const mx = s.sag ? x + s.pdf - 3 - font.widthOfTextAtSize(metin, yazi) : x + 3;
            sayfa.drawText(metin, {
                x: mx,
                y: y - 10.5,
                size: yazi,
                font,
                color: s.baslik === "Stok" && u.stok_adedi === 0 ? rgb(0.75, 0.1, 0.15) : rgb(0.1, 0.1, 0.1),
            });
            x += s.pdf;
        }
        y -= satirYuksekligi;
    });
    if (satirlar.length === 0) sayfa.drawText("Filtrelere uygun ürün yok.", { x: kenar, y: y - 14, size: 9, font: normal });

    // Sayfa numaraları
    const sayfalar = belge.getPages();
    sayfalar.forEach((s, i) => {
        const metin = `${i + 1} / ${sayfalar.length}`;
        s.drawText(metin, { x: genislik - kenar - normal.widthOfTextAtSize(metin, 7), y: 10, size: 7, font: normal, color: rgb(0.45, 0.45, 0.45) });
    });

    return new Uint8Array(await belge.save());
}
