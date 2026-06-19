"use client";

import { useState } from "react";
import Image from "next/image"
import { RegistrationForm } from "@/components/registration-form"
import { ThemeToggle } from "@/components/theme-toggle"
import { ShieldIcon } from "@/components/icons"

export default function Page() {
  const [isCopied, setIsCopied] = useState(false);
  const accountNumber = "0460967538";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Gagal menyalin teks", err);
    }
  };

  return (
    <main className="relative flex min-h-[100dvh] flex-col overflow-x-hidden bg-background text-foreground">
      
      {/* Ambient esports glow behind the header */}
      <div
        className="ambient-glow pointer-events-none absolute inset-x-0 top-0 h-[420px]"
        aria-hidden="true"
      />

      {/* TOP BAR: Merentang Full-Width seperti Landing Page */}
      <div className="relative z-10 flex w-full items-center justify-between px-6 pt-6 lg:px-12">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          <ShieldIcon className="h-4 w-4 text-primary" />
          Official Registration
        </div>
        <ThemeToggle />
      </div>

      {/* MAIN CONTENT WRAPPER: Full-Width kanvas, elemen rata tengah (items-center) */}
      <div className="relative z-10 flex w-full flex-1 flex-col items-center px-4 pb-6 pt-6 sm:px-6">
        
        {/* HEADER: Dibuat megah dengan Fluid Typography sama seperti Landing Page */}
        <header className="mb-10 flex flex-col items-center text-center lg:mb-12">
          <div className="glow-border relative mb-6 h-[120px] w-[120px] overflow-hidden rounded-2xl">
            <Image
              src="/logo.webp"
              alt="Logo Team Wars Indonesia"
              fill
              priority
              className="scale-[1.01] object-cover" 
            />
          </div>
          <h1 className="glow-text text-balance text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-[clamp(3rem,4vw,4.5rem)] lg:leading-[1.1]">
            TEAM WARS INDONESIA
          </h1>
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary lg:mt-5">
            Season 7 — Duel Links
          </p>
          
          {/* INFO REKENING DENGAN TOMBOL COPY */}
          <div className="mt-8 max-w-md rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed text-muted-foreground backdrop-blur-sm sm:px-6">
            <p>Biaya pendaftaran Rp 300.000 di transfer ke rekening BCA</p>
            <div className="my-2 flex items-center justify-center gap-2">
              <span className="font-mono text-base font-bold tracking-wider text-foreground sm:text-lg">
                {accountNumber}
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center justify-center rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary transition-all hover:bg-primary/20 active:scale-95"
                title="Salin nomor rekening"
              >
                {isCopied ? "Tersalin! ✓" : "Salin 📋"}
              </button>
            </div>
            <p className="font-medium text-foreground">a.n Victor Widiputra.</p>
          </div>
        </header>

        {/* AREA FORM: Dibatasi max-w-2xl agar tidak melar di layar PC yang lebar */}
        <div className="w-full max-w-2xl">
          <RegistrationForm />
        </div>

        {/* FOOTER: mt-auto akan mendorong footer ke ujung bawah layar atau di bawah form */}
        <footer className="mt-auto pt-10 text-center text-[10px] text-muted-foreground sm:pt-16 sm:text-xs">
          © {new Date().getFullYear()} Team Wars Indonesia. All rights reserved.
        </footer>
        
      </div>
    </main>
  )
}
