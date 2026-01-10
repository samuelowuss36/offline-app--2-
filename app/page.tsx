"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSession } from "@/lib/auth"
import LoginPage from "@/components/auth/login-page"
import { initializeSystem } from "./init-client"

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [initError, setInitError] = useState<string | null>(null)
  const [session, setSession] = useState(getSession())

  useEffect(() => {
    const init = async () => {
      try {
        // Initialize database and create demo users if needed
        const success = await initializeSystem()
        
        if (!success) {
          console.warn("[v0] System initialization returned false, continuing anyway")
        }

        setSession(getSession())
      } catch (error) {
        console.error("[v0] Critical initialization error:", error)
        setInitError(error instanceof Error ? error.message : "Unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  useEffect(() => {
    if (!loading && !initError) {
      if (session) {
        router.push(session.role === "admin" ? "/admin" : "/cashier")
      }
    }
  }, [loading, session, router, initError])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary"></div>
          <p className="text-foreground font-medium">Initializing POS System...</p>
          <p className="text-sm text-muted-foreground mt-2">Setting up database...</p>
        </div>
      </div>
    )
  }

  if (initError) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center max-w-md p-6">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <svg className="h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Initialization Error</h2>
          <p className="text-sm text-muted-foreground mb-4">{initError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return <LoginPage />
}
