import Image from "next/image"
import { RegistrationForm } from "@/components/registration-form"
import { ThemeToggle } from "@/components/theme-toggle"
import { ShieldIcon } from "@/components/icons"

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Ambient esports glow behind the header */}
      <div
        className="ambient-glow pointer-events-none absolute inset-x-0 top-0 h-[420px]"
        aria-hidden="true"
      />

      {/* Top bar */}
      <div className="relative z-10 mx-auto flex w-full max-w-2xl items-center justify-between px-4 pt-6 sm:px-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          <ShieldIcon className="h-4 w-4 text-primary" />
          Official Registration
        </div>
        <ThemeToggle />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-16 pt-6 sm:px-6">
        {/* Header */}
        <header className="mb-10 flex flex-col items-center text-center">
          {/* 1. HAPUS padding (p-3), TAMBAH overflow-hidden agar hasil zoom tidak keluar garis */}
          <div className="glow-border mb-6 overflow-hidden rounded-2xl backdrop-blur-sm">
            <Image
              src="/logo.webp" // atau .png sesuai file Kapten
              alt="Logo Team Wars Indonesia"
              width={120}
              height={120}
              priority
              {/* 2. UBAH DI SINI: Tambah scale-125 untuk nge-zoom logonya */}
              className="h-[120px] w-[120px] object-cover scale-125 transition-transform"
            />
          </div>
          <h1 className="glow-text text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            TEAM WARS INDONESIA
          </h1>
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Season 7 — Duel Links
          </p>
          <p className="mt-5 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
            Biaya pendaftaran Rp 300.000 di transfer ke rekening BCA 0460967538 a.n Victor Widiputra.
          </p>
        </header>

        <RegistrationForm />

        <footer className="mt-12 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Team Wars Indonesia. All rights reserved.
        </footer>
      </div>
    </main>
  )
}
