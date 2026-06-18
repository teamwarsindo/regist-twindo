import Image from "next/image"
import { cn } from "@/lib/utils"
import { Countdown } from "@/components/countdown"
import { ThemeToggle } from "@/components/theme-toggle"
import { buttonVariants } from "@/components/ui/button"
import { ShieldIcon, DiscordIcon, RulesIcon, FormIcon } from "@/components/icons"

// Launch target — silakan ganti dengan tanggal asli turnamen.
const LAUNCH_TARGET = new Date("2026-07-01T08:00:00+07:00").getTime()
const DISCORD_URL = "https://discord.gg/hTJJRevA43"

export default function Page() {
  return (
    <main className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-background text-foreground">
      
      {/* Ambient esports glow behind the header */}
      <div
        className="ambient-glow pointer-events-none absolute inset-x-0 top-0 h-[420px]"
        aria-hidden="true"
      />

      {/* TOP BAR - Dilepas pagar pembatasnya agar full merentang ke ujung layar PC */}
      {/* Menggunakan lg:px-12 agar jarak dari tepi layar tetap terlihat elegan di monitor besar */}
      <div className="relative z-10 flex w-full items-center justify-between px-6 pt-6 lg:px-12">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          <ShieldIcon className="h-4 w-4 text-primary" />
          Official Website
        </div>
        <ThemeToggle />
      </div>

      {/* MAIN CONTENT - Tetap Rata Tengah namun dibiarkan berada di kanvas Full-Width */}
      <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-center px-4 pb-4 sm:px-6">
        
        {/* HEADER */}
        <header className="mt-6 mb-8 flex flex-col items-center text-center lg:mb-10">
          <div className="glow-border relative mb-6 h-[120px] w-[120px] overflow-hidden rounded-2xl sm:h-28 sm:w-28 lg:mb-8 lg:h-44 lg:w-44">
            <Image
              src="/logo.webp"
              alt="Logo Team Wars Indonesia"
              fill
              priority
              className="scale-[1.01] object-cover" 
            />
          </div>
          {/* Fluid Typography untuk layarnya yang kini Full-Width */}
          <h1 className="glow-text text-balance text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-[clamp(3.5rem,5vw,5.5rem)] lg:leading-[1.1]">
            TEAM WARS INDONESIA
          </h1>
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary sm:py-1.5 sm:text-sm lg:mt-6">
            Season 7 — Duel Links
          </p>
        </header>

        {/* SECTION KONTEN: Countdown & Tombol */}
        <section className="flex w-full flex-col items-center text-center">      
          
          {/* Area Countdown */}
          <div className="w-full max-w-3xl">
            <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground sm:mb-4 sm:text-xs">
              Battle Begins In
            </p>
            <Countdown target={LAUNCH_TARGET} />
          </div>

          {/* Area Tombol */}
          <div className="mt-8 flex w-full max-w-4xl flex-col items-center gap-2.5 lg:mt-10 lg:flex-row lg:justify-center">
            
            {/* 1. TOMBOL REGISTRASI (Warna Merah Crimson + Glow) -> Aksi Utama */}
            <a
              href="#"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 w-full gap-2 bg-[#DC2626] px-6 text-sm font-bold text-white shadow-[0_0_30px_-6px_#DC2626] hover:bg-[#B91C1C] lg:h-12 lg:w-auto lg:text-base lg:gap-2.5 [&_svg:not([class*='size-'])]:size-4 lg:[&_svg:not([class*='size-'])]:size-5",
              )}
            >
              <FormIcon className="h-4 w-4 lg:h-5 lg:w-5" />
              Team Registration
            </a>

            {/* 2. TOMBOL DISCORD (Warna Biru Khas Discord + Glow) -> Aksi Merek */}
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 w-full gap-2 bg-[#5865F2] px-6 text-sm font-bold text-white shadow-[0_0_30px_-6px_#5865F2] hover:bg-[#4752c4] lg:h-12 lg:w-auto lg:text-base lg:gap-2.5 [&_svg:not([class*='size-'])]:size-4 lg:[&_svg:not([class*='size-'])]:size-5",
              )}
            >
              <DiscordIcon className="h-4 w-4 lg:h-5 lg:w-5" />
              Join the Discord
            </a>

            {/* 3. TOMBOL RULEBOOK (Outline Transparan) -> Aksi Sekunder */}
            <a
              href="/rules"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "h-11 w-full gap-2 bg-gray-200 text-black hover:bg-gray-300 dark:bg-white dark:text-black dark:hover:bg-gray-200 lg:h-12 lg:w-auto lg:gap-2.5 lg:text-base [&_svg:not([class*='size-'])]:size-4 lg:[&_svg:not([class*='size-'])]:size-5",
                // "h-11 w-full gap-2 border-border/50 bg-transparent px-6 text-sm font-semibold text-foreground hover:bg-accent hover:text-accent-foreground lg:h-12 lg:w-auto lg:gap-2.5 lg:text-base [&_svg:not([class*='size-'])]:size-4 lg:[&_svg:not([class*='size-'])]:size-5",
              )}
            >
              <RulesIcon className="h-4 w-4 lg:h-5 lg:w-5" />
              Check Rulebook
            </a>

          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-auto text-center text-[10px] text-muted-foreground sm:mt-16 sm:text-xs">
          © {new Date().getFullYear()} Team Wars Indonesia. All rights reserved.
        </footer>

      </div>
    </main>
  )
}
