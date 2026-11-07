import Link from 'next/link';
import { Wrench, ScanBarcode, Sparkles, ArrowRight } from 'lucide-react';

import AnaSlider from "@/app/component_page/AnaSlider";
import { siteIcerigi } from "@/lib/icerik";
import ProductCard from "@/app/component_page/ProductCard";
import ServiceCard from "@/app/component_page/ServicesCard";
import BrandCard from "@/app/component_page/BrandCard";
import ServisSorguKutusu from "@/app/component_page/ServisSorguKutusu";
import UrunKarti from "@/app/component_page/UrunKarti";
import { siteKategoriAgaci, sonEklenenSiteUrunleri } from "@/lib/site-urunleri";
import { jsonLd, mutlakAdres } from "@/lib/site-adresi";

// kategoriYolu: panelde tanımlı kategori ağacındaki tam yol; bulunursa kart o kategorinin ürünlerine gider,
// bulunamazsa (veya null ise) tüm ürünler sayfasına gider.
const productCategories: { imageSrc: string; imageAlt: string; title: string; kategoriYolu: string | null; description: string; buttonText: string }[] = [
    {
        imageSrc: '/product_image/pc-oem.jpg',
        imageAlt: 'PC OEM Bileşenleri',
        title: 'PC OEM Ekipmanları',
        kategoriYolu: 'Bilgisayar › Masaüstü',
        description: 'Masaüstü bilgisayarlarınız için en yeni ve en kaliteli OEM bileşenleri burada.',
        buttonText: 'Daha Fazla',
    },
    {
        imageSrc: '/product_image/laptop_1.jpg',
        imageAlt: 'Laptop Parçaları',
        title: 'Laptop',
        kategoriYolu: 'Bilgisayar › Dizüstü',
        description: 'Laptoplarınız için uyumlu ve dayanıklı yedek parçalar ve aksesuarlar.',
        buttonText: 'Daha Fazla',
    },
    {
        imageSrc: '/product_image/nbook_yedek.jpg',
        imageAlt: 'Notebook Yedek Parça',
        title: 'Notebook Yedek Parça',
        kategoriYolu: 'Bilgisayar › Dizüstü › Yedek Parça',
        description: 'Seçili ürünlerde kaçırılmayacak fırsatlar ve büyük indirimler sizi bekliyor.',
        buttonText: 'İncele',
    },
    {
        imageSrc: '/product_image/gaming.jpg',
        imageAlt: 'Gaming PC',
        title: 'Gaming',
        kategoriYolu: null,
        description: 'Yüksek performanslı oyun deneyimi için tasarlanmış ekipmanlar.',
        buttonText: 'Daha Fazla',
    },
    {
        imageSrc: '/product_image/sunucu_network.jpg',
        imageAlt: 'Sunucu ve Network Ürünleri',
        title: 'Sunucu ve Network Ürünleri',
        kategoriYolu: 'Bilgisayar › Çevre Birimleri › Ağ Network Ürünleri',
        description: 'Ofisinizin verimliliğini artıracak son teknoloji ofis ekipmanları.',
        buttonText: 'Daha Fazla',
    },
    {
        imageSrc: '/product_image/cevrebirimler.jpg',
        imageAlt: 'Çevre Birimler',
        title: 'Çevre Birimleri',
        kategoriYolu: 'Bilgisayar › Çevre Birimleri',
        description: 'Hayatınızı kolaylaştıracak ilginç ve sıradışı teknolojik ürünleri keşfedin.',
        buttonText: 'Daha Fazla',
    },
];

