"use client"

import { useRef, useState, type DragEvent } from "react"
import { UploadIcon, CloseIcon } from "@/components/icons"
import { MAX_FILE_SIZE, compressImage, type UploadedFile } from "@/lib/registration"

interface FileDropzoneProps {
  id: string
  label: string
  hint?: string
  value: UploadedFile | null
  onChange: (file: UploadedFile | null) => void
  error?: string
}

export function FileDropzone({ id, label, hint, value, onChange, error }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [isCompressing, setIsCompressing] = useState(false)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setLocalError(null)

    if (!file.type.startsWith("image/")) {
      setLocalError("File harus berupa gambar.")
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setLocalError("Ukuran file asli melebihi batas 5MB.")
      return
    }

    try {
      setIsCompressing(true)
      // Menjalankan mesin kompresi pintar langsung di HP/PC peserta
      const base64 = await compressImage(file)
      // Ukuran simulasi setelah dikompres
      const compressedSize = Math.round((base64.length * 3) / 4)
      onChange({ name: file.name, size: compressedSize, base64 })
    } catch (err) {
      setLocalError("Gagal memproses gambar.")
    } finally {
      setIsCompressing(false)
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  const shownError = error ?? localError

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </label>

      {value ? (
        <div className="flex items-center gap-4 rounded-xl border border-border bg-background/50 p-3">
          <img src={value.base64} alt={`Pratinjau ${label}`} className="h-16 w-16 shrink-0 rounded-lg border border-border object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{value.name}</p>
            <p className="text-xs text-muted-foreground">{(value.size / 1024).toFixed(0)} KB</p>
          </div>
          <button type="button" onClick={() => { onChange(null); setLocalError(null); if (inputRef.current) inputRef.current.value = "" }} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => !isCompressing && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 text-center transition-colors ${
            dragging ? "border-primary bg-primary/5" : shownError ? "border-destructive bg-background/40" : "border-border bg-background/40 hover:border-primary/50 hover:bg-primary/5"
          } ${isCompressing ? "opacity-50 cursor-wait" : ""}`}
        >
          <UploadIcon className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            {isCompressing ? "Memproses gambar..." : "Seret & lepas atau klik untuk unggah"}
          </p>
          <p className="text-xs text-muted-foreground">{hint ?? "PNG / JPG, maks 5MB"}</p>
        </div>
      )}
      <input ref={inputRef} id={id} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
      {shownError && <p className="mt-1 text-xs font-medium text-destructive">{shownError}</p>}
    </div>
  )
}
