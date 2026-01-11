"use client"

import { Button } from "@/components/ui/button"
import Logo from "@/components/ui/logo"
import { getSession, type AuthSession } from "@/lib/auth"
import { getLogoPath } from "@/lib/navigation"
import { LogOut, Clock } from "lucide-react"
import { useEffect, useState } from "react"

interface TopBarProps {
  userRole: "admin" | "cashier"
  onLogout: () => void
}

export function TopBar({ userRole, onLogout }: TopBarProps) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [time, setTime] = useState("")
  const [logoSrc, setLogoSrc] = useState("./logo.jpeg")

  useEffect(() => {
    // Get session on client side only
    setSession(getSession())
    setLogoSrc(getLogoPath())
    
    const updateTime = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-card border-b border-border shadow-sm px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1 shadow-sm overflow-hidden">
          <img src={logoSrc} alt="Logo" className="w-full h-full object-contain rounded-full" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-primary">Owoabenes Mothercare & Kids Boutique</h1>
          <p className="text-sm text-muted-foreground">{userRole === "admin" ? "Admin Dashboard" : "Cashier Terminal"}</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{time}</span>
        </div>

        <div className="flex items-center gap-3 border-l border-border pl-6">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">{session?.username}</p>
            <p className="text-xs text-muted-foreground capitalize">{session?.role}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
