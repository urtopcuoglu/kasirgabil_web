import type { Metadata } from "next";
import { RefreshCw } from "lucide-react";

export const metadata: Metadata = {
    title: "İade ve Değişim Politikası | Kasırga Bilgisayar",
    description: "Kasırga Bilgisayar iade ve değişim politikası — ürün iade, değişim koşulları ve süreçleri hakkında bilgi.",
};

export default function IadeVeDegisimPolitikasiPage() {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-zinc-800">
            {/* Banner */}
            <div className="bg-gradient-to-r from-[#2C2262] to-[#362C68] text-white py-16 px-4">
                <div className="container mx-auto flex items-center justify-center gap-4">
                    <RefreshCw size={48} className="text-white drop-shadow-md" />
                    <h1 className="text-4xl font-bold drop-shadow-md text-center">İade ve Değişim Politikası</h1>
                </div>
            </div>

            {/* İçerik */}
            <main className="container mx-auto py-16 px-4 max-w-4xl">
                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8 space-y-8">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Son güncelleme: Mayıs 2025
                    </p>

                    <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 p-4 rounded">
                        <p className="text-green-800 dark:text-green-300 text-sm">
                            Kasırga Bilgisayar, müşteri memnuniyetini ön planda tutmaktadır. İade ve değişim işlemleriniz için lütfen aşağıdaki koşulları inceleyiniz.
                        </p>
                    </div>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)]">1. İade Hakkı ve Süresi</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Satın aldığınız ürünleri, teslim aldığınız tarihten itibaren <strong>14 (on dört) gün</strong> içinde hiçbir gerekçe göstermeksizin iade etme hakkına sahipsiniz. İade hakkının kullanımı için ürünün kullanılmamış, orijinal ambalajında ve eksiksiz olması gerekmektedir.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)]">2. İade Koşulları</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            İade işlemi için aşağıdaki koşulların sağlanması gerekmektedir:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                            <li>Ürün, teslim tarihinden itibaren 14 gün içinde iade edilmeli</li>
                            <li>Ürün kullanılmamış ve orijinal ambalajında olmalı</li>
                            <li>Tüm aksesuarlar, kablolar ve belgeler eksiksiz olmalı</li>
                            <li>Fatura veya satış belgesi ile birlikte iade edilmeli</li>
                            <li>Ürün üzerinde herhangi bir hasar, çizik veya kirlilik bulunmamalı</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)]">3. İade Edilemeyen Ürünler</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Aşağıdaki ürünler iade kapsamı dışındadır:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                            <li>Ambalajı açılmış ve kurulmuş yazılım lisansları</li>
                            <li>Müşteri tarafından yapılandırılmış veya kurulmuş sistemler</li>
                            <li>Hijyen açısından iade edilmesi uygun olmayan ürünler</li>
                            <li>İfa edilmiş teknik servis ve onarım hizmetleri</li>
                            <li>Müşteri talebiyle özel olarak sipariş edilen ürünler</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)]">4. Değişim Koşulları</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Aldığınız ürünü farklı bir ürünle değiştirmek istiyorsanız, iade koşullarının sağlanması kaydıyla ürününüzü teslim alıp yeni ürününüzü gönderebilirsiniz. Değişim talebinde fiyat farkı söz konusu ise bu fark tarafınızdan karşılanır veya iade edilir.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)]">5. Ayıplı Ürünlerde İade ve Değişim</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Ayıplı (kusurlu/hasarlı) ürün teslim alındığında aşağıdaki haklardan birini kullanabilirsiniz:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { title: "Ücretsiz Onarım", desc: "Ürünün ücretsiz olarak onarılmasını talep etme" },
                                { title: "Değişim", desc: "Ayıpsız benzeriyle değiştirilmesini talep etme" },
                                { title: "Bedel İadesi", desc: "Tüm ödemenin geri alınmasını talep etme" },
                                { title: "İndirim", desc: "Ayıp oranında bedel indirimi talep etme" },
                            ].map((item) => (
                                <div key={item.title} className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4 border-l-4 border-[var(--color-primary)]">
                                    <p className="font-semibold text-[var(--color-secondary)] mb-1">{item.title}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)]">6. İade Süreci</h2>
                        <div className="space-y-4">
                            {[
                                { step: "1", title: "İletişime Geçin", desc: "Telefon veya e-posta ile iade talebinizi bildirin." },
                                { step: "2", title: "Onay Alın", desc: "Talebiniz incelenerek iade onayı verilir." },
                                { step: "3", title: "Ürünü Gönderin", desc: "Ürünü orijinal ambalajı ve faturasıyla birlikte gönderin ya da elden teslim edin." },
                                { step: "4", title: "İade Ödemesi", desc: "Ürün kontrol edildikten sonra ödemeniz en geç 14 gün içinde iade edilir." },
                            ].map((item) => (
                                <div key={item.step} className="flex gap-4 items-start">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-sm">
                                        {item.step}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-[var(--color-secondary)]">{item.title}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)]">7. Kargo Ücreti</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Cayma hakkı kapsamındaki iadelerde kargo ücreti ALICI tarafından karşılanır. Ayıplı veya yanlış ürün gönderimi durumlarında kargo ücreti SATICI tarafından karşılanır.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)]">8. İletişim</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            İade ve değişim işlemleriniz için bizimle iletişime geçebilirsiniz:
                        </p>
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