"use client";
import React, { useState, useTransition } from 'react';
import { Search, Phone, FileText, ChevronLeft, Loader2, ShieldCheck } from 'lucide-react';
import { servisSorgula } from '@/actions/servis-sorgula';
import type { ServisSorguSonucu } from '@/lib/schemas/servis';
import SonucKarti from '@/app/component_page/ServisSonucKarti';

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
