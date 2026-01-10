"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSession, clearSession } from "@/lib/auth"
import { Sidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/top-bar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const session = getSession()
    if (!session || session.role !== "admin") {
      window.location.href = "./"
      return
    }
    setAuthorized(true)
  }, [router])

  if (!authorized) {
    return null
  }

  const handleLogout = () => {
    clearSession()
    window.location.href = "./"
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