const services = [
    {
        imageSrc: '/services/technical-services.jpg',
        title: 'Tamir ve Bakım',
        description: 'Tüm bilgisayar ve bileşenleri için profesyonel tamir, bakım ve onarım hizmeti.',
        buttonText: 'Daha Fazlası',
        buttonLink: '/services/tamir-ve-bakim',
    },
    {
        imageSrc: '/services/web-design.jpg',
        title: 'Web Tasarım Çözümleri',
        description: 'İhtiyaçlarınıza uygun web tasarım, e-ticaret ve dijital pazarlama çözümleri.',
        buttonText: 'Daha Fazlası',
        buttonLink: '/services/web-tasarim-cozumleri',
    },
    {
        imageSrc: '/services/server-network.jpg',
        title: 'Kurumsal Destek',
        description: 'İşletmeler için IT altyapı çözümleri ve 7/24 teknik destek.',
        buttonText: 'Daha Fazlası',
        buttonLink: '/services/kurumsal-destek',
    },
    {
        imageSrc: '/services/alisveris.jpg', // Örnek dördüncü resim
        title: 'Sıfır ve İkinci El Alışveriş',
        description: 'Tüm bilgisayar, donanım ve cihazlarda sıfır ve ikinci el alışveriş imkanı.',
        buttonText: 'Alışveriş Sayfasına Git',
        buttonLink: '/services/sifir-ve-ikinci-el-alisveris',
    },
];

const brands = [
    { brandName: 'Asus', logoSrc: '/brand/asus.png' },
    { brandName: 'Lenovo', logoSrc: '/brand/lenovo.svg' },
    { brandName: 'Apple', logoSrc: '/brand/apple.svg' },
    { brandName: 'ThinkPad', logoSrc: '/brand/thinkpad.png' },
    { brandName: 'Kingston', logoSrc: '/brand/kingston.jpg' },
    { brandName: 'SteelSeries', logoSrc: '/brand/steelseries.png' },
    { brandName: 'HP', logoSrc: '/brand/hp.svg' },
    { brandName: 'AMD', logoSrc: '/brand/amd.svg' },
    { brandName: 'Nvidia', logoSrc: '/brand/nvidia.svg' },
    { brandName: 'Logitech', logoSrc: '/brand/logitech.svg' },
    { brandName: 'Philips', logoSrc: '/brand/philips.svg' },
    { brandName: 'Corsair', logoSrc: '/brand/corsair.png' },
    { brandName: 'Dell', logoSrc: '/brand/dell.png' },
    { brandName: 'Acer', logoSrc: '/brand/acer.svg' },
    { brandName: 'TP-Link', logoSrc: '/brand/tplink.jpg' },
    { brandName: 'Cisco', logoSrc: '/brand/cisco.svg' },
    { brandName: 'MSI', logoSrc: '/brand/msi.jpg' },
    { brandName: 'Hikvision', logoSrc: '/brand/hikvision.jpg' },
    { brandName: 'Intel', logoSrc: '/brand/intel.svg' },
    { brandName: 'Huawei', logoSrc: '/brand/huawei.svg' },
    { brandName: 'Razer', logoSrc: '/brand/razer.svg' },
    { brandName: 'Gigabyte', logoSrc: '/brand/gigabyte.svg' },
    { brandName: 'Seagate', logoSrc: '/brand/seagate.png' },
    { brandName: 'Fujitsu', logoSrc: '/brand/fujitsu.svg' },
];

