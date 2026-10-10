// src/app/(site)/layout.tsx
// Vitrin sayfalarının ortak kabuğu. (site) bir route group'tur; URL'lere yansımaz.
// İletişim bilgileri ve banka hesapları panelden düzenlenir (site_icerikleri).
import Header from "@/app/component_page/header";
import Footer from "@/app/component_page/footer";
import { siteIcerigi } from "@/lib/icerik";

// Sayfalar önbellekten sunulur; panelden kayıt yapılınca revalidatePath ile hemen yenilenir.
// 5 dakikalık süre, ileri tarihli blog yazılarının kendiliğinden görünmesi içindir (sabit sayı olmalı).
export const revalidate = 300;

export default async function SiteLayout({
                                             children,
                                         }: Readonly<{
    children: React.ReactNode;
}>) {
    const [iletisim, banka] = await Promise.all([siteIcerigi("iletisim"), siteIcerigi("banka_hesaplari")]);

    return (
        <>
            <Header iletisim={iletisim} bankaHesaplari={banka?.hesaplar ?? []} />
            <main>{children}</main>
            <Footer iletisim={iletisim} />
        </>
    );
}
