"use client"

import { Button } from "@/components/ui/button"
import { getSession } from "@/lib/auth"
import { LogOut, Clock } from "lucide-react"
import { useEffect, useState } from "react"

interface TopBarProps {
  userRole: "admin" | "cashier"
  onLogout: () => void
}

export function TopBar({ userRole, onLogout }: TopBarProps) {
  const session = getSession()
  const [time, setTime] = useState("")

  useEffect(() => {
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
      <div>
        <h1 className="text-2xl font-bold text-primary">Mother Care & Kids</h1>
        <p className="text-sm text-muted-foreground">{userRole === "admin" ? "Admin Dashboard" : "Cashier Terminal"}</p>
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
