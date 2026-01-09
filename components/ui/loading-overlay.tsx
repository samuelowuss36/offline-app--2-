"use client"

import React from "react"
import { Spinner } from "@/components/ui/spinner"
import Logo from "@/components/ui/logo"

export default function LoadingOverlay({ text = "Owoabenes Mothercare & Kids Boutique" }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 p-6 bg-white/90 rounded-xl shadow-xl">
        <Spinner className="w-12 h-12 text-primary animate-spin" />
        <Logo size={56} className="rounded-full shadow-sm" />
        <div className="text-center">
          <p className="text-lg font-semibold brand-spinner text-slate-900">{text}</p>
          <p className="text-xs text-slate-500">Loading…</p>
        </div>
      </div>
    </div>
  )
}
