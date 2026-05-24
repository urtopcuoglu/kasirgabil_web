import type { Metadata } from "next";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
    title: "Mesafeli Satış Sözleşmesi | Kasırga Bilgisayar",
    description: "Kasırga Bilgisayar mesafeli satış sözleşmesi — ürün ve hizmet satın alımlarında geçerli şart ve koşullar.",
};

export default function MesafeliSatisSozlesmesiPage() {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-zinc-800">
            {/* Banner */}
            <div className="bg-gradient-to-r from-[#2C2262] to-[#362C68] text-white py-16 px-4">
                <div className="container mx-auto flex items-center justify-center gap-4">
                    <FileText size={48} className="text-white drop-shadow-md" />
                    <h1 className="text-4xl font-bold drop-shadow-md text-center">Mesafeli Satış Sözleşmesi</h1>
                </div>
            </div>

            {/* İçerik */}
            <main className="container mx-auto py-16 px-4 max-w-4xl">
                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8 space-y-8">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Son güncelleme: Mayıs 2025
                    </p>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded">
                        <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                            Bu sözleşme, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği kapsamında düzenlenmiştir.
                        </p>
                    </div>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)]">Madde 1 — Taraflar</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4 space-y-1">
                                <p className="font-bold text-[var(--color-secondary)]">SATICI</p>
                                <p className="text-gray-700 dark:text-gray-300 text-sm">Kasırga Bilgisayar</p>
                                <p className="text-gray-700 dark:text-gray-300 text-sm">Cumhuriyet Mh. Bayındır-1 Sk. No:5/10 Kızılay - Çankaya / Ankara</p>
                                <p className="text-gray-700 dark:text-gray-300 text-sm">Tel: 0 (312) 311 93 39</p>
                                <p className="text-gray-700 dark:text-gray-300 text-sm">E-posta: info@kasirgabilgisayar.com</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4 space-y-1">
                                <p className="font-bold text-[var(--color-secondary)]">ALICI</p>
                                <p className="text-gray-700 dark:text-gray-300 text-sm">Sipariş veya hizmet talebinde bulunan kişi/kurum.</p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)]">Madde 2 — Konu ve Kapsam</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Bu sözleşme; Kasırga Bilgisayar tarafından sunulan bilgisayar, donanım, yazılım ve teknik servis hizmetlerinin uzaktan (telefon, e-posta veya internet üzerinden) sipariş edilmesi durumunda tarafların hak ve yükümlülüklerini düzenler.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)]">Madde 3 — Ürün/Hizmet Bilgileri</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Satışa sunulan ürün ve hizmetlere ait özellikler, fiyatlar ve koşullar sipariş anında ALICI&apos;ya bildirilen bilgiler doğrultusundadır. SATICI, ürün özelliklerinde önceden bildirim yapmak kaydıyla değişiklik yapma hakkını saklı tutar.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)]">Madde 4 — Ödeme Koşulları</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Ödeme; havale/EFT, nakit veya anlaşmalı ödeme yöntemleriyle gerçekleştirilebilir. Ürün/hizmet bedeli, sipariş onayından önce ALICI&apos;ya bildirilir. Ödeme gerçekleşmeden ürün teslimi veya hizmet ifası başlatılmaz.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)]">Madde 5 — Teslimat ve İfa Koşulları</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Ürünler, ödemenin tamamlanmasının ardından ALICI ile mutabık kalınan süre içinde kargo veya elden teslim edilir. Teknik servis hizmetlerinde, cihazın teslim alınmasından sonra onarım süresi için tahmini bilgi verilir. SATICI, stok veya teknik koşullar nedeniyle teslimat süresini gecikmeden önce ALICI&apos;ya bildirir.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)]">Madde 6 — Cayma Hakkı</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            ALICI, teslim aldığı tarihten itibaren <strong>14 (on dört) gün</strong> içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir. Cayma hakkının kullanılabilmesi için ürünün kullanılmamış, orijinal ambalajında ve faturasıyla birlikte iade edilmesi gerekir.
                        </p>
                        <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4 text-sm text-gray-700 dark:text-gray-300">
                            <p className="font-semibold mb-2">Cayma hakkı kullanılamayan durumlar:</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Ambalajı açılmış yazılım ve ses/görüntü kayıtları</li>
                                <li>Müşteri talebiyle özel olarak üretilen veya kişiselleştirilen ürünler</li>
                                <li>Kullanılmış veya orijinal ambalajı bozulmuş ürünler</li>
                                <li>İfa edilmiş teknik servis hizmetleri</li>
                            </ul>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)]">Madde 7 — Garanti ve Ayıplı Mal</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Satılan ürünler yasal garanti süresince üretici/ithalatçı garantisi kapsamındadır. Ayıplı ürünlerde ALICI; onarım, değişim, bedel iadesi veya indirim talep edebilir. Garanti kapsamı ve koşulları, ürünle birlikte teslim edilen garanti belgesiyle belirlenir.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)]">Madde 8 — Uyuşmazlık Çözümü</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Bu sözleşmeden doğabilecek uyuşmazlıklarda Türk hukuku uygulanır. Tüketici olarak Tüketici Hakem Heyetlerine ve Tüketici Mahkemelerine başvurma hakkınız saklıdır. Ankara mahkemeleri ve icra daireleri ek yetki mercii olarak belirlenmiştir.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)]">Madde 9 — İletişim</h2>
                        <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4 space-y-2 text-gray-700 dark:text-gray-300">
                            <p><strong>Kasırga Bilgisayar</strong></p>
                            <p>Cumhuriyet Mh. Bayındır-1 Sk. No:5/10 Kızılay - Çankaya / Ankara</p>
                            <p>E-posta: info@kasirgabilgisayar.com</p>
                            <p>Tel: 0 (312) 311 93 39</p>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}