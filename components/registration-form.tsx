"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { FileDropzone } from "@/components/file-dropzone"
import { ReviewModal } from "@/components/review-modal"
import { TrashIcon, PlusIcon, AlertIcon, CheckIcon } from "@/components/icons"
import {
  ROSTER_ROLES,
  MIN_PLAYERS,
  MAX_PLAYERS,
  SUBMIT_URL,
  STORAGE_KEY,
  RULEBOOK_URL,
  type Player,
  type RosterRole,
  type UploadedFile,
  type FormState,
  isValidEmail,
  isValidHex,
  formatDuelId,
  isCompleteDuelId,
  createPlayer,
  defaultPlayers,
  countRole,
  assignRole,
  findDuplicateFields,
  sanitizeTeamName,
  sanitizeRealName,
  toProperCase,
  validateRealName,
  sanitizeDiscord,
  validateDiscord,
} from "@/lib/registration"

const inputBase = "w-full rounded-lg border bg-background/60 px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"

function ErrorText({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="mt-1 text-xs font-medium text-destructive">{msg}</p>
}

export function RegistrationForm() {
  const [email, setEmail] = useState("")
  const [namaTim, setNamaTim] = useState("")
  const [hex, setHex] = useState("#3b82f6")
  const [players, setPlayers] = useState<Player[]>(defaultPlayers)
  const [logo, setLogo] = useState<UploadedFile | null>(null)
  const [bukti, setBukti] = useState<UploadedFile | null>(null)
  const [agreed, setAgreed] = useState(false)

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

  const ketuaCount = countRole(players, "Ketua")
  const wakilCount = countRole(players, "Wakil Ketua")
  const rosterRuleOk = ketuaCount === 1 && wakilCount === 1

  const duplicateFields = useMemo(() => findDuplicateFields(players), [players])

  const fieldErrors = useMemo(() => {
    const errs: Record<string, string> = {}
    if (!email.trim()) errs.email = "Kolom ini wajib diisi."
    else if (!isValidEmail(email)) errs.email = "Format email tidak valid."
    
    if (!namaTim.trim()) errs.namaTim = "Kolom ini wajib diisi."
    if (!isValidHex(hex)) errs.hex = "Format hex tidak valid (#RRGGBB)."
    if (!logo) errs.logo = "Logo tim wajib diunggah."
    if (!bukti) errs.bukti = "Bukti transfer wajib diunggah."

    players.forEach((p) => {
      const nameErr = validateRealName(p.namaLengkap)
      if (nameErr) errs[`${p.id}-namaLengkap`] = nameErr

      const discordErr = validateDiscord(p.discord)
      if (discordErr) errs[`${p.id}-discord`] = discordErr

      if (!p.ign.trim()) errs[`${p.id}-ign`] = "Kolom ini wajib diisi."
      if (!p.duelId.trim()) errs[`${p.id}-duelId`] = "Kolom ini wajib diisi."
      else if (!isCompleteDuelId(p.duelId)) errs[`${p.id}-duelId`] = "ID harus berformat xxx-xxx-xxx."
    })

    duplicateFields.forEach((key) => { errs[key] = "Data ganda dalam tim" })
    return errs
  }, [email, namaTim, hex, logo, bukti, players, duplicateFields])

  const hasFieldErrors = Object.keys(fieldErrors).length > 0
  const canSubmit = !hasFieldErrors && rosterRuleOk && agreed

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

  async function handleSubmit() {
    setSubmitting(true)
    setServerError(null)

    const payload = {
      event: "Team Wars Indonesia Season 7 - Duel Links",
      email: email.trim(),
      namaTim: namaTim.trim(),
      warna: hex,
      logoTim: logo?.base64 ?? "", 
      buktiTransfer: bukti?.base64 ?? "",
      players: players.map((p, i) => ({
        nomor: i + 1,
        role: p.role,
        namaLengkap: p.namaLengkap.trim(),
        discord: p.discord.trim(),
        ign: p.ign.trim(),
        idDuelLinks: p.duelId,
      })),
      submittedAt: new Date().toISOString(),
    }

    try {
      // Sekarang kita mengarahkannya ke server internal kita sendiri
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result = await res.json()

      if (result.status === "error") {
        setSubmitting(false)
        setServerError(result.message || "Terjadi kesalahan pada server. Silakan coba lagi.")
        return
      }

      try { localStorage.removeItem(STORAGE_KEY) } catch {}
      setSubmitting(false)
      setModalOpen(false)
      setSuccess(true)
    } catch {
      setSubmitting(false)
      setServerError("Gagal terhubung ke server. Periksa koneksi internet Anda.")
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
        
        <section className="glass glow-border rounded-2xl border p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-8 w-1 rounded-full bg-primary" aria-hidden="true" />
            <div>
              <h2 className="text-base font-semibold text-foreground">Identitas Tim</h2>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">Email Aktif Perwakilan</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => markTouched("email")} className={`${inputBase} ${err("email") ? "border-destructive" : "border-border"}`} />
              <ErrorText msg={err("email")} />
            </div>
            <div>
              <label htmlFor="namaTim" className="mb-1.5 block text-sm font-medium text-foreground">Nama Tim</label>
              <input id="namaTim" type="text" value={namaTim} onChange={(e) => setNamaTim(sanitizeTeamName(e.target.value))} onBlur={() => markTouched("namaTim")} className={`${inputBase} ${err("namaTim") ? "border-destructive" : "border-border"}`} />
              <ErrorText msg={err("namaTim")} />
            </div>
            <div>
              <label htmlFor="hexText" className="mb-1.5 block text-sm font-medium text-foreground">Warna Identitas Tim (Hex)</label>
              <div className="flex items-center gap-3">
                <input type="color" value={isValidHex(hex) ? hex : "#000000"} onChange={(e) => setHex(e.target.value)} className="h-11 w-12 shrink-0 cursor-pointer rounded-lg border border-border bg-background p-1" />
                <input id="hexText" type="text" value={hex} onChange={(e) => setHex(`#${e.target.value.replace(/[^0-9a-fA-F]/g, "").slice(0, 6)}`)} onBlur={() => markTouched("hex")} className={`${inputBase} font-mono ${err("hex") ? "border-destructive" : "border-border"}`} />
              </div>
              <ErrorText msg={err("hex")} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FileDropzone id="logo" label="Logo Tim" value={logo} onChange={(f) => { setLogo(f); markTouched("logo") }} error={err("logo")} />
              <FileDropzone id="bukti" label="Bukti Transfer" value={bukti} onChange={(f) => { setBukti(f); markTouched("bukti") }} error={err("bukti")} />
            </div>
          </div>
        </section>

        <section className="glass glow-border rounded-2xl border p-5 sm:p-6">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="h-8 w-1 rounded-full bg-primary" aria-hidden="true" />
              <div>
                <h2 className="text-base font-semibold text-foreground">Roster Pemain</h2>
              </div>
            </div>
          </div>

          {!rosterRuleOk && (
            <div role="alert" className="mb-4 flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive">
              <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="text-sm">
                <p className="font-semibold">Komposisi roster tidak valid</p>
                <p>Wajib memiliki tepat 1 Ketua dan 1 Wakil Ketua.</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {players.map((p, index) => {
              const canDelete = players.length > MIN_PLAYERS
              return (
                <div key={p.id} className="rounded-xl border border-border bg-background/40 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{index + 1}</span>
                      <select value={p.role} onChange={(e) => changeRole(p.id, e.target.value as RosterRole)} className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground outline-none focus:border-primary">
                        {ROSTER_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <button type="button" onClick={() => removePlayer(p.id)} disabled={!canDelete} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-30">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <input type="text" value={p.namaLengkap} onChange={(e) => updatePlayer(p.id, { namaLengkap: sanitizeRealName(e.target.value) })} onBlur={(e) => { updatePlayer(p.id, { namaLengkap: toProperCase(e.target.value) }); markTouched(`${p.id}-namaLengkap`) }} placeholder="Nama Lengkap" className={`${inputBase} ${err(`${p.id}-namaLengkap`) ? "border-destructive" : "border-border"}`} />
                      <ErrorText msg={err(`${p.id}-namaLengkap`)} />
                    </div>
                    <div>
                      <input type="text" value={p.discord} onChange={(e) => updatePlayer(p.id, { discord: sanitizeDiscord(e.target.value) })} onBlur={() => markTouched(`${p.id}-discord`)} placeholder="Discord Username" className={`${inputBase} ${err(`${p.id}-discord`) ? "border-destructive" : "border-border"}`} />
                      <ErrorText msg={err(`${p.id}-discord`)} />
                    </div>
                    <div>
                      <input type="text" value={p.ign} onChange={(e) => updatePlayer(p.id, { ign: e.target.value })} onBlur={() => markTouched(`${p.id}-ign`)} placeholder="In-Game Name (IGN)" className={`${inputBase} ${err(`${p.id}-ign`) ? "border-destructive" : "border-border"}`} />
                      <ErrorText msg={err(`${p.id}-ign`)} />
                    </div>
                    <div>
                      <input type="text" inputMode="numeric" value={p.duelId} onChange={(e) => updatePlayer(p.id, { duelId: formatDuelId(e.target.value) })} onBlur={() => markTouched(`${p.id}-duelId`)} placeholder="ID Duel Links" className={`${inputBase} font-mono ${err(`${p.id}-duelId`) ? "border-destructive" : "border-border"}`} />
                      <ErrorText msg={err(`${p.id}-duelId`)} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <button type="button" onClick={addPlayer} disabled={players.length >= MAX_PLAYERS} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm font-medium text-foreground hover:border-primary/60 hover:bg-primary/5 hover:text-primary disabled:opacity-40">
            <PlusIcon className="h-5 w-5" /> Tambah Pemain
          </button>
        </section>

        <section className="flex flex-col gap-4 pt-2">
          <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50">
            <input 
              type="checkbox" 
              checked={agreed} 
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 rounded border-primary bg-background text-primary focus:ring-primary focus:ring-offset-background"
            />
            <span className="text-sm text-muted-foreground">
              Saya mewakili tim menyatakan bahwa seluruh data yang diisi adalah benar, asli, dan valid. Kami menyetujui seluruh syarat dan ketentuan yang tertulis di dalam <a href={RULEBOOK_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">Rulebook Resmi Team Wars</a>.
            </span>
          </label>

          <button type="button" onClick={handleReviewClick} className="w-full rounded-xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-lg transition-all hover:brightness-110 active:scale-[0.98]">
            Tinjau Data Pendaftaran
          </button>
        </section>
      </form>

      <ReviewModal open={modalOpen} onClose={() => setModalOpen(false)} form={{ email, namaTim, hex, players }} logo={logo} bukti={bukti} submitting={submitting} serverError={serverError} onConfirm={handleSubmit} />
    </>
  )
}
