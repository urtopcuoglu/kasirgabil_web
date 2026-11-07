// src/lib/sifre.ts
// Okunması kolay geçici şifre: karışan karakterler (0/O, 1/l/I) yok, en az bir harf ve bir rakam.
// Tarayıcıda çalışır (crypto.getRandomValues); panel girişi açma ve kayıt talebi onayında kullanılır.
export function geciciSifreUret(uzunluk = 10) {
    const harfler = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
    const rakamlar = "23456789";
    const tum = harfler + rakamlar;
    const rastgele = crypto.getRandomValues(new Uint32Array(uzunluk));
    const karakterler = Array.from(rastgele, (n, i) => {
        const kume = i === 0 ? harfler : i === 1 ? rakamlar : tum;
        return kume[n % kume.length];
    });
    // Fisher–Yates: ilk iki karakterin yeri de rastgele olsun.
    const karistir = crypto.getRandomValues(new Uint32Array(uzunluk));
    for (let i = karakterler.length - 1; i > 0; i--) {
        const j = karistir[i] % (i + 1);
        [karakterler[i], karakterler[j]] = [karakterler[j], karakterler[i]];
    }
    return karakterler.join("");
}
