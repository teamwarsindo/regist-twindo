import Image from "next/image"
import { cn } from "@/lib/utils"
import { Countdown } from "@/components/countdown"
import { ThemeToggle } from "@/components/theme-toggle"
import { buttonVariants } from "@/components/ui/button"
import { ShieldIcon, DiscordIcon, RulesIcon, FormIcon } from "@/components/icons"

// Launch target — replace with the real tournament date.
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

      {/* Top bar */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-4 pt-6 sm:px-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          <ShieldIcon className="h-4 w-4 text-primary" />
          Official Website
        </div>
        <ThemeToggle />
      </div>

      {/* Main Content Wrapper - Sistem "Pilar Tengah" untuk mengatasi scroll bocor & jurang kosong */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 pb-6 pt-6 sm:px-6">
        
        {/* HEADER: Rata tengah, skala membesar di layar lebar (PC) */}
        <header className="mb-10 flex flex-col items-center text-center">
          <div className="glow-border relative mb-6 h-28 w-28 overflow-hidden rounded-2xl sm:h-36 sm:w-36 lg:mb-8 lg:h-44 lg:w-44">
            <Image
              src="/logo.webp"
              alt="Logo Team Wars Indonesia"
              fill
              priority
              className="scale-[1.01] object-cover" 
            />
          </div>
          <h1 className="glow-text text-balance text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-[clamp(3.5rem,5vw,5.5rem)] lg:leading-[1.1]">
            TEAM WARS INDONESIA
          </h1>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary sm:text-sm lg:mt-6">
            Season 7 — Duel Links
          </p>
        </header>

        {/* SECTION KONTEN: Countdown & Tombol */}
        <section className="flex w-full flex-col items-center text-center">      
          
          {/* Countdown Area - max-w-3xl agar membentang luas di PC */}
          <div className="w-full max-w-3xl">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
              Battle Begins In
            </p>
            <Countdown target={LAUNCH_TARGET} />
          </div>

          {/* CTAs Area - max-w-4xl agar tidak saling berdesakan di PC */}
          {/* flex-col untuk HP (vertikal), lg:flex-row untuk PC (horizontal sejajar) */}
          <div className="mt-10 flex w-full max-w-4xl flex-col items-center gap-3 lg:flex-row lg:justify-center">
            
            {/* 1. TOMBOL REGISTRASI (Primary Button - Menyala Terang) */}
            <a
              href="#"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 w-full gap-2.5 bg-[#5865F2] px-6 text-base font-bold text-white shadow-[0_0_30px_-6px_#5865F2] hover:bg-[#4752c4] lg:w-auto [&_svg:not([class*='size-'])]:size-5",
              )}
            >
              <FormIcon className="h-5 w-5" />
              Team Registration
            </a>

            {/* 2. TOMBOL DISCORD (Secondary Button - Outline Transparan) */}
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "h-12 w-full gap-2.5 border-primary/40 bg-transparent px-6 text-base font-semibold text-foreground hover:bg-primary/10 hover:text-foreground lg:w-auto [&_svg:not([class*='size-'])]:size-5",
              )}
            >
              <DiscordIcon className="h-5 w-5" />
              Join the Discord
            </a>

            {/* 3. TOMBOL RULEBOOK (Secondary Button - Outline Transparan) */}
            <a
              href="/rules"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "h-12 w-full gap-2.5 border-primary/40 bg-transparent px-6 text-base font-semibold text-foreground hover:bg-primary/10 hover:text-foreground lg:w-auto [&_svg:not([class*='size-'])]:size-5",
              )}
            >
              <RulesIcon className="h-5 w-5" />
              Rulebook TWI Season 7
            </a>

          </div>
        </section>

        {/* FOOTER - Menempel rapi di dasar "Pilar Tengah" */}
        <footer className="mt-16 text-center text-[11px] text-muted-foreground sm:mt-20 sm:text-xs">
          © {new Date().getFullYear()} Team Wars Indonesia. All rights reserved.
        </footer>

      </div>
    </main>
  )
}
