"use client"

import type React from "react"
import { Suspense } from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSession, clearSession } from "@/lib/auth"
import { TopBar } from "@/components/layout/top-bar"

export default function CashierLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const session = getSession()
    if (!session || session.role !== "cashier") {
      router.push("/")
      return
    }
    setAuthorized(true)
  }, [router])

  if (!authorized) {
    return null
  }

  const handleLogout = () => {
    clearSession()
    router.push("/")
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopBar userRole="cashier" onLogout={handleLogout} />
      <main className="flex-1 overflow-auto">
        <Suspense fallback={null}>{children}</Suspense>
      </main>
    </div>
  )
}
