"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSession } from "@/lib/auth"
import LoginPage from "@/components/auth/login-page"
import { initializeSystem } from "./init-client"

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(getSession())

  useEffect(() => {
    const init = async () => {
      try {
        // Initialize database and create demo users if needed
        await initializeSystem()

        setSession(getSession())
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  useEffect(() => {
    if (!loading) {
      if (session) {
        router.push(session.role === "admin" ? "/admin" : "/cashier")
      }
    }
  }, [loading, session, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary"></div>
          <p className="text-foreground font-medium">Initializing POS System...</p>
          <p className="text-sm text-muted-foreground mt-2">Setting up database...</p>
        </div>
      </div>
    )
  }

  return <LoginPage />
}
