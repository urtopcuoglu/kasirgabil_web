"use client";
import React, { useState, useTransition } from 'react';
import { Search, Phone, FileText, ChevronLeft, Loader2, ShieldCheck, Laptop, CalendarPlus, CalendarClock, CheckCircle2 } from 'lucide-react';
import { servisSorgula } from '@/actions/servis-sorgula';
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

type Durum =
    | { tur: 'bos' }
    | { tur: 'bulunamadi' }
    | { tur: 'hata'; mesaj: string }
    | { tur: 'sonuc'; kayit: ServisSorguSonucu };

export default function TeknikServisPage() {
    const [searchPhone, setSearchPhone] = useState('');
    const [searchFormNo, setSearchFormNo] = useState('');
    const [durum, setDurum] = useState<Durum>({ tur: 'bos' });
    const [bekliyor, startTransition] = useTransition();

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        startTransition(async () => {
            const sonuc = await servisSorgula(searchFormNo, searchPhone);
            if ('hata' in sonuc) setDurum({ tur: 'hata', mesaj: sonuc.hata });
            else if (!sonuc.kayit) setDurum({ tur: 'bulunamadi' });
            else setDurum({ tur: 'sonuc', kayit: sonuc.kayit });
        });
    };

    const handleReset = () => {
        setSearchPhone('');
        setSearchFormNo('');
        setDurum({ tur: 'bos' });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Page Header */}
            <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white py-8 px-4">
                <div className="container mx-auto">
                    <div className="flex items-center space-x-3 mb-4">
                        <ChevronLeft size={28} />
                        <h1 className="text-4xl font-bold">Teknik Servis Sorgulama</h1>
                    </div>
                    <p className="text-lg opacity-90">Bıraktığınız cihazın durumunu, servis fişinizdeki form numarası ve telefon numaranızla sorgulayabilirsiniz.</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Search Section */}
                    <div className="lg:col-span-4">
                        <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 sticky top-4">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                                <Search size={24} className="text-[var(--color-primary)]" />
                                <span>Cihaz Sorgula</span>
                            </h2>

                            <div className="space-y-4">
                                {/* Form No */}
                                <div>
                                    <label htmlFor="form_no" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                                        <FileText size={16} className="text-[var(--color-primary)]" />
                                        <span>Form No</span>
                                    </label>
                                    <input
                                        id="form_no"
                                        type="text"
                                        required
                                        autoComplete="off"
                                        placeholder="Servis fişinizdeki numara"
                                        value={searchFormNo}
                                        onChange={(e) => setSearchFormNo(e.target.value)}
                                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)] transition-colors duration-300 text-gray-700"
                                    />
                                </div>

                                {/* Telefon Numarası */}
                                <div>
                                    <label htmlFor="telefon" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                                        <Phone size={16} className="text-[var(--color-primary)]" />
                                        <span>Telefon Numarası</span>
                                    </label>
                                    <input
                                        id="telefon"
                                        type="tel"
                                        required
                                        autoComplete="tel"
                                        placeholder="0555 123 45 67"
                                        value={searchPhone}
                                        onChange={(e) => setSearchPhone(e.target.value)}
                                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)] transition-colors duration-300 text-gray-700"
                                    />
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={bekliyor}
                                        className="flex-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 transform active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:hover:scale-100"
                                    >
                                        {bekliyor ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                                        <span>{bekliyor ? 'Sorgulanıyor' : 'Sorgula'}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="flex-1 bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg hover:bg-gray-400 hover:shadow-lg transition-all duration-300 transform active:scale-95"
                                    >
                                        Sıfırla
                                    </button>
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="mt-6 bg-blue-50 border-l-4 border-[var(--color-primary)] p-4 rounded">
                                <p className="text-sm text-gray-700 flex gap-2">
                                    <ShieldCheck size={18} className="shrink-0 text-[var(--color-primary)]" />
                                    <span>
                                        Kişisel verilerinizin güvenliği için sorgulama yalnızca <strong>form numarası ve servis kaydındaki telefon numarası birlikte</strong> girildiğinde yapılır.
                                    </span>
                                </p>
                            </div>
                        </form>
                    </div>

                    {/* Results Section */}
                    <div className="lg:col-span-8">
                        {durum.tur === 'bos' && (
                            <BilgiPaneli
                                baslik="Cihazınızın durumunu sorgulayın"
                                aciklama="Form numaranızı ve telefon numaranızı girip Sorgula butonuna basın."
                            />
                        )}
                        {durum.tur === 'bulunamadi' && (
                            <BilgiPaneli
                                baslik="Kayıt Bulunamadı"
                                aciklama="Girilen form numarası ve telefon numarasıyla eşleşen bir servis kaydı yok. Bilgileri servis fişinizle karşılaştırıp tekrar deneyin veya bizi arayın."
                            />
                        )}
                        {durum.tur === 'hata' && <BilgiPaneli baslik="Sorgulama yapılamadı" aciklama={durum.mesaj} />}
                        {durum.tur === 'sonuc' && <SonucKarti kayit={durum.kayit} />}
                    </div>
                </div>
            </div>
        </div>
    );
}

function BilgiPaneli({ baslik, aciklama }: { baslik: string; aciklama: string }) {
    return (
        <div className="bg-white rounded-lg shadow-lg p-12 border border-gray-200 flex items-center justify-center min-h-96">
            <div className="text-center max-w-md">
                <Search size={64} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">{baslik}</h3>
                <p className="text-gray-500">{aciklama}</p>
            </div>
        </div>
    );
}

function SonucKarti({ kayit }: { kayit: ServisSorguSonucu }) {
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
