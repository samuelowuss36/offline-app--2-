"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { getSession, clearSession } from "@/lib/auth"
import { navigateToLogin } from "@/lib/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/top-bar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Only run on client side after mount
    const checkAuth = () => {
      try {
        const session = getSession()
        if (!session || session.role !== "admin") {
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
    <div className="flex h-screen bg-background">
      <Sidebar userRole="admin" onLogout={handleLogout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar userRole="admin" onLogout={handleLogout} />
        <main className="flex-1 overflow-auto bg-muted/30">{children}</main>
      </div>
    </div>
  )
}
