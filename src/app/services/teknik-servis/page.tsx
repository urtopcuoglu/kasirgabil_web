"use client";
import React, { useState } from 'react';
import { Search, Phone, FileText, User, ChevronLeft } from 'lucide-react';

interface ServiceRecord {
    id: number;
    phone: string;
    formNo: string;
    name: string;
    device: string;
    problemDescription: string;
    serviceStatus: string;
    entryDate: string;
    estimatedDate: string;
}

export default function TeknikServisPage() {
    const [searchPhone, setSearchPhone] = useState('');
    const [searchFormNo, setSearchFormNo] = useState('');
    const [searchName, setSearchName] = useState('');
    const [searchResults, setSearchResults] = useState<ServiceRecord[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    // Mock veri - İleride gerçek API ile değiştirilecek
    const mockServiceData = [
        {
            id: 1,
            phone: '05551234567',
            formNo: 'TS001',
            name: 'Ahmet Yılmaz',
            device: 'Laptop ASUS',
            problemDescription: 'Ekran arızası',
            serviceStatus: 'Tamir Aşamasında',
            entryDate: '2024-01-10',
            estimatedDate: '2024-01-15',
        },
        {
            id: 2,
            phone: '05559876543',
            formNo: 'TS002',
            name: 'Ayşe Kaya',
            device: 'Masaüstü Bilgisayar',
            problemDescription: 'Güç kaynağı sorunu',
            serviceStatus: 'Bakım Aşamasında',
            entryDate: '2024-01-08',
            estimatedDate: '2024-01-12',
        },
        {
            id: 3,
            phone: '05552345678',
            formNo: 'TS003',
            name: 'Mehmet Demir',
            device: 'Dell Monitor',
            problemDescription: 'Renk problemi',
            serviceStatus: 'Teslim Hazır',
            entryDate: '2024-01-05',
            estimatedDate: '2024-01-10',
        },
    ];

    const handleSearch = () => {
        setHasSearched(true);

        // Arama filtresi uygula
        const results = mockServiceData.filter((item) => {
            const phoneMatch = !searchPhone || item.phone.includes(searchPhone);
            const formNoMatch = !searchFormNo || item.formNo.toLowerCase().includes(searchFormNo.toLowerCase());
            const nameMatch = !searchName || item.name.toLowerCase().includes(searchName.toLowerCase());

            return phoneMatch && formNoMatch && nameMatch;
        });

        setSearchResults(results);
    };

    const handleReset = () => {
        setSearchPhone('');
        setSearchFormNo('');
        setSearchName('');
        setSearchResults([]);
        setHasSearched(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb Navigation */}


            {/* Page Header */}
            <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white py-8 px-4">
                <div className="container mx-auto">
                    <div className="flex items-center space-x-3 mb-4">
                        <ChevronLeft size={28} />
                        <h1 className="text-4xl font-bold">Teknik Servis Sorgulama</h1>
                    </div>
                    <p className="text-lg opacity-90">Bıraktığınız cihazın durumunu sorgulamak için aşağıdaki alanları doldurunuz.</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Search Section */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 sticky top-4">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                                <Search size={24} className="text-[var(--color-primary)]" />
                                <span>Cihaz Sorgula</span>
                            </h2>

                            {/* Search Input Fields */}
                            <div className="space-y-4">
                                {/* Telefon Numarası */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                                        <Phone size={16} className="text-[var(--color-primary)]" />
                                        <span>Telefon Numarası (Opsiyonel)</span>
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="05551234567"
                                        value={searchPhone}
                                        onChange={(e) => setSearchPhone(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)] transition-colors duration-300 text-gray-700"
                                    />
                                </div>

                                {/* Form No */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                                        <FileText size={16} className="text-[var(--color-primary)]" />
                                        <span>Form No (Opsiyonel)</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="TS001"
                                        value={searchFormNo}
                                        onChange={(e) => setSearchFormNo(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)] transition-colors duration-300 text-gray-700"
                                    />
                                </div>

                                {/* İsim Soyisim */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                                        <User size={16} className="text-[var(--color-primary)]" />
                                        <span>İsim Soyisim (Opsiyonel)</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ahmet Yılmaz"
                                        value={searchName}
                                        onChange={(e) => setSearchName(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)] transition-colors duration-300 text-gray-700"
                                    />
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={handleSearch}
                                        className="flex-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 transform active:scale-95 flex items-center justify-center space-x-2"
                                    >
                                        <Search size={18} />
                                        <span>Ara</span>
                                    </button>
                                    <button
                                        onClick={handleReset}
                                        className="flex-1 bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg hover:bg-gray-400 hover:shadow-lg transition-all duration-300 transform active:scale-95"
                                    >
                                        Sıfırla
                                    </button>
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="mt-6 bg-blue-50 border-l-4 border-[var(--color-primary)] p-4 rounded">
                                <p className="text-sm text-gray-700">
                                    <strong>Bilgi:</strong> En az bir alanı doldurup aramayı başlatınız. Tüm alanlar opsiyoneldir.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="lg:col-span-8">
                        {!hasSearched ? (
                            <div className="bg-white rounded-lg shadow-lg p-12 border border-gray-200 flex items-center justify-center min-h-96">
                                <div className="text-center">
                                    <Search size={64} className="text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-600 mb-2">ÇOK YAKINDA !</h3>
                                    <p className="text-gray-500">Bu özellik Kasirga_Web v2&apos;de aktif olacaktır.</p>
                                </div>
                            </div>
                        ) : searchResults.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-lg p-12 border border-gray-200 flex items-center justify-center min-h-96">
                                <div className="text-center">
                                    <Search size={64} className="text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-600 mb-2">Sonuç Bulunamadı</h3>
                                    <p className="text-gray-500">Girilen bilgilere ait bir kayıt bulunmamaktadır. Lütfen arama parametrelerini kontrol edinniz.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                                    Arama Sonuçları ({searchResults.length})
                                </h3>
                                {searchResults.map((result, index) => (
                                    <div
                                        key={index}
                                        className="bg-white rounded-lg shadow-md hover:shadow-lg border-l-4 border-[var(--color-primary)] p-6 transition-all duration-300 transform hover:scale-105 hover:border-opacity-100"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <p className="text-sm text-gray-500 font-semibold">Form No</p>
                                                <p className="text-lg font-bold text-[var(--color-primary)]">{result.formNo}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 font-semibold">Müşteri Adı</p>
                                                <p className="text-lg font-bold text-gray-800">{result.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 font-semibold">Telefon Numarası</p>
                                                <p className="text-lg font-bold text-gray-800">{result.phone}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 font-semibold">Cihaz</p>
                                                <p className="text-lg font-bold text-gray-800">{result.device}</p>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-200 pt-4 mt-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-500 font-semibold">Problem Tanımı</p>
                                                    <p className="text-gray-700">{result.problemDescription}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 font-semibold">Durum</p>
                                                    <div className="flex items-center space-x-2">
                                                        <div
                                                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold text-white ${
                                                                result.serviceStatus === 'Teslim Hazır'
                                                                    ? 'bg-green-500'
                                                                    : result.serviceStatus === 'Tamir Aşamasında'
                                                                    ? 'bg-yellow-500'
                                                                    : 'bg-blue-500'
                                                            }`}
                                                        >
                                                            {result.serviceStatus}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-200 pt-4 mt-4">
                                            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-500 font-semibold">Servis Giriş Tarihi</p>
                                                    <p className="text-gray-700">{result.entryDate}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 font-semibold">Tahmini Hazır Tarihi</p>
                                                    <p className="text-gray-700">{result.estimatedDate}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <div className="mt-4 flex gap-2">
                                            <button className="flex-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-300 transform active:scale-95">
                                                Detayları Gör
                                            </button>
                                            <button className="flex-1 border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-semibold py-2 px-4 rounded-lg hover:bg-[var(--color-primary)] hover:text-white transition-all duration-300">
                                                İletişim Kurma
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

