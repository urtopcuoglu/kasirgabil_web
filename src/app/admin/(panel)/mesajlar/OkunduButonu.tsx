// src/app/admin/(panel)/mesajlar/OkunduButonu.tsx
"use client";

import { useTransition } from "react";
import { Loader2, Mail, MailOpen } from "lucide-react";
import { mesajOkunduYap } from "@/actions/iletisim";
import { Button } from "@/components/ui/button";

export default function OkunduButonu({ id, okundu }: { id: string; okundu: boolean }) {
    const [bekliyor, startTransition] = useTransition();

    const tikla = () =>
        startTransition(async () => {
            const sonuc = await mesajOkunduYap(id, !okundu);
            if (sonuc?.hata) window.alert(sonuc.hata);
        });

    return (
        <Button type="button" variant="ghost" size="sm" onClick={tikla} disabled={bekliyor} className="text-gray-600">
            {bekliyor ? <Loader2 className="animate-spin" /> : okundu ? <Mail /> : <MailOpen />}
            {okundu ? "Okunmadı yap" : "Okundu"}
        </Button>
    );
}
