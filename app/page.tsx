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
    <main className="relative min-h-[100dvh] overflow-hidden bg-background text-foreground">
      {/* Ambient esports glow behind the header */}
      <div
        className="ambient-glow pointer-events-none absolute inset-x-0 top-0 h-[420px]"
        aria-hidden="true"
      />

      {/* Top bar */}
      <div className="relative z-10 mx-auto flex w-full max-w-2xl items-center justify-between px-4 pt-6 sm:px-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          <ShieldIcon className="h-4 w-4 text-primary" />
          Official Website
        </div>
        <ThemeToggle />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-16 pt-6 sm:px-6">
        {/* Header */}
        <header className="mb-10 flex flex-col items-center text-center">
          <div className="relative mb-6 h-[120px] w-[120px] overflow-hidden rounded-2xl glow-border">
            <Image
              src="/logo.webp"
              alt="Logo Team Wars Indonesia"
              fill
              priority
              className="object-cover scale-[1.01]" 
            />
          </div>
          <h1 className="glow-text text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            TEAM WARS INDONESIA
          </h1>
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Season 7 — Duel Links
          </p>
        </header>

        {/* Hero */}
        <section className="flex flex-1 flex-col items-center justify-center py-3 text-center sm:py-4">      
      
          {/* Countdown */}
          <div className="mt-5 w-full max-w-xl">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
              Battle Begins In
            </p>
            <Countdown target={LAUNCH_TARGET} />
          </div>

          {/* CTAs */}
          <div className="mt-5 flex w-full max-w-md flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 w-full gap-2.5 bg-[#5865F2] px-6 text-base font-semibold text-white shadow-[0_0_30px_-6px_#5865F2] hover:bg-[#4752c4] sm:w-auto [&_svg:not([class*='size-'])]:size-5",
              )}
            >
              <DiscordIcon className="h-5 w-5" />
              Join the Discord
            </a>
            <a
              href="/rules"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "h-11 w-full gap-2 border-primary/40 bg-transparent px-6 text-base font-semibold text-foreground hover:bg-primary/10 hover:text-foreground sm:w-auto [&_svg:not([class*='size-'])]:size-5",
              )}
            >
              <RulesIcon className="h-5 w-5" />
              Rulebook TWI Season 7
            </a>
            <a
              href="#"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "h-11 w-full gap-2 border-primary/40 bg-transparent px-6 text-base font-semibold text-foreground hover:bg-primary/10 hover:text-foreground sm:w-auto [&_svg:not([class*='size-'])]:size-5",
              )}
            >
              <FormIcon className="h-5 w-5" />
              Team Registration
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-10 mt-auto text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Team Wars Indonesia. All rights reserved.
        </footer>
      </div>
    </main>
  )
}
