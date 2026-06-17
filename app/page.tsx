import { Countdown } from "@/components/countdown"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BookOpen, CalendarClock, Lock } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

// Launch target — replace with the real tournament date.
const LAUNCH_TARGET = new Date("2026-07-01T08:00:00+07:00").getTime()

const DISCORD_URL = "https://discord.gg/hTJJRevA43"

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M20.317 4.369A19.79 19.79 0 0 0 15.885 3a13.7 13.7 0 0 0-.617 1.27 18.27 18.27 0 0 0-5.535 0A13.2 13.2 0 0 0 9.108 3a19.74 19.74 0 0 0-4.432 1.369C1.69 8.79.87 13.1 1.28 17.347a19.92 19.92 0 0 0 6.067 3.08c.49-.668.927-1.377 1.304-2.122a12.9 12.9 0 0 1-2.053-.987c.172-.127.34-.26.5-.396a14.23 14.23 0 0 0 12.2 0c.163.14.331.272.5.396-.655.388-1.343.72-2.056.989.377.744.813 1.453 1.303 2.12a19.84 19.84 0 0 0 6.07-3.08c.48-4.923-.82-9.193-3.398-12.978ZM8.02 14.762c-1.183 0-2.157-1.085-2.157-2.42 0-1.333.955-2.42 2.157-2.42 1.21 0 2.176 1.096 2.157 2.42 0 1.335-.955 2.42-2.157 2.42Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.42 0-1.333.955-2.42 2.157-2.42 1.21 0 2.176 1.096 2.157 2.42 0 1.335-.946 2.42-2.157 2.42Z" />
    </svg>
  )
}

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
          <Lock className="h-4 w-4 text-primary" />
          Team Registration
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
        <section className="flex flex-1 flex-col items-center justify-center py-12 text-center sm:py-16">      
          <h1 className="font-heading text-5xl font-bold uppercase leading-[0.92] tracking-tight text-balance text-foreground sm:text-7xl md:text-8xl">
            Team Wars
            <span className="block text-glow text-primary">Indonesia</span>
          </h1>

          <p className="mt-4 font-heading text-xl font-semibold uppercase tracking-[0.3em] text-muted-foreground sm:text-2xl">
            Duel Links
          </p>

          {/* Countdown */}
          <div className="mt-10 w-full max-w-xl">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
              Battle Begins In
            </p>
            <Countdown target={LAUNCH_TARGET} />
          </div>

          {/* CTAs */}
          <div className="mt-10 flex w-full max-w-md flex-col items-center gap-3 sm:flex-row sm:justify-center">
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
              <BookOpen className="h-5 w-5" />
              Rulebook TWI Season 7
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Team Wars Indonesia. All rights reserved.
        </footer>
      </div>
    </main>
  )
}
