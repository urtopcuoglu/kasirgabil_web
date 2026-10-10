// src/app/admin/(panel)/personel/yeni/page.tsx
import type { Metadata } from "next";
import { SayfaBasligi } from "../../../_components/form";
import PersonelFormu from "../PersonelFormu";

export const metadata: Metadata = {
    title: "Yeni Personel",
};

export default function YeniPersonelSayfasi() {
    return (
        <div>
            <SayfaBasligi baslik="Yeni Personel" />
            <PersonelFormu />
        </div>
    );
}
