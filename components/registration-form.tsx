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
  const [hex, setHex] = useState("#3b82f6")
  const [players, setPlayers] = useState<Player[]>(defaultPlayers)
  const [logo, setLogo] = useState<UploadedFile | null>(null)
  const [bukti, setBukti] = useState<UploadedFile | null>(null)
  
  // State Persetujuan
  const [agreedData, setAgreedData] = useState(false)
  const [agreedRules, setAgreedRules] = useState(false)

  // State untuk Smart Paste
  const [bulkText, setBulkText] = useState("")

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

  // Load Draft dari Local Storage
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

  // Save Draft ke Local Storage
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

  // FUNGSI INTI SMART PASTE (VERSI ULTRA FLEKSIBEL + INSTANT VALIDATION)
  function handleSmartPaste() {
    if (!bulkText.trim()) return

    const lines = bulkText.split('\n')
    const extractedData: Array<{namaLengkap: string, discord: string, ign: string, duelId: string}> = []

    lines.forEach((line) => {
      if (!line.trim()) return
      
      let cleanedLine = line.trim()
      
      // 1. Ekstrak Duel ID lebih dulu dari bagian paling belakang
      const duelIdMatch = cleanedLine.match(/[\d\s-]{8,}$/)
      let duelId = ""
      
      if (duelIdMatch) {
        duelId = duelIdMatch[0].replace(/[\s-]/g, "")
        cleanedLine = cleanedLine.slice(0, duelIdMatch.index).trim()
        cleanedLine = cleanedLine.replace(/[,\t\/|-]+$/, "").trim()
      }

      // 2. Pecah sisa teks dengan multi-pemisah dan multi-spasi cerdas
      const parts = cleanedLine
        .split(/\s*\t\s*|\s*\|\s*|\s*,\s*|\s*\/\s*|\s+-\s+|-/)
        .map(item => item.trim())
        .filter(Boolean)

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

    // 3. Persiapkan pencatatan `touched` agar error langsung muncul jika tidak valid
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

      // Tandai kolom pemain ini sebagai "tersentuh"
      if (playerId) {
        newTouched[`${playerId}-namaLengkap`] = true
        newTouched[`${playerId}-discord`] = true
        newTouched[`${playerId}-ign`] = true
        newTouched[`${playerId}-duelId`] = true
      }
    })

    // 4. Update data form dan status touched secara bersamaan
    setPlayers(newPlayers)
    setTouchedFields((prev) => ({ ...prev, ...newTouched }))

    alert(`⚡ Berhasil mengekstrak ${Math.min(extractedData.length, MAX_PLAYERS)} data pemain! Perhatikan kotak berwarna merah jika ada data yang tidak sesuai format.`)
    setBulkText("") 
  }

  const ketuaCount = countRole(players, "Ketua")
  const wakilCount = countRole(players, "Wakil Ketua")
  const rosterRuleOk = ketuaCount === 1 && wakilCount === 1

  const duplicateFields = useMemo(() => findDuplicateFields(players), [players])

  const fieldErrors = useMemo(() => {
    const errs: Record<string, string> = {}
    if (!email.trim()) errs.email = "Kolom ini wajib diisi."
    else if (!isValidEmail(email)) errs.email = "Format email tidak valid."
    
    const teamErr = validateTeamName(namaTim)
    if (teamErr) errs.namaTim = teamErr
    else if (!namaTim.trim()) errs.namaTim = "Kolom ini wajib diisi."
    
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
  const canSubmit = !hasFieldErrors && rosterRuleOk && agreedData && agreedRules
  
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
      email: email.trim(),
      namaTim: namaTim.trim(),
      warna: hex,
      logoTim: logo?.base64 ?? "", 
      buktiTransfer: bukti?.base64 ?? "",
      players: players.map((p) => ({
        role: p.role,
        namaLengkap: p.namaLengkap.trim(),
        discord: p.discord.trim(),
        ign: p.ign.trim(),
        idDuelLinks: p.duelId,
      })),
    }
    
    try {
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

  // Komponen UI saat sukses berhasil register
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
              <input id="email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); markTouched("email"); }} onBlur={() => markTouched("email")} className={`${inputBase} ${err("email") ? "border-destructive" : "border-border"}`} />
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
                <div
                  className="relative h-11 w-12 shrink-0 overflow-hidden rounded-lg border border-border shadow-sm transition-colors focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary"
                  style={{ backgroundColor: isValidHex(hex) ? hex : "#000000" }}
                >
                  <input
                    type="color"
                    value={isValidHex(hex) ? hex : "#000000"}
                    onChange={(e) => setHex(e.target.value)}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                </div>
                
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

          {/* AREA SMART PASTE */}
          <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-4 sm:p-5">
            <div className="mb-3">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                ⚡ Smart Paste (Isi Cepat)
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Copy-paste data pemain dari Spreadsheet/Notepad ke sini. <br/>
                <strong>Format:</strong> Nama - Discord - IGN - ID Duel Links (Gunakan koma/strip/garis miring sebagai pemisah).
              </p>
            </div>
            
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder="Contoh:&#10;Seto Kaiba / kaiba / BlueEyesMaster / 123-456-789&#10;Yugi Moto, yugi, KingOfGames, 987654321"
              className="w-full h-24 rounded-lg border border-border bg-background p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/40 transition-all"
            />
            
            <button
              type="button"
              onClick={handleSmartPaste}
              disabled={!bulkText.trim()}
              className="mt-3 flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Ekstrak & Masukkan ke Form
            </button>
          </div>

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

        <section className="glass glow-border rounded-2xl border p-5 sm:p-6">
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50">
              <input 
                type="checkbox" 
                checked={agreedData} 
                onChange={(e) => setAgreedData(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 rounded border-primary bg-background text-primary focus:ring-primary focus:ring-offset-background"
              />
              <span className="text-sm text-muted-foreground">
                Saya mewakili tim menyatakan bahwa seluruh data yang diisi adalah benar, asli, dan valid.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50">
              <input 
                type="checkbox" 
                checked={agreedRules} 
                onChange={(e) => setAgreedRules(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 rounded border-primary bg-background text-primary focus:ring-primary focus:ring-offset-background"
              />
              <span className="text-sm text-muted-foreground">
                Saya mewakili tim menyetujui seluruh syarat dan ketentuan yang tertulis di dalam <a href="/rules" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">Rulebook TWI Season 7</a>.
              </span>
            </label>

            <button 
              type="button" 
              onClick={handleReviewClick} 
              disabled={!agreedData || !agreedRules} 
              className="w-full rounded-xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:active:scale-100 mt-2"
            >
              Review Pendaftaran
            </button>
          </div>
        </section>
      </form>

      <ReviewModal open={modalOpen} onClose={() => setModalOpen(false)} form={{ email, namaTim, hex, players }} logo={logo} bukti={bukti} submitting={submitting} serverError={serverError} onConfirm={handleSubmit} />
    </>
  )
}
