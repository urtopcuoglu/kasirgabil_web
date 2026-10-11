// src/app/component_page/ServisSorguKutusu.tsx
// Ana sayfadaki teknik servis sorgulama kutusu. Sonuç aynı yerde açılır; ayrıntılı sayfa: /services/teknik-servis.
"use client";

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowRight, FileText, Loader2, Phone, Search, SearchX, ShieldCheck, X } from 'lucide-react';
import { servisSorgula } from '@/actions/servis-sorgula';
import type { ServisSorguSonucu } from '@/lib/schemas/servis';
import SonucKarti from './ServisSonucKarti';

type Durum =
    | { tur: 'bos' }
    | { tur: 'bulunamadi' }
    | { tur: 'hata'; mesaj: string }
    | { tur: 'sonuc'; kayit: ServisSorguSonucu };

const inputSinifi =
    'w-full rounded-lg border-0 bg-white py-3 pl-10 pr-3 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]';

export default function ServisSorguKutusu() {
    const [formNo, setFormNo] = useState('');
    const [telefon, setTelefon] = useState('');
    const [durum, setDurum] = useState<Durum>({ tur: 'bos' });
    const [bekliyor, startTransition] = useTransition();

    const sorgula = (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const sonuc = await servisSorgula(formNo, telefon);
            if ('hata' in sonuc) setDurum({ tur: 'hata', mesaj: sonuc.hata });
            else if (!sonuc.kayit) setDurum({ tur: 'bulunamadi' });
            else setDurum({ tur: 'sonuc', kayit: sonuc.kayit });
        });
    };

    const temizle = () => {
        setFormNo('');
        setTelefon('');
        setDurum({ tur: 'bos' });
    };

    return (
        <section className="w-full max-w-6xl mx-auto" aria-labelledby="servis-sorgu-baslik">
            <div className="rounded-2xl bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-tertiary)] p-6 text-white shadow-lg sm:p-8">
                <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                    <div>
                        <h2 id="servis-sorgu-baslik" className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
                            <Search size={28} className="shrink-0" /> Cihazınız ne durumda?
                        </h2>
                        <p className="mt-2 text-white/80">
                            Servise bıraktığınız cihazın durumunu, servis fişinizdeki form numarası ve telefon numaranızla hemen öğrenin.
                        </p>
                    </div>

                    <form onSubmit={sorgula} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                        <label className="relative">
                            <span className="sr-only">Form No</span>
                            <FileText size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                required
                                autoComplete="off"
                                placeholder="Form No"
                                value={formNo}
                                onChange={(e) => setFormNo(e.target.value)}
                                className={inputSinifi}
                            />
                        </label>
                        <label className="relative">
                            <span className="sr-only">Telefon Numarası</span>
                            <Phone size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="tel"
                                required
                                autoComplete="tel"
                                placeholder="Telefon Numarası"
                                value={telefon}
                                onChange={(e) => setTelefon(e.target.value)}
                                className={inputSinifi}
                            />
                        </label>
                        <button
                            type="submit"
                            disabled={bekliyor}
                            className="flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-6 py-3 font-semibold text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
                        >
                            {bekliyor ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                            {bekliyor ? 'Sorgulanıyor' : 'Sorgula'}
                        </button>
                        <p className="flex items-start gap-1.5 text-xs text-white/70 sm:col-span-3">
                            <ShieldCheck size={14} className="mt-px shrink-0" />
                            Kişisel verilerinizin güvenliği için sorgulama, form numarası ve servis kaydındaki telefon numarası birlikte girildiğinde yapılır.
                        </p>
                    </form>
                </div>
            </div>

            {durum.tur !== 'bos' && (
                <div className="mt-4 space-y-2" aria-live="polite">
                    {durum.tur === 'sonuc' ? (
                        <SonucKarti kayit={durum.kayit} />
                    ) : (
                        <div role="alert" className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700 shadow-sm">
                            <SearchX size={20} className="shrink-0 text-[var(--color-primary)]" />
                            <p>
                                {durum.tur === 'hata'
                                    ? durum.mesaj
                                    : 'Girilen form numarası ve telefon numarasıyla eşleşen bir servis kaydı bulunamadı. Bilgileri servis fişinizle karşılaştırıp tekrar deneyin.'}
                            </p>
                        </div>
                    )}
                    <div className="flex flex-wrap justify-between gap-2 text-sm">
                        <button type="button" onClick={temizle} className="flex items-center gap-1 text-gray-500 hover:text-gray-800">
                            <X size={14} /> Sonucu kapat
                        </button>
                        <Link href="/services/teknik-servis" className="flex items-center gap-1 font-medium text-[var(--color-secondary)] hover:underline">
                            Teknik servis sayfası <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            )}
        </section>
    );
}
