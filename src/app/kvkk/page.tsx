import type { Metadata } from "next";
import { ShieldHalf } from "lucide-react";

export const metadata: Metadata = {
    title: "KVKK Aydınlatma Metni | Kasırga Bilgisayar",
    description: "Kasırga Bilgisayar KVKK (Kişisel Verilerin Korunması Kanunu) kapsamında hazırlanan aydınlatma metni.",
};

export default function KvkkPage() {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-zinc-800">
            {/* Banner */}
            <div className="bg-gradient-to-r from-[#2C2262] to-[#362C68] text-white py-16 px-4">
                <div className="container mx-auto flex items-center justify-center gap-4">
                    <ShieldHalf size={48} className="text-white drop-shadow-md" />
                    <h1 className="text-4xl font-bold drop-shadow-md text-center">Kişisel Verilerin Korunması Aydınlatma Metni</h1>
                </div>
            </div>

            {/* İçerik */}
            <main className="container mx-auto py-16 px-4 max-w-4xl">
                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8 space-y-8">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Son güncelleme: Mayıs 2025
                    </p>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 rounded">
                        <p className="text-blue-800 dark:text-blue-300 text-sm">
                            Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve ilgili mevzuat kapsamında veri sorumlusu sıfatıyla Kasırga Bilgisayar tarafından hazırlanmıştır.
                        </p>
                    </div>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)]">1. Veri Sorumlusu</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            6698 sayılı KVKK uyarınca kişisel verileriniz; veri sorumlusu sıfatıyla <strong>Kasırga Bilgisayar</strong> (Cumhuriyet Mh. Bayındır-1 Sk. No:5/10 Kızılay - Çankaya / Ankara) tarafından aşağıda açıklanan kapsamda işlenecektir.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)]">2. İşlenen Kişisel Veriler</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            İşletmemiz tarafından işlenebilecek kişisel verileriniz şunlardır:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                            <li><strong>Kimlik verileri:</strong> Ad, soyad</li>
                            <li><strong>İletişim verileri:</strong> Telefon numarası, e-posta adresi, adres</li>
                            <li><strong>İşlem güvenliği verileri:</strong> IP adresi, tarayıcı ve cihaz bilgileri</li>
                            <li><strong>Hizmet talep verileri:</strong> Teknik servis, onarım, satın alma talep bilgileri</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)]">3. Kişisel Verilerin İşlenme Amaçları</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Kişisel verileriniz aşağıdaki amaçlar doğrultusunda işlenmektedir:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                            <li>Ürün ve hizmetlerin sunulması ile satış ve satış sonrası süreçlerin yürütülmesi</li>
                            <li>Teknik servis hizmetlerinin planlanması ve takibi</li>
                            <li>Müşteri ilişkileri yönetimi</li>
                            <li>İletişim faaliyetlerinin yürütülmesi</li>
                            <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                            <li>Şikâyet ve talep yönetimi</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)]">4. Kişisel Verilerin Toplanma Yöntemi ve Hukuki Sebebi</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Kişisel verileriniz; iletişim formları, telefon görüşmeleri, e-posta yazışmaları ve fiziksel başvuru yoluyla toplanmaktadır. Bu veriler; KVKK&apos;nın 5. maddesi uyarınca <em>sözleşmenin kurulması veya ifası</em>, <em>meşru menfaat</em> ve <em>yasal yükümlülüklerin yerine getirilmesi</em> hukuki sebeplerine dayanılarak işlenmektedir.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)]">5. Kişisel Verilerin Aktarılması</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Kişisel verileriniz; yasal zorunluluklar, hizmet sunumu ve meşru menfaat gereklilikleri kapsamında; iş ortaklarımıza, yetkili kamu kurum ve kuruluşlarına ve hizmet aldığımız tedarikçilere aktarılabilir. Bu aktarımlar KVKK ve ilgili mevzuat çerçevesinde gerçekleştirilmektedir.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)]">6. KVKK Kapsamındaki Haklarınız</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            KVKK&apos;nın 11. maddesi uyarınca veri sorumlusuna başvurarak aşağıdaki haklarınızı kullanabilirsiniz:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                            <li>İşlenmişse buna ilişkin bilgi talep etme</li>
                            <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                            <li>Yurt içinde veya dışında aktarıldığı üçüncü kişileri bilme</li>
                            <li>Eksik veya yanlış işlenmiş verilerin düzeltilmesini isteme</li>
                            <li>KVKK&apos;nın 7. maddesi kapsamında silinmesini veya yok edilmesini isteme</li>
                            <li>Düzeltme, silme veya yok etme işlemlerinin aktarılan üçüncü kişilere bildirilmesini isteme</li>
                            <li>Münhasıran otomatik sistemlerle analiz edilmesi durumunda aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
                            <li>Kanuna aykırı işleme nedeniyle zarara uğramanız halinde zararın giderilmesini talep etme</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)]">7. Başvuru Yolu</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Haklarınıza ilişkin taleplerinizi aşağıdaki kanallar üzerinden iletebilirsiniz:
                        </p>
                        <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4 space-y-2 text-gray-700 dark:text-gray-300">
                            <p><strong>Kasırga Bilgisayar</strong></p>
                            <p>Cumhuriyet Mh. Bayındır-1 Sk. No:5/10 Kızılay - Çankaya / Ankara</p>
                            <p>E-posta: info@kasirgabilgisayar.com</p>
                            <p>Tel: 0 (312) 312 60 11</p>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Başvurunuzu yazılı olarak ıslak imzalı şekilde elden, iadeli taahhütlü mektupla veya e-posta yoluyla iletebilirsiniz. Talebiniz en geç 30 gün içinde sonuçlandırılacaktır.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}