export type RosterRole = "Ketua" | "Wakil Ketua" | "Anggota"
export const ROSTER_ROLES: RosterRole[] = ["Ketua", "Wakil Ketua", "Anggota"]

export const MIN_PLAYERS = 5
export const MAX_PLAYERS = 10
export const MAX_FILE_SIZE = 5 * 1024 * 1024 
export const STORAGE_KEY = "twi-s7-duel-links-draft"
export const RULEBOOK_URL = "https://twindo.dev"

export interface Player {
  id: string
  role: RosterRole
  namaLengkap: string
  discord: string
  ign: string
  duelId: string
}

export interface UploadedFile {
  name: string
  size: number
  base64: string 
}

export interface FormState {
  email: string
  namaTim: string
  hex: string
  players: Player[]
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim())
}

export function isValidHex(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value.trim())
}

export function formatDuelId(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 9)
  const parts: string[] = []
  for (let i = 0; i < digits.length; i += 3) {
    parts.push(digits.slice(i, i + 3))
  }
  return parts.join("-")
}

export function isCompleteDuelId(value: string): boolean {
  return /^\d{3}-\d{3}-\d{3}$/.test(value)
}

export function normalizeSpaces(value: string): string {
  return value.replace(/\s+/g, " ").trim()
}

export function sanitizeTeamName(value: string): string {
  return value.replace(/[^a-zA-Z0-9 .'-]/g, "")
}

export function sanitizeDiscord(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9_.]/g, "").slice(0, 32)
}

export function validateDiscord(value: string): string | undefined {
  const v = value.trim()
  if (!v) return undefined
  if (v.length < 2) return "Minimal 2 karakter."
  if (v.length > 32) return "Maksimal 32 karakter."
  if (v.includes("..")) return "Tidak boleh ada titik berurutan (..)."
  if (v.startsWith(".") || v.endsWith(".")) return "Tidak boleh diawali/diakhiri titik."
  if (!/^[a-z0-9_.]+$/.test(v)) return "Hanya huruf kecil, angka, _, dan ."
  return undefined
}

export function sanitizeRealName(value: string): string {
  return value.replace(/[^a-zA-Z\s'-]/g, "").slice(0, 60)
}

export function toProperCase(value: string): string {
  return normalizeSpaces(value)
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(" ")
}

export function validateRealName(value: string): string | undefined {
  const v = value.trim()
  if (!v) return undefined
  if (v.length > 60) return "Maksimal 60 karakter."
  return undefined
}

// Mesin Kompresi Gambar Cerdas (Sudah Dioptimasi untuk JPEG)
export function compressImage(file: File, maxWidth = 1200): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        let width = img.width
        let height = img.height
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        ctx?.drawImage(img, 0, 0, width, height)
        
        // Memaksa konversi ke JPEG 80% agar ukuran file sangat kecil
        const mimeType = "image/jpeg"
        const quality = 0.80
        resolve(canvas.toDataURL(mimeType, quality))
      }
      img.onerror = (err) => reject(err)
    }
    reader.onerror = (err) => reject(err)
  })
}

// Ganti bagian idCounter di lib/registration.ts
export function createPlayer(role: RosterRole): Player {
  return { 
    id: crypto.randomUUID(), // Jauh lebih aman dan unik
    role, 
    namaLengkap: "", 
    discord: "", 
    ign: "", 
    duelId: "" 
  }
}

export function defaultPlayers(): Player[] {
  return [createPlayer("Ketua"), createPlayer("Wakil Ketua"), createPlayer("Anggota"), createPlayer("Anggota"), createPlayer("Anggota")]
}

export function countRole(players: Player[], role: RosterRole): number {
  return players.filter((p) => p.role === role).length
}

export function assignRole(players: Player[], targetId: string, nextRole: RosterRole): Player[] {
  const isUnique = nextRole === "Ketua" || nextRole === "Wakil Ketua"
  return players.map((p) => {
    if (p.id === targetId) return { ...p, role: nextRole }
    if (isUnique && p.role === nextRole) return { ...p, role: "Anggota" }
    return p
  })
}

export function findDuplicateFields(players: Player[]): Set<string> {
  const flagged = new Set<string>()
  const fields: Array<keyof Pick<Player, "discord" | "ign" | "duelId">> = ["discord", "ign", "duelId"]

  for (const field of fields) {
    const seen = new Map<string, string[]>()
    for (const p of players) {
      const raw = p[field].trim().toLowerCase()
      if (!raw) continue
      const ids = seen.get(raw) ?? []
      ids.push(p.id)
      seen.set(raw, ids)
    }
    for (const ids of seen.values()) {
      if (ids.length > 1) {
        for (const id of ids) flagged.add(`${id}-${field}`)
      }
    }
  }
  return flagged
}
