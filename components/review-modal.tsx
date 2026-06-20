"use client"

import { useEffect, useMemo, useState } from "react"
import { CloseIcon, AlertIcon } from "@/components/icons"
import type { FormState, UploadedFile } from "@/lib/registration"

interface ReviewModalProps {
  open: boolean
  onClose: () => void
  form: FormState
  logo: UploadedFile | null
  bukti: UploadedFile | null
  submitting: boolean
  serverError: string | null
  onConfirm: () => void
}

const roleIcons: Record<string, string> = { 
  "Ketua": "👑", 
  "Wakil Ketua": "⭐", 
  "Anggota": "👤" 
}

const roleColors: Record<string, string> = {
  "Ketua": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  "Wakil Ketua": "bg-slate-300/10 text-slate-300 border-slate-300/20",
  "Anggota": "bg-blue-500/10 text-blue-500 border-blue-500/20"
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border py-2 last:border-0 sm:flex-row sm:justify-between sm:gap-4">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm text-foreground sm:text-right">{value || "—"}</span>
    </div>
  )
}

export function ReviewModal({
  open,
  onClose,
  form,
  logo,
  bukti,
  submitting,
  serverError,
  onConfirm,
}: ReviewModalProps) {
  const [a, setA] = useState(0)
  const [b, setB] = useState(0)
  const [answer, setAnswer] = useState("")
  const [captchaError, setCaptchaError] = useState<string | null>(null)

  // Regenerate captcha whenever the modal opens
  useEffect(() => {
    if (open) {
      setA(Math.floor(Math.random() * 8) + 1)
      setB(Math.floor(Math.random() * 8) + 1)
      setAnswer("")
      setCaptchaError(null)
    }
  }, [open])

  const captchaOk = useMemo(
    () => Number.parseInt(answer, 10) === a + b,
    [answer, a, b],
  )

  if (!open) return null

  function handleConfirm() {
    if (!captchaOk) {
      setCaptchaError("Jawaban captcha salah. Coba lagi.")
      return
    }
    setCaptchaError(null)
    onConfirm()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-title"
      onClick={onClose}
    >
      <div
        className="glow-border glass flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border bg-popover/90 shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 id="review-title" className="text-lg font-semibold text-foreground">
            Tinjau Data Tim
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Tutup"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="mb-4 flex items-center gap-4">
            {logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logo.base64 || "/placeholder.svg"}
                alt="Logo tim"
                className="h-14 w-14 rounded-lg border border-border object-cover"
              />
            )}
            <div className="flex items-center gap-2">
              <span
                className="h-6 w-6 rounded-md border border-border"
                style={{ backgroundColor: form.hex }}
                aria-hidden="true"
              />
              <span className="font-mono text-sm text-muted-foreground">{form.hex}</span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card px-4 py-2">
            <Row label="Email" value={form.email} />
            <Row label="Nama Tim" value={form.namaTim} />
            
            {/* Pratinjau Bukti Transfer Khusus */}
            <div className="flex flex-col gap-2 py-3 border-t border-border">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Bukti Transfer
              </span>
              {bukti?.base64 ? (
                <div className="flex flex-col gap-2">
                  <img
                    src={bukti.base64}
                    alt="Pratinjau Bukti Transfer"
                    className="max-h-40 w-auto rounded-lg border border-border object-contain bg-black/20"
                  />
                  <span className="text-xs text-muted-foreground truncate">{bukti.name}</span>
                </div>
              ) : (
                <span className="text-sm text-foreground">Belum diunggah</span>
              )}
            </div>
          </div>

          <h3 className="mb-2 mt-5 text-sm font-semibold text-foreground">
            Roster ({form.players.length} Pemain)
          </h3>
          <div className="flex flex-col gap-3">
            {form.players.map((p, i) => (
              <div key={p.id} className="rounded-xl border border-border bg-card p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {i + 1}. {p.namaLengkap || "—"}
                  </span>
                  {/* Badge Role Dinamis */}
                  <span className={`flex items-center gap-1 border px-2 py-0.5 rounded text-[11px] font-semibold ${roleColors[p.role]}`}>
                    {roleIcons[p.role]} {p.role}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-x-4 gap-y-0.5 text-xs text-muted-foreground sm:grid-cols-3">
                  <span>Discord: {p.discord || "—"}</span>
                  <span>IGN: {p.ign || "—"}</span>
                  <span>ID: {p.duelId || "—"}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Math Captcha */}
          <div className="mt-5 rounded-xl border border-border bg-muted/40 p-4">
            <label
              htmlFor="captcha"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Verifikasi: Berapa hasil dari{" "}
              <span className="font-mono font-semibold">
                {a} + {b}
              </span>{" "}
              ?
            </label>
            <input
              id="captcha"
              type="number"
              inputMode="numeric"
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value)
                setCaptchaError(null)
              }}
              placeholder="Jawaban"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-foreground"
            />
            {captchaError && (
              <p className="mt-1 text-xs font-medium text-destructive">{captchaError}</p>
            )}
          </div>

          {serverError && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive"
            >
              <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">Pengiriman Gagal</p>
                <p className="text-sm">{serverError}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t border-border px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 rounded-xl border border-border bg-background py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            Kembali
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="flex-[2] rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all enabled:hover:brightness-110 disabled:opacity-50"
          >
            {submitting ? "⏳ Mengunggah Data (Bisa memakan waktu ±10 detik)..." : "Konfirmasi & Kirim Pendaftaran"}
          </button>
        </div>
      </div>
    </div>
  )
}
