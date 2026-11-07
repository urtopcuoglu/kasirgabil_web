// src/lib/schemas/kullanici.ts
// Panel girişi şifre kuralı: giriş açma, şifre sıfırlama, kayıt talebi onayı ve kullanıcının kendi şifresi.
import { z } from "zod";

export const sifreAlani = z
    .string()
    .min(8, { error: "Şifre en az 8 karakter olmalı." })
    .max(72, { error: "Şifre en fazla 72 karakter olabilir." })
    .refine((v) => /[A-Za-zÇĞİÖŞÜçğıöşü]/.test(v) && /\d/.test(v), { error: "Şifrede en az bir harf ve bir rakam olmalı." });
