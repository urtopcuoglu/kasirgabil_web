// src/lib/html.ts
// Editörden gelen HTML'i güvenli alt kümeye indirger (kaydederken ve vitrinde gösterirken).
import sanitizeHtml from "sanitize-html";

const AYARLAR: sanitizeHtml.IOptions = {
    allowedTags: ["p", "br", "h2", "h3", "h4", "strong", "em", "u", "s", "a", "ul", "ol", "li", "blockquote", "code", "pre", "hr", "img"],
    allowedAttributes: {
        a: ["href", "target", "rel"],
        img: ["src", "alt", "title"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["https"] },
    allowProtocolRelative: false,
    transformTags: {
        // Dış linkler yeni sekmede ve güvenli açılır.
        a: (_etiket, nitelikler) => {
            const href = nitelikler.href ?? "";
            const attribs: sanitizeHtml.Attributes = { href };
            if (/^https?:\/\//.test(href)) Object.assign(attribs, { target: "_blank", rel: "noopener noreferrer" });
            return { tagName: "a", attribs };
        },
        h1: "h2",
    },
};

export function htmlTemizle(html: string) {
    return sanitizeHtml(html, AYARLAR);
}
