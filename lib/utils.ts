import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
};

// 1. Mesin Pembersih Spasi (Global Trim)
export const trimSpaces = (value) => {
  return value.replace(/\s+/g, " ").trim();
};

// 2. Mesin Format Nama Lengkap (Proper Case, No Symbol, Max 60)
export const formatRealName = (value) => {
  // Hanya izinkan huruf dan spasi, potong maksimal 60 karakter
  let cleaned = value.replace(/[^a-zA-Z\s]/g, "").slice(0, 60);
  // Buat huruf pertama tiap kata jadi kapital (Proper Case)
  return cleaned.replace(/\b\w/g, (char) => char.toUpperCase());
};

// 3. Mesin Format Discord (Lowercase, _ dan . saja)
export const formatDiscord = (value) => {
  // Paksa huruf kecil dan buang karakter selain huruf, angka, _, dan .
  return value.toLowerCase().replace(/[^a-z0-9_.]/g, "").slice(0, 32);
};

// 4. Mesin Format Hex Code
export const formatHex = (value) => {
  return value.toUpperCase();
};

// Cek Nama (Wajib minimal 2 kata)
export const validateRealName = (value) => {
  const trimmed = value.trim();
  if (!trimmed) return "Nama wajib diisi.";
  if (trimmed.split(/\s+/).length < 2) return "Nama tidak boleh hanya satu kata.";
  return ""; // Valid
};

// Cek Discord (Min 2 karakter, dilarang "..")
export const validateDiscord = (value) => {
  if (!value) return "Discord wajib diisi.";
  if (value.length < 2) return "Minimal 2 karakter.";
  if (value.includes("..")) return "Tidak boleh ada dua titik berurutan (..).";
  return ""; // Valid
};