export default async function Home() {
    // Slider görselleri panelden düzenlenir (site_icerikleri: anasayfa_slider).
    const [slider, iletisim, agac, yeniUrunler] = await Promise.all([
        siteIcerigi('anasayfa_slider'),
        siteIcerigi('iletisim'),
        siteKategoriAgaci(),
        sonEklenenSiteUrunleri(8),
    ]);
    const kategoriLinki = (yol: string | null) => {
        const kategori = yol ? agac.sirali.find((k) => k.yol === yol) : undefined;
        return kategori ? `/urunler?kategori=${kategori.id}` : '/urunler';
    };
    const kategoriAdi = (id: string | null) => (id ? agac.yol(id).split(' › ').pop() : undefined);

    // Yerel işletme yapısal verisi: iletişim bilgileri panelden gelir.
    const isletme = {
        '@context': 'https://schema.org',
        '@type': 'ComputerStore',
        name: 'Kasırga Bilgisayar',
        slogan: 'Güvenin Başkenti',
        url: mutlakAdres('/'),
        logo: mutlakAdres('/logo/logo.png'),
        image: mutlakAdres('/logo/logo.png'),
        telephone: iletisim?.telefonlar?.[0] || undefined,
        email: iletisim?.eposta || undefined,
        address: iletisim?.adres ? { '@type': 'PostalAddress', streetAddress: iletisim.adres, addressCountry: 'TR' } : undefined,
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-zinc-800">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(isletme) }} />

            <main className="flex-1 flex flex-col items-center">
                <AnaSlider slaytlar={slider?.slaytlar ?? []} />

                {/* Main Content Sections (p-8 ve p-20 buraya taşındı) */}
                <div className="p-8 pb-20 gap-16 sm:p-20 flex flex-col items-center">
                    {/* Product Categories Grid */}
                    <section className="w-full max-w-6xl mx-auto py-8">
                        <div className="flex justify-center items-center gap-2 mb-8">
                            <h2 className="text-3xl font-bold text-center text-[var(--color-secondary)] dark:text-white">Ürün Kategorileri</h2>
                            <ScanBarcode size={32} className="text-[var(--color-secondary)] dark:text-white" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {productCategories.map((card, index) => (
                                <ProductCard
                                    key={index}
                                    imageSrc={card.imageSrc}
                                    imageAlt={card.imageAlt}
                                    title={card.title}
                                    description={card.description}
                                    buttonText={card.buttonText}
                                    buttonLink={kategoriLinki(card.kategoriYolu)}
                                />
                            ))}
                        </div>
                    </section>

                    {/* Yeni gelen ürünler: panelde "Siteye ekle" ile yayınlananlar; yayında ürün yoksa bölüm gizlenir. */}
                    {yeniUrunler.length > 0 && (
                        <section className="w-full max-w-7xl mx-auto">
                            <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-3xl font-bold text-[var(--color-secondary)] dark:text-white">Yeni Gelen Ürünler</h2>
                                    <Sparkles size={28} className="text-[var(--color-secondary)] dark:text-white" />
                                </div>
                                <Link href="/urunler" className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-primary)] hover:underline">
                                    Tüm ürünler <ArrowRight size={16} />
                                </Link>
                            </div>
                            <ul className="grid gap-5 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                                {yeniUrunler.map((u) => (
                                    <li key={u.id}>
                                        <UrunKarti urun={u} kategori={kategoriAdi(u.site_kategori_id)} whatsapp={iletisim?.whatsapp} />
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* Teknik servis sorgulama */}
                    <ServisSorguKutusu />
                </div>

                {/* Hizmetlerimiz Section with Background */}
                <div className="w-full bg-[var(--color-primary)] py-16 px-8">
                    <section className="container mx-auto">
                        <div className="flex justify-center items-center gap-2 mb-8">
                            <h2 className="text-3xl font-bold text-center text-white">Hizmetlerimiz</h2>
                            <Wrench size={32} className="text-white" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {services.map((service, index) => (
                                <ServiceCard
                                    key={index}
                                    imageSrc={service.imageSrc}
                                    title={service.title}
                                    description={service.description}
                                    buttonText={service.buttonText}
                                    buttonLink={service.buttonLink}
                                />
                            ))}
                        </div>
                    </section>
                </div>

                {/* Brands Section */}
                <section className="w-full py-16 px-8">
                    <div className="container mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-12 text-[var(--color-secondary)] dark:text-white">Markalarımız</h2>
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                            {brands.map((brand, index) => (
                                <BrandCard key={index} index={index} brandName={brand.brandName} logoSrc={brand.logoSrc} />
                            ))}
                        </div>
                        <p className="text-lg mt-8 text-gray-600 dark:text-gray-300">
                            Ve Diğer Tüm Markalarla Hizmetinizdeyiz...
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
}