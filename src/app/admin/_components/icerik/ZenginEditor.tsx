// src/app/admin/_components/icerik/ZenginEditor.tsx
// Blog yazıları ve site metinleri için zengin metin editörü (Tiptap). Değer HTML olarak tutulur.
"use client";

import { useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import {
    Bold,
    Heading2,
    Heading3,
    ImagePlus,
    Italic,
    Link as LinkIkon,
    List,
    ListOrdered,
    Loader2,
    Minus,
    Pilcrow,
    Quote,
    Redo2,
    Strikethrough,
    Underline,
    Undo2,
    Unlink,
} from "lucide-react";
import { gorselYukle } from "@/lib/gorsel-yukle";
import { cn } from "@/lib/utils";

type Props = {
    id: string;
    deger: string;
    onChange: (html: string) => void;
    gorselKlasoru?: string; // verilmezse görsel ekleme düğmesi gösterilmez
    kucuk?: boolean;
};

export default function ZenginEditor({ id, deger, onChange, gorselKlasoru, kucuk }: Props) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3, 4] },
                link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
            }),
            Image,
        ],
        content: deger,
        // Sunucu render'ında editör oluşturulmaz (hydration uyumsuzluğu olmasın).
        immediatelyRender: false,
        editorProps: {
            attributes: {
                id,
                class: cn("prose prose-sm max-w-none px-4 py-3 focus:outline-none", kucuk ? "min-h-[140px]" : "min-h-[320px]"),
            },
        },
        onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
    });

    return (
        <div className="overflow-hidden rounded-md border border-gray-300 bg-white focus-within:border-[var(--color-secondary)] focus-within:ring-2 focus-within:ring-[var(--color-secondary)]/20">
            {editor && <AracCubugu editor={editor} gorselKlasoru={gorselKlasoru} />}
            <EditorContent editor={editor} />
        </div>
    );
}

function AracCubugu({ editor, gorselKlasoru }: { editor: Editor; gorselKlasoru?: string }) {
    const dosyaGirdisi = useRef<HTMLInputElement>(null);
    const [yukleniyor, setYukleniyor] = useState(false);
    const [hata, setHata] = useState<string>();

    // Araç çubuğundaki aktif durumlar yalnızca bu değerler değişince yeniden çizilir.
    const durum = useEditorState({
        editor,
        selector: ({ editor: e }) => ({
            paragraf: e.isActive("paragraph"),
            h2: e.isActive("heading", { level: 2 }),
            h3: e.isActive("heading", { level: 3 }),
            kalin: e.isActive("bold"),
            italik: e.isActive("italic"),
            alti: e.isActive("underline"),
            ustu: e.isActive("strike"),
            madde: e.isActive("bulletList"),
            numara: e.isActive("orderedList"),
            alinti: e.isActive("blockquote"),
            link: e.isActive("link"),
            geriAl: e.can().undo(),
            yinele: e.can().redo(),
        }),
    });

    function linkEkle() {
        const onceki = editor.getAttributes("link").href as string | undefined;
        const adres = window.prompt("Link adresi (https://... veya /sayfa)", onceki ?? "https://");
        if (adres === null) return;
        if (adres.trim() === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange("link").setLink({ href: adres.trim() }).run();
    }

    async function gorselSec(e: React.ChangeEvent<HTMLInputElement>) {
        const dosya = e.target.files?.[0];
        e.target.value = "";
        if (!dosya || !gorselKlasoru) return;
        setHata(undefined);
        setYukleniyor(true);
        try {
            const src = await gorselYukle(dosya, gorselKlasoru);
            editor.chain().focus().setImage({ src, alt: dosya.name.replace(/\.[^.]+$/, "") }).run();
        } catch (err) {
            setHata(err instanceof Error ? err.message : "Görsel yüklenemedi.");
        } finally {
            setYukleniyor(false);
        }
    }

    const zincir = () => editor.chain().focus();

    return (
        <div className="border-b bg-gray-50">
            <div role="toolbar" aria-label="Biçimlendirme" className="flex flex-wrap items-center gap-0.5 p-1">
                <Dugme etiket="Paragraf" aktif={durum.paragraf} onClick={() => zincir().setParagraph().run()} Ikon={Pilcrow} />
                <Dugme etiket="Başlık" aktif={durum.h2} onClick={() => zincir().toggleHeading({ level: 2 }).run()} Ikon={Heading2} />
                <Dugme etiket="Alt başlık" aktif={durum.h3} onClick={() => zincir().toggleHeading({ level: 3 }).run()} Ikon={Heading3} />
                <Ayirac />
                <Dugme etiket="Kalın" aktif={durum.kalin} onClick={() => zincir().toggleBold().run()} Ikon={Bold} />
                <Dugme etiket="İtalik" aktif={durum.italik} onClick={() => zincir().toggleItalic().run()} Ikon={Italic} />
                <Dugme etiket="Altı çizili" aktif={durum.alti} onClick={() => zincir().toggleUnderline().run()} Ikon={Underline} />
                <Dugme etiket="Üstü çizili" aktif={durum.ustu} onClick={() => zincir().toggleStrike().run()} Ikon={Strikethrough} />
                <Ayirac />
                <Dugme etiket="Madde listesi" aktif={durum.madde} onClick={() => zincir().toggleBulletList().run()} Ikon={List} />
                <Dugme etiket="Numaralı liste" aktif={durum.numara} onClick={() => zincir().toggleOrderedList().run()} Ikon={ListOrdered} />
                <Dugme etiket="Alıntı / not kutusu" aktif={durum.alinti} onClick={() => zincir().toggleBlockquote().run()} Ikon={Quote} />
                <Dugme etiket="Yatay çizgi" onClick={() => zincir().setHorizontalRule().run()} Ikon={Minus} />
                <Ayirac />
                <Dugme etiket="Link ekle / düzenle" aktif={durum.link} onClick={linkEkle} Ikon={LinkIkon} />
                {durum.link && <Dugme etiket="Linki kaldır" onClick={() => zincir().unsetLink().run()} Ikon={Unlink} />}
                {gorselKlasoru && (
                    <>
                        <Dugme
                            etiket="Görsel ekle"
                            onClick={() => dosyaGirdisi.current?.click()}
                            Ikon={yukleniyor ? Loader2 : ImagePlus}
                            dondur={yukleniyor}
                            pasif={yukleniyor}
                        />
                        <input
                            ref={dosyaGirdisi}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="sr-only"
                            tabIndex={-1}
                            onChange={gorselSec}
                        />
                    </>
                )}
                <Ayirac />
                <Dugme etiket="Geri al" onClick={() => zincir().undo().run()} Ikon={Undo2} pasif={!durum.geriAl} />
                <Dugme etiket="Yinele" onClick={() => zincir().redo().run()} Ikon={Redo2} pasif={!durum.yinele} />
            </div>
            {hata && <p className="px-2 pb-1 text-xs text-[var(--color-primary)]">{hata}</p>}
        </div>
    );
}

type DugmeProps = {
    etiket: string;
    onClick: () => void;
    Ikon: React.ComponentType<{ className?: string }>;
    aktif?: boolean;
    pasif?: boolean;
    dondur?: boolean;
};

function Dugme({ etiket, onClick, Ikon, aktif, pasif, dondur }: DugmeProps) {
    return (
        <button
            type="button"
            title={etiket}
            aria-label={etiket}
            aria-pressed={aktif}
            disabled={pasif}
            onClick={onClick}
            className={cn(
                "rounded p-1.5 text-gray-600 transition hover:bg-white hover:text-gray-900 disabled:opacity-40",
                aktif && "bg-white text-[var(--color-secondary)] shadow-sm"
            )}
        >
            <Ikon className={cn("size-4", dondur && "animate-spin")} />
        </button>
    );
}

function Ayirac() {
    return <span className="mx-1 h-5 w-px bg-gray-300" aria-hidden />;
}
