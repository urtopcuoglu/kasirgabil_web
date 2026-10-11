// src/app/component_page/ServisSonucKarti.tsx
// Teknik servis sorgu sonucu: teknik servis sayfası ve ana sayfadaki sorgulama kutusu kullanır.
import { CalendarClock, CalendarPlus, CheckCircle2, Laptop, Phone } from 'lucide-react';
import { DURUM_KODLARI, SERVIS_DURUMLARI, type ServisSorguSonucu } from '@/lib/schemas/servis';
import { tarihSaatYaz, tarihYaz } from '@/lib/tarih';

// Vitrinde durum renkleri (admin rozetlerinden daha belirgin, beyaz yazılı).
const DURUM_RENKLERI: Record<string, string> = {
    kayit_alindi: 'bg-slate-500',
    parca_bekliyor: 'bg-amber-500',
    musteri_onayi_bekliyor: 'bg-purple-500',
    tamir_asamasinda: 'bg-blue-500',
    teslim_hazir: 'bg-green-500',
    teslim_edildi: 'bg-gray-500',
};

export default function SonucKarti({ kayit }: { kayit: ServisSorguSonucu }) {
    const durumBilgisi = SERVIS_DURUMLARI[kayit.durum];
    // Teslim edildiyse tüm adımlar tamamlanmış sayılır; aksi halde mevcut duruma kadar.
    const mevcutSira = DURUM_KODLARI.indexOf(kayit.durum);
    // Panelde aynı duruma not eklenince geçmişte tekrar eden satırlar oluşur; müşteriye bir kez gösterilir.
    const gecmis = kayit.gecmis.filter((g, i) => i === 0 || g.durum !== kayit.gecmis[i - 1].durum);

    return (
        <div className="bg-white rounded-lg shadow-md border-l-4 border-[var(--color-primary)] p-6 space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-sm text-gray-500 font-semibold">Form No</p>
                    <p className="text-2xl font-bold text-[var(--color-primary)]">{kayit.form_no}</p>
                    <p className="text-gray-600">{kayit.musteri}</p>
                </div>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold text-white ${DURUM_RENKLERI[kayit.durum]}`}>
                    {durumBilgisi.etiket}
                </span>
            </div>

            {/* Süreç adımları */}
            <ol className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {DURUM_KODLARI.map((kod, i) => {
                    const tamam = i <= mevcutSira;
                    return (
                        <li
                            key={kod}
                            className={`rounded-lg border p-2 text-center text-xs font-medium ${
                                i === mevcutSira
                                    ? 'border-[var(--color-primary)] bg-red-50 text-[var(--color-primary)]'
                                    : tamam
                                    ? 'border-green-200 bg-green-50 text-green-700'
                                    : 'border-gray-200 text-gray-400'
                            }`}
                        >
                            {tamam && i !== mevcutSira && <CheckCircle2 size={14} className="mx-auto mb-1" />}
                            {SERVIS_DURUMLARI[kod].etiket}
                        </li>
                    );
                })}
            </ol>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-200 pt-4">
                <div>
                    <p className="text-sm text-gray-500 font-semibold flex items-center gap-1.5">
                        <Laptop size={14} /> Cihaz
                    </p>
                    <p className="text-lg font-bold text-gray-800">{kayit.cihaz}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-semibold">Bildirilen Arıza</p>
                    <p className="text-gray-700 whitespace-pre-line">{kayit.sikayet}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-semibold flex items-center gap-1.5">
                        <CalendarPlus size={14} /> Servis Giriş Tarihi
                    </p>
                    <p className="text-gray-700">{tarihSaatYaz(kayit.giris_tarihi)}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-semibold flex items-center gap-1.5">
                        <CalendarClock size={14} /> {kayit.teslim_tarihi ? 'Teslim Tarihi' : 'Tahmini Hazır Tarihi'}
                    </p>
                    <p className="text-gray-700">
                        {kayit.teslim_tarihi
                            ? tarihSaatYaz(kayit.teslim_tarihi)
                            : kayit.tahmini_teslim_tarihi
                            ? tarihYaz(kayit.tahmini_teslim_tarihi)
                            : 'Henüz belirlenmedi'}
                    </p>
                </div>
            </div>

            {gecmis.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm text-gray-500 font-semibold mb-3">Durum Geçmişi</p>
                    <ol className="space-y-2">
                        {[...gecmis].reverse().map((g, i) => (
                            <li key={`${g.tarih}-${i}`} className="flex items-center gap-3 text-sm">
                                <span className={`size-2.5 rounded-full ${DURUM_RENKLERI[g.durum]}`} />
                                <span className="font-medium text-gray-800">{SERVIS_DURUMLARI[g.durum].etiket}</span>
                                <span className="text-gray-400">{tarihSaatYaz(g.tarih)}</span>
                            </li>
                        ))}
                    </ol>
                </div>
            )}

            <a
                href="tel:+905053877939"
                className="flex items-center justify-center gap-2 border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-semibold py-2 px-4 rounded-lg hover:bg-[var(--color-primary)] hover:text-white transition-all duration-300"
            >
                <Phone size={18} /> Bizi Arayın
            </a>
        </div>
    );
}
