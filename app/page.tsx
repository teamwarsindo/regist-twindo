import Image from "next/image"
import { cn } from "@/lib/utils"
import { Countdown } from "@/components/countdown"
import { ThemeToggle } from "@/components/theme-toggle"
import { buttonVariants } from "@/components/ui/button"
import { ShieldIcon, DiscordIcon, RulesIcon, FormIcon } from "@/components/icons"

// Launch target — replace with the real tournament date.
const LAUNCH_TARGET = new Date("2027-07-01T08:00:00+07:00").getTime()
const DISCORD_URL = "https://discord.gg/hTJJRevA43"

export default function Page() {
  return (
    <main className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-background text-foreground">
      
      {/* Ambient esports glow behind the header */}
      <div
        className="ambient-glow pointer-events-none absolute inset-x-0 top-0 h-[420px]"
        aria-hidden="true"
      />

      {/* Top bar - Tetap dipertahankan sesuai kodemu */}
      <div className="relative z-10 mx-auto flex w-full max-w-2xl items-center justify-between px-4 pt-6 sm:px-6 lg:max-w-4xl">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          <ShieldIcon className="h-4 w-4 text-primary" />
          Official Website
        </div>
        <ThemeToggle />
      </div>

      {/* MESIN PILAR TENGAH (CENTER PILLAR)
        Menggunakan justify-center untuk menengahkan seluruh blok secara bersamaan.
        py-[clamp(...)] berfungsi sebagai pegas anti-tabrakan atas/bawah.
      */}
      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-[clamp(1.5rem,4vh,3rem)] sm:px-6 lg:max-w-4xl">
        
        {/* Header - Skala fluid terkendali untuk PC */}
        <header className="flex flex-col items-center text-center">
          <div className="glow-border relative mb-5 h-[100px] w-[100px] overflow-hidden rounded-2xl sm:mb-6 sm:h-[120px] sm:w-[120px]">
            <Image
              src="/logo.webp"
              alt="Logo Team Wars Indonesia"
              fill
              priority
              className="scale-[1.01] object-cover" 
            />
          </div>
          <h1 className="glow-text text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-[clamp(2.5rem,4vw,3.5rem)] lg:leading-tight">
            TEAM WARS INDONESIA
          </h1>
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Season 7 — Duel Links
          </p>
        </header>

        {/* Section - Jarak fluid dari header menggunakan mt-[clamp(...)] */}
        <section className="mt-[clamp(1.5rem,4vh,2.5rem)] flex w-full flex-col items-center text-center">      
      
          {/* Countdown */}
          <div className="w-full max-w-xl">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
              Battle Begins In
            </p>
            <Countdown target={LAUNCH_TARGET} />
          </div>

          {/* FORMASI PIRAMIDA TERBALIK (1 + 2)
            Baris 1: Registrasi (Prioritas Bisnis, 100% Width)
            Baris 2: Discord & Rules (Berdampingan di PC, numpuk di HP)
          */}
          <div className="mt-[clamp(1.5rem,4vh,2.5rem)] flex w-full max-w-md flex-col gap-3 lg:max-w-lg">
            
            {/* Tombol Utama (Paling atas agar langsung terlihat) */}
            <a
              href="#"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "h-11 w-full gap-2.5 border-primary/40 bg-transparent px-6 text-base font-semibold text-foreground hover:bg-primary/10 hover:text-foreground [&_svg:not([class*='size-'])]:size-5",
              )}
            >
              <FormIcon className="h-5 w-5" />
              Team Registration
            </a>

            {/* Tombol Pendukung (Auto-collapse dari baris ke kolom jika layar sempit) */}
            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <a
                href={DISCORD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-11 w-full flex-1 gap-2.5 bg-[#5865F2] px-4 text-sm font-semibold text-white shadow-[0_0_30px_-6px_#5865F2] hover:bg-[#4752c4] [&_svg:not([class*='size-'])]:size-5",
                )}
              >
                <DiscordIcon className="h-5 w-5" />
                Join the Discord
              </a>
              <a
                href="/rules"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "h-11 w-full flex-1 gap-2.5 border-primary/40 bg-transparent px-4 text-sm font-semibold text-foreground hover:bg-primary/10 hover:text-foreground [&_svg:not([class*='size-'])]:size-5",
                )}
              >
                <RulesIcon className="h-5 w-5" />
                Rulebook TWI Season 7
              </a>
            </div>

          </div>
        </section>

        {/* Footer - Menutup pilar dengan jarak fluid */}
        <footer className="mt-[clamp(2rem,5vh,3rem)] text-center text-[11px] text-muted-foreground sm:text-xs">
          © {new Date().getFullYear()} Team Wars Indonesia. All rights reserved.
        </footer>
      </div>
    </main>
  )
}
