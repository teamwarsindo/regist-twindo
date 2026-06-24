// lib/config.ts

// Waktu Buka: 1 Juli 2026, 08:00 WIB (Sesuaikan format ISO 8601)
export const LAUNCH_TARGET_DATE = "2026-09-01T07:01:26+07:00"

export const LAUNCH_TARGET = new Date(LAUNCH_TARGET_DATE).getTime()

// Waktu Tutup: 14 hari setelah buka
export const CLOSE_TARGET = LAUNCH_TARGET + (14 * 24 * 60 * 60 * 1000)

// 👇 TAMBAHAN BARU: Saklar manual untuk halaman Rules
// Ubah menjadi 'true' jika Anda sudah selesai mengedit dan siap mempublikasikannya
export const IS_RULES_OPEN = false;
