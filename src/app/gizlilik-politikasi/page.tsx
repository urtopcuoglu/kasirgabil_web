import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
    title: "Gizlilik Politikası | Kasırga Bilgisayar",
    description: "Kasırga Bilgisayar gizlilik politikası — kişisel verilerinizin nasıl toplandığı, kullanıldığı ve korunduğu hakkında bilgi.",
};

export default function GizlilikPolitikasiPage() {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-zinc-800">
            {/* Banner */}
            <div className="bg-gradient-to-r from-[#2C2262] to-[#362C68] text-white py-16 px-4">
                <div className="container mx-auto flex items-center justify-center gap-4">
                    <ShieldCheck size={48} className="text-white drop-shadow-md" />
                    <h1 className="text-5xl font-bold drop-shadow-md">Gizlilik Politikası</h1>
                </div>
            </div>

            {/* İçerik */}
            <main className="container mx-auto py-16 px-4 max-w-4xl">
                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8 space-y-8">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Son güncelleme: Mayıs 2025
                    </p>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)]">1. Genel Bilgi</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Kasırga Bilgisayar olarak, müşterilerimizin kişisel verilerinin gizliliğine büyük önem vermekteyiz. Bu gizlilik politikası, web sitemizi ziyaret ettiğinizde veya hizmetlerimizden yararlandığınızda hangi bilgilerin toplandığını, bu bilgilerin nasıl kullanıldığını ve korunduğunu açıklamaktadır.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)]">2. Toplanan Bilgiler</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Web sitemizi ziyaret ettiğinizde veya iletişim formumuzu kullandığınızda aşağıdaki bilgiler toplanabilir:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                            <li>Ad ve soyad</li>
                            <li>E-posta adresi</li>
                            <li>Telefon numarası</li>
                            <li>Teknik servis talebi bilgileri</li>
                            <li>IP adresi ve tarayıcı bilgileri (analitik amaçlı)</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)]">3. Bilgilerin Kullanım Amacı</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Toplanan kişisel bilgiler yalnızca aşağıdaki amaçlar için kullanılmaktadır:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                            <li>Teknik servis ve müşteri hizmetleri taleplerinin karşılanması</li>
                            <li>İletişim formunuza yanıt verilmesi</li>
                            <li>Kampanya ve duyurulardan haberdar edilmeniz (onayınız dahilinde)</li>
                            <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)]">4. Üçüncü Taraflarla Paylaşım</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Kişisel verileriniz; açık rızanız olmaksızın, yasal zorunluluk bulunmadıkça veya hizmet sunumu için zorunlu olmadıkça üçüncü taraflarla paylaşılmaz. Hizmet sağlayıcılarımız yalnızca hizmetin ifası için gerekli bilgilere erişir ve bu bilgileri başka amaçlarla kullanamazlar.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)]">5. Çerezler (Cookies)</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Web sitemiz, kullanıcı deneyimini iyileştirmek amacıyla çerezler kullanabilir. Tarayıcınızın ayarlarından çerezleri devre dışı bırakabilirsiniz; ancak bu durumda sitenin bazı özellikleri düzgün çalışmayabilir.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)]">6. Veri Güvenliği</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Kişisel verileriniz, yetkisiz erişim, değiştirme, ifşa veya imhaya karşı korumak için uygun teknik ve idari güvenlik önlemleri alınarak saklanmaktadır.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)]">7. Haklarınız</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            KVKK kapsamında aşağıdaki haklara sahipsiniz:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                            <li>İşlenmişse buna ilişkin bilgi talep etme</li>
                            <li>Yanlış verilerin düzeltilmesini isteme</li>
                            <li>Verilerinizin silinmesini veya yok edilmesini talep etme</li>
                            <li>İşlemeye itiraz etme</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)]">8. İletişim</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Gizlilik politikamıza ilişkin sorularınız için bizimle iletişime geçebilirsiniz:
                        </p>
                        <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4 space-y-2 text-gray-700 dark:text-gray-300">
                            <p><strong>Kasırga Bilgisayar</strong></p>
                            <p>Cumhuriyet Mh. Bayındır-1 Sk. No:5/10 Kızılay - Çankaya / Ankara</p>
                            <p>E-posta: info@kasirgabilgisayar.com</p>
                            <p>Tel: 0 (312) 312 60 11</p>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}