"use client"

import type React from "react"
import { Suspense } from "react"
import { useEffect, useState } from "react"
import { getSession, clearSession } from "@/lib/auth"
import { navigateToLogin } from "@/lib/navigation"
import { TopBar } from "@/components/layout/top-bar"

export default function CashierLayout({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Only run on client side after mount
    const checkAuth = () => {
      try {
        const session = getSession()
        if (!session || session.role !== "cashier") {
          navigateToLogin()
          return
        }
        setAuthorized(true)
      } catch (error) {
        console.error("[v0] Auth check error:", error)
        navigateToLogin()
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuth()
  }, [])

  // Show loading state during initial client-side check
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!authorized) {
    return null
  }

  const handleLogout = () => {
    clearSession()
    navigateToLogin()
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
