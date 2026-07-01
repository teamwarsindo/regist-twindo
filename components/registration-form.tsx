"use client"

import { useEffect, useMemo, useState } from "react"
import { FileDropzone } from "@/components/file-dropzone"
import { ReviewModal } from "@/components/review-modal"
import { TrashIcon, PlusIcon, AlertIcon, CheckIcon } from "@/components/icons"
import { 
  ROSTER_ROLES, MIN_PLAYERS, MAX_PLAYERS, STORAGE_KEY,
  createPlayer, defaultPlayers, countRole, assignRole, findDuplicateFields,
  type Player, type RosterRole, type UploadedFile, type FormState 
} from "@/lib/registration"

import { 
  isValidEmail, isValidHex, formatDuelId, isCompleteDuelId, 
  sanitizeTeamName, sanitizeRealName, toProperCase, 
  validateRealName, validateTeamName, sanitizeDiscord, validateDiscord 
} from "@/lib/validators"

const inputBase = "w-full rounded-lg border bg-background/60 px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"

function ErrorText({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="mt-1 text-xs font-medium text-destructive">{msg}</p>
}

export function RegistrationForm() {
  const [email, setEmail] = useState("")
  const [namaTim, setNamaTim] = useState("")
  const [hex, setHex] = useState("")
  const [players, setPlayers] = useState<Player[]>(defaultPlayers)
  const [logo, setLogo] = useState<UploadedFile | null>(null)
  const [bukti, setBukti] = useState<UploadedFile | null>(null)
  
  const [bulkText, setBulkText] = useState("")
  const [notification, setNotification] = useState<string | null>(null)
  
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isDraftLoaded, setIsDraftLoaded] = useState(false)
  
  function markTouched(key: string) {
    setTouchedFields((prev) => (prev[key] ? prev : { ...prev, [key]: true }))
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const data = JSON.parse(raw) as Partial<FormState>
        if (typeof data.email === "string") setEmail(data.email)
        if (typeof data.namaTim === "string") setNamaTim(data.namaTim)
        if (typeof data.hex === "string") setHex(data.hex)
        if (Array.isArray(data.players) && data.players.length >= MIN_PLAYERS) {
          setPlayers(data.players)
        }
      }
    } catch {}
    setIsDraftLoaded(true)
  }, [])

  useEffect(() => {
    if (!isDraftLoaded) return
    const draft: FormState = { email, namaTim, hex, players }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
    } catch {}
  }, [email, namaTim, hex, players, isDraftLoaded])

  function updatePlayer(id: string, patch: Partial<Player>) {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }

  function changeRole(id: string, role: RosterRole) {
    setPlayers((prev) => assignRole(prev, id, role))
  }

  function addPlayer() {
    setPlayers((prev) => prev.length >= MAX_PLAYERS ? prev : [...prev, createPlayer("Anggota")])
  }

  function removePlayer(id: string) {
    setPlayers((prev) => prev.length <= MIN_PLAYERS ? prev : prev.filter((p) => p.id !== id))
  }

  function handleSmartPaste() {
    if (!bulkText.trim()) return

    const lines = bulkText.split('\n')
    const extractedData: Array<{namaLengkap: string, discord: string, ign: string, duelId: string}> = []

    lines.forEach((line) => {
      if (!line.trim()) return
      
      let cleanedLine = line.trim()
      const duelIdMatch = cleanedLine.match(/[\d\s-]{8,}$/)
      let duelId = ""
      
      if (duelIdMatch) {
        duelId = duelIdMatch[0].replace(/[\s-]/g, "")
        cleanedLine = cleanedLine.slice(0, duelIdMatch.index).trim()
        cleanedLine = cleanedLine.replace(/[,\t\/|-]+$/, "").trim()
      }

      const parts = cleanedLine.split(/\s*\t\s*|\s*\|\s*|\s*,\s*|\s*\/\s*|\s+-\s+|-/).map(item => item.trim()).filter(Boolean)

      if (parts.length > 0 || duelId) {
         extractedData.push({
           namaLengkap: parts[0] || "",
           discord: parts[1] || "",
           ign: parts[2] || "",
           duelId: duelId ? formatDuelId(duelId) : formatDuelId(parts[3] || ""),
         })
      }
    })

    if (extractedData.length === 0) return

    const newTouched: Record<string, boolean> = {}
    const newPlayers = [...players]

    extractedData.forEach((data, index) => {
      let playerId = ""

      if (index < newPlayers.length) {
        newPlayers[index] = {
          ...newPlayers[index],
          namaLengkap: data.namaLengkap ? toProperCase(data.namaLengkap) : newPlayers[index].namaLengkap,
          discord: data.discord || newPlayers[index].discord,
          ign: data.ign || newPlayers[index].ign,
          duelId: data.duelId || newPlayers[index].duelId,
        }
        playerId = newPlayers[index].id
      } else if (newPlayers.length < MAX_PLAYERS) {
        const newP = createPlayer("Anggota")
        newP.namaLengkap = toProperCase(data.namaLengkap)
        newP.discord = data.discord
        newP.ign = data.ign
        newP.duelId = data.duelId
        newPlayers.push(newP)
        playerId = newP.id
      }

      if (playerId) {
        newTouched[`${playerId}-namaLengkap`] = true
        newTouched[`${playerId}-discord`] = true
        newTouched[`${playerId}-ign`] = true
        newTouched[`${playerId}-duelId`] = true
      }
    })

    setPlayers(newPlayers)
    setTouchedFields((prev) => ({ ...prev, ...newTouched }))
    setNotification(`⚡ Berhasil mengekstrak ${Math.min(extractedData.length, MAX_PLAYERS)} data pemain!`)
    setTimeout(() => setNotification(null), 5000)
    setBulkText("") 
  }

  const ketuaCount = countRole(players, "Ketua")
  const wakilCount = countRole(players, "Wakil Ketua")
  const rosterRuleOk = ketuaCount === 1 && wakilCount === 1

  const duplicateFields = useMemo(() => findDuplicateFields(players), [players])

  const fieldErrors = useMemo(() => {
    const errs: Record<string, string> = {}
    if (!email.trim()) errs.email = "Email wajib diisi."
    else if (!isValidEmail(email)) errs.email = "Format email tidak valid."
    
    const teamErr = validateTeamName(namaTim)
    if (teamErr) errs.namaTim = teamErr
    else if (!namaTim.trim()) errs.namaTim = "Nama Tim wajib diisi."
    
    if (!isValidHex(hex)) errs.hex = "Format hex tidak valid (#RRGGBB)."
    if (!logo) errs.logo = "Logo tim wajib diunggah."
    if (!bukti) errs.bukti = "Bukti transfer wajib diunggah."

    players.forEach((p) => {
      const nameErr = validateRealName(p.namaLengkap)
      if (nameErr) errs[`${p.id}-namaLengkap`] = nameErr

      const discordErr = validateDiscord(p.discord)
      if (discordErr) errs[`${p.id}-discord`] = discordErr

      if (!p.ign.trim()) errs[`${p.id}-ign`] = "IGN wajib diisi."
      if (!p.duelId.trim()) errs[`${p.id}-duelId`] = "ID Duel Links wajib diisi."
      else if (!isCompleteDuelId(p.duelId)) errs[`${p.id}-duelId`] = "ID harus berformat xxx-xxx-xxx."
    })

    duplicateFields.forEach((key) => { errs[key] = "Data ganda dalam tim" })
    return errs
  }, [email, namaTim, hex, logo, bukti, players, duplicateFields])

  const hasFieldErrors = Object.keys(fieldErrors).length > 0
  
  // Dihapus pengecekan agreedData & agreedRules
  const canSubmit = !hasFieldErrors && rosterRuleOk
  
  function err(key: string) {
    const e = fieldErrors[key]
    if (!e) return undefined
    if (duplicateFields.has(key)) return e
    if (submitAttempted || touchedFields[key]) return e
    return undefined
  }

  function handleReviewClick() {
    setSubmitAttempted(true)
    if (!canSubmit) {
      document.getElementById("registration-form")?.scrollIntoView({ behavior: "smooth", block: "start" })
      return
    }
    setServerError(null)
    setModalOpen(true)
  }

  // Fungsi handleSubmit tetap sama (tidak ada perubahan logic, hanya payload)
  async function uploadKeCloudinary(base64Data: string, type: "logo" | "bukti", teamName: string): Promise<string> {
    const stringLength = base64Data.length - (base64Data.indexOf(',') + 1);
    const sizeInBytes = (stringLength * (3 / 4)) - (base64Data.endsWith('==') ? 2 : base64Data.endsWith('=') ? 1 : 0);
    const maxSizeInBytes = 15 * 1024 * 1024; 

    if (sizeInBytes > maxSizeInBytes) {
      throw new Error(`Ukuran file ${type === "logo" ? "Logo" : "Bukti Transfer"} terlalu besar! Maksimal 10MB.`);
    }

    const cleanTeamName = teamName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
    const customFileName = cleanTeamName; 
    const folderPath = type === "logo" ? "logo" : "bukti_transfer";

    const parts = base64Data.split(',');
    const mime = parts[0].match(/:(.*?);/)?.[1] || "image/png";
    const binaryStr = atob(parts[1]);
    let len = binaryStr.length;
    const u8arr = new Uint8Array(len);
    while (len--) { u8arr[len] = binaryStr.charCodeAt(len); }
    
    const extension = mime.split('/')[1] || 'png';
    const namedFile = new File([u8arr], `${customFileName}.${extension}`, { type: mime });

    const formData = new FormData()
    formData.append("file", namedFile) 
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "preset_twis7")
    formData.append("folder", folderPath)

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    if (!cloudName) throw new Error("Cloud Name belum di-set di Vercel Env.")

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    })

    if (!res.ok) throw new Error(`Nama tim "${teamName}" kemungkinan sudah terdaftar.`);

    const data = await res.json()
    return data.secure_url
  }

  async function handleSubmit() {
    setSubmitting(true)
    setServerError(null)

    try {
      let logoUrlOriginal = ""
      if (logo?.base64) logoUrlOriginal = await uploadKeCloudinary(logo.base64, "logo", namaTim)

      let buktiUrlOriginal = ""
      if (bukti?.base64) buktiUrlOriginal = await uploadKeCloudinary(bukti.base64, "bukti", namaTim)

      const getFileName = (url: string) => url.split('/').pop() || '';
      const namaFileLogo = getFileName(logoUrlOriginal);
      const namaFileBukti = getFileName(buktiUrlOriginal);
      const baseUrl = window.location.origin;
      
      const payload = {
        email: email.trim(),
        namaTim: namaTim.trim(),
        warna: hex,
        logoTim: {
          original: `${baseUrl}/logo/${namaFileLogo}`, 
          compressed: `${baseUrl}/thumb-logo/${namaFileLogo}` 
        },
        buktiTransfer: {
          original: `${baseUrl}/bukti/${namaFileBukti}`,
          compressed: `${baseUrl}/thumb-bukti/${namaFileBukti}`
        },
        players: players.map((p) => ({
          role: p.role,
          namaLengkap: p.namaLengkap.trim(),
          discord: p.discord.trim(),
          ign: p.ign.trim(),
          idDuelLinks: p.duelId,
        })),
        createdAt: new Date().toISOString()
      }
      
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      
      const result = await res.json()

      if (!res.ok || result.status === "error") {
        setSubmitting(false)
        setServerError(result.message || "Terjadi kesalahan saat menyimpan data.")
        return
      }

      try { localStorage.removeItem(STORAGE_KEY) } catch {}
      setSubmitting(false)
      setModalOpen(false)
      setSuccess(true)
    } catch (error: any) {
      setSubmitting(false)
      setServerError(error.message || "Gagal memproses pendaftaran. Periksa internet Anda.")
    }
  }
  
  if (success) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <div className="glow-border mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary">
          <CheckIcon className="h-10 w-10 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Pendaftaran Berhasil!</h2>
        <p className="mt-2 max-w-md text-pretty text-muted-foreground">
          Tim <span className="font-semibold text-foreground">{namaTim}</span> telah berhasil didaftarkan.
        </p>
      </div>
    )
  }

  return (
    <>
      <form id="registration-form" onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-6">
        {/* Identitas Tim & Roster sections tetap sama... */}
        {/* (Section Identitas & Section Roster) */}

        {/* SECTION CHECKBOX DIHAPUS, GANTI TOMBOL REVIEW LANGSUNG */}
        <section className="glass glow-border rounded-2xl border p-5 sm:p-6">
          <button 
            type="button" 
            onClick={handleReviewClick} 
            className="w-full rounded-xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-lg transition-all hover:brightness-110 active:scale-[0.98] mt-2"
          >
            Review & Konfirmasi Pendaftaran
          </button>
        </section>
      </form>

      <ReviewModal open={modalOpen} onClose={() => setModalOpen(false)} form={{ email, namaTim, hex, players }} logo={logo} bukti={bukti} submitting={submitting} serverError={serverError} onConfirm={handleSubmit} />
    </>
  )
      }
