"use client"

import { useState, useEffect } from "react"
import { FileDropzone } from "@/components/file-dropzone"
import { CloseIcon, LoaderIcon } from "@/components/icons"
import { 
  MAX_FILE_SIZE, 
  MIN_PLAYERS, 
  MAX_PLAYERS, 
  STORAGE_KEY,
  ROSTER_ROLES,
  type FormState, 
  type Player, 
  type UploadedFile,
  defaultPlayers,
  findDuplicateFields,
  createPlayer,
  assignRole
} from "@/lib/registration"

export function RegistrationForm() {
  // --- STATE MANAJEMEN ---
  const [form, setForm] = useState<FormState>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try { return JSON.parse(saved) } catch (e) { console.error(e) }
      }
    }
    return {
      email: "",
      namaTim: "",
      hex: "#3b82f6", // Default biru
      logoTim: null,
      buktiTransfer: null,
      players: defaultPlayers()
    } as any
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false) // State untuk zoom bukti transfer

  // --- PERSISTENSI DRAFT ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
  }, [form])

  // --- LOCK BACKGROUND SCROLL ---
  useEffect(() => {
    if (isPreviewOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isPreviewOpen])

  // --- LOGIKA PENCARIAN KETUA & WAKIL (NAMA ASLI) ---
  const namaKetua = form.players.find((p) => p.role === "Ketua")?.namaLengkap || "-"
  const namaWakil = form.players.find((p) => p.role === "Wakil Ketua")?.namaLengkap || "-"

  // --- VALIDASI FORM ---
  function validateForm(): boolean {
    const newErrors: Record<string, string> = {}
    
    if (!form.email.trim()) newErrors.email = "Email wajib diisi."
    if (!form.namaTim.trim()) newErrors.namaTim = "Nama tim wajib diisi."
    if (!form.logoTim) newErrors.logoTim = "Logo tim wajib diunggah."
    if (!form.buktiTransfer) newErrors.buktiTransfer = "Bukti transfer wajib diunggah."

    // Validasi Roster
    form.players.forEach((p, idx) => {
      if (!p.namaLengkap.trim()) newErrors[`p-${p.id}-nama`] = `Nama lengkap pemain #${idx + 1} wajib diisi.`
      if (!p.discord.trim()) newErrors[`p-${p.id}-discord`] = `Discord ID pemain #${idx + 1} wajib diisi.`
      if (!p.ign.trim()) newErrors[`p-${p.id}-ign`] = `IGN pemain #${idx + 1} wajib diisi.`
      if (!p.duelId.trim()) newErrors[`p-${p.id}-duelId`] = `Duel ID pemain #${idx + 1} wajib diisi.`
    })

    // Validasi Duplikat Lokal
    const duplicates = findDuplicateFields(form.players)
    duplicates.forEach((key) => {
      newErrors[key] = "Data ini terdeteksi ganda di dalam roster Anda."
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleOpenPreview(e: React.FormEvent) {
    e.preventDefault()
    if (validateForm()) {
      setIsPreviewOpen(true)
    } else {
      const firstError = Object.keys(errors)[0]
      document.getElementById(firstError)?.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  // --- SUBMIT FINAL KE BACKEND ---
  async function handleFinalSubmit() {
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || "Terjadi kesalahan saat mendaftar.")
        return
      }

      alert("Pendaftaran Berhasil! Tim Anda telah tercatat.")
      localStorage.removeItem(STORAGE_KEY)
      window.location.reload()
    } catch (err) {
      console.error(err)
      alert("Gagal terhubung ke server. Hubungi panitia jika masalah berlanjut.")
    } finally {
      setIsSubmitting(false)
      setIsPreviewOpen(false)
    }
  }

  // --- UTIRITAS MANAJEMEN ROSTER ---
  function updatePlayer(id: string, fields: Partial<Player>) {
    setForm({
      ...form,
      players: form.players.map((p) => (p.id === id ? { ...p, ...fields } : p))
    })
  }

  function addPlayer() {
    if (form.players.length >= MAX_PLAYERS) return
    setForm({ ...form, players: [...form.players, createPlayer("Anggota")] })
  }

  function removePlayer(id: string) {
    if (form.players.length <= MIN_PLAYERS) return
    setForm({ ...form, players: form.players.filter((p) => p.id !== id) })
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <form onSubmit={handleOpenPreview} className="space-y-8">
        {/* SECTION 1: IDENTITAS TIM */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-foreground">Identitas Tim</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">Email Kontak</label>
              <input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary" />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="namaTim" className="mb-1.5 block text-sm font-medium text-foreground">Nama Tim</label>
              <input id="namaTim" type="text" value={form.namaTim} onChange={(e) => setForm({ ...form, namaTim: e.target.value })} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary" />
              {errors.namaTim && <p className="mt-1 text-xs text-destructive">{errors.namaTim}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Warna Identitas Tim</label>
              <div className="flex items-center gap-3">
                <input type="color" value={form.hex} onChange={(e) => setForm({ ...form, hex: e.target.value })} className="h-10 w-16 cursor-pointer rounded-lg border border-border bg-transparent p-0" />
                <span className="text-sm font-mono text-muted-foreground uppercase">{form.hex}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: BERKAS MEDIA */}
        <div className="grid gap-6 sm:grid-cols-2">
          <FileDropzone id="logoTim" label="Logo Tim" value={form.logoTim} onChange={(file) => setForm({ ...form, logoTim: file })} error={errors.logoTim} hint="PNG / JPG, Maks 10MB (Akan diupload original)" />
          <FileDropzone id="buktiTransfer" label="Bukti Transfer (Rp 50.000)" value={form.buktiTransfer} onChange={(file) => setForm({ ...form, buktiTransfer: file })} error={errors.buktiTransfer} hint="Format gambar murni, Maks 10MB" />
        </div>

        {/* SECTION 3: ROSTER PEMAIN */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Roster Pemain ({form.players.length})</h2>
            <p className="text-xs text-muted-foreground">Minimal {MIN_PLAYERS}, Maksimal {MAX_PLAYERS}</p>
          </div>
          
          <div className="space-y-6">
            {form.players.map((player, index) => (
              <div key={player.id} className="relative rounded-xl border border-border bg-background/50 p-4 pt-8 sm:pt-4">
                <div className="absolute left-4 top-3 flex items-center gap-2 sm:static sm:mb-3">
                  <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>
                  <select value={player.role} onChange={(e) => setForm({ ...form, players: assignRole(form.players, player.id, e.target.value as any) })} className="rounded-lg border border-border bg-background px-2 py-1 text-xs font-semibold text-foreground">
                    {ROSTER_ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
                  </select>
                </div>

                {form.players.length > MIN_PLAYERS && (
                  <button type="button" onClick={() => removePlayer(player.id)} className="absolute right-3 top-3 text-muted-foreground hover:text-destructive">
                    <CloseIcon className="h-4 w-4" />
                  </button>
                )}

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <input type="text" placeholder="Nama Lengkap" value={player.namaLengkap} onChange={(e) => updatePlayer(player.id, { namaLengkap: e.target.value })} className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm" />
                  <input type="text" placeholder="Discord ID" value={player.discord} onChange={(e) => updatePlayer(player.id, { discord: e.target.value })} className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm" />
                  <input type="text" placeholder="In-Game Name" value={player.ign} onChange={(e) => updatePlayer(player.id, { ign: e.target.value })} className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm" />
                  <input type="text" placeholder="Duel ID (e.g. 123-456-789)" value={player.duelId} onChange={(e) => updatePlayer(player.id, { duelId: e.target.value })} className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm" />
                </div>
              </div>
            ))}
          </div>

          {form.players.length < MAX_PLAYERS && (
            <button type="button" onClick={addPlayer} className="mt-4 w-full rounded-xl border border-dashed border-border py-2.5 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary">
              + Tambah Pemain Cadangan
            </button>
          )}
        </div>

        <button type="submit" className="w-full rounded-xl bg-primary py-3.5 text-center text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
          Lanjut ke Preview
        </button>
      </form>

      {/* ========================================================= */}
      {/* 🌟 MODAL POP-UP: PREVIEW PENDAFTARAN (DISCORD EMBED STYLE) */}
      {/* ========================================================= */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-border p-4">
              <h2 className="text-lg font-bold text-foreground">Preview Pendaftaran</h2>
              <button type="button" onClick={() => setIsPreviewOpen(false)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Konten Scroll Modal */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              {/* Desain Sejajar: Logo + Nama Tim + Cepat Info Pemimpin */}
              <div className="flex items-center gap-4 border-b border-border pb-4">
                {form.logoTim?.base64 && (
                  <img 
                    src={form.logoTim.base64} 
                    alt="Preview Logo" 
                    className="h-16 w-16 shrink-0 rounded-xl border-2 object-cover bg-background"
                    style={{ borderColor: form.hex }}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-xl font-black text-foreground uppercase tracking-tight">{form.namaTim || "NAMA TIM"}</h3>
                  <div className="mt-1 flex flex-col gap-0.5 text-xs text-muted-foreground sm:flex-row sm:gap-4">
                    <p>👑 <span className="font-semibold text-foreground">Ketua:</span> {namaKetua}</p>
                    <p>👥 <span className="font-semibold text-foreground">Wakil:</span> {namaWakil}</p>
                  </div>
                </div>
              </div>

              {/* Kartu Informasi Utama Berbentuk Gaya Discord Embed */}
              <div 
                className="rounded-xl border border-border bg-background/40 p-4 shadow-inner space-y-4"
                style={{ borderLeft: `6px solid ${form.hex}` }}
              >
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-0.5">EMAIL KONTAK</span>
                  <p className="text-sm font-medium text-foreground">{form.email}</p>
                </div>

                {/* Box Bukti Transfer yang Fleksibel & Responsif */}
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">BUKTI TRANSFER</span>
                  {form.buktiTransfer?.base64 ? (
                    <div>
                      <div 
                        role="button"
                        onClick={() => setIsZoomed(true)}
                        className="group relative inline-flex h-auto max-h-[320px] w-full max-w-sm cursor-zoom-in items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/50 transition-colors hover:bg-muted"
                      >
                        <img 
                          src={form.buktiTransfer.base64} 
                          alt="Bukti Transfer" 
                          className="h-auto max-h-[320px] max-w-full object-contain"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                          <span className="rounded-md bg-black/60 px-2.5 py-1 text-xs text-white">Klik untuk memperbesar</span>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground truncate">{form.buktiTransfer.name}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-destructive">Belum ada file bukti transfer.</p>
                  )}
                </div>
              </div>

              {/* Tinjauan Roster Pemain */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Roster Terdaftar ({form.players.length} Pemain)</span>
                <div className="grid gap-3 sm:grid-cols-2">
                  {form.players.map((p, idx) => (
                    <div key={p.id} className="rounded-xl border border-border bg-background/50 p-3 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="truncate text-sm font-bold text-foreground">{idx + 1}. {p.namaLengkap}</p>
                        <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          p.role === "Ketua" ? "bg-amber-500/10 text-amber-500" : p.role === "Wakil Ketua" ? "bg-sky-500/10 text-sky-500" : "bg-muted text-muted-foreground"
                        }`}>{p.role}</span>
                      </div>
                      <div className="text-xs font-mono text-muted-foreground space-y-0.5 bg-background/30 p-2 rounded-lg border border-border/50">
                        <p className="truncate">👾 IGN: <span className="text-foreground font-sans font-medium">{p.ign}</span></p>
                        <p className="truncate">🆔 ID: <span className="text-foreground">{p.duelId}</span></p>
                        <p className="truncate">💬 DC: <span className="text-foreground font-sans">{p.discord}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer Modal: Tombol Aksi */}
            <div className="flex items-center justify-end gap-3 border-t border-border bg-muted/40 p-4">
              <button type="button" disabled={isSubmitting} onClick={() => setIsPreviewOpen(false)} className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50">
                Kembali
              </button>
              <button type="button" disabled={isSubmitting} onClick={handleFinalSubmit} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50">
                {isSubmitting ? (
                  <>
                    <LoaderIcon className="h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Kirim Pendaftaran"
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 🌟 LIGHTBOX: VIEW FULLSCREEN BUKTI TRANSFER */}
      {/* ========================================================= */}
      {isZoomed && form.buktiTransfer?.base64 && (
        <div 
          role="button"
          onClick={() => setIsZoomed(false)}
          className="fixed inset-0 z-[100] flex cursor-zoom-out items-center justify-center bg-black/90 p-4 backdrop-blur-sm transition-opacity"
        >
          <img 
            src={form.buktiTransfer.base64} 
            alt="Bukti Transfer Berukuran Penuh" 
            className="max-h-[92vh] max-w-[92vw] object-contain rounded-md shadow-2xl animate-scale-up"
          />
        </div>
      )}

    </div>
  )
      }
                
