// src/app/(site)/layout.tsx
// Vitrin sayfalarının ortak kabuğu. (site) bir route group'tur; URL'lere yansımaz.
import Header from "@/app/component_page/header";
import Footer from "@/app/component_page/footer";

export default function SiteLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Header />
            <main>{children}</main>
            <Footer />
        </>
    );
}
