"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Home, Package, BarChart3, LogOut, Menu, Receipt } from "lucide-react"
import { useState } from "react"

interface SidebarProps {
  userRole: "admin" | "cashier"
  onLogout: () => void
}

export function Sidebar({ userRole, onLogout }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const adminLinks = [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/inventory", label: "Inventory", icon: Package },
    { href: "/admin/receipts", label: "Receipts", icon: Receipt },
    { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  ]

  const links = userRole === "admin" ? adminLinks : []

  return (
    <div
      className={cn(
        "bg-sidebar text-sidebar-foreground transition-all duration-300 flex flex-col border-r border-sidebar-border",
        collapsed ? "w-20" : "w-64",
      )}
    >
      <div className="p-4 border-b border-sidebar-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center rounded-lg hover:bg-sidebar-accent/20 p-2"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}>
            <button
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors",
                pathname === href
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "hover:bg-sidebar-accent/20 text-sidebar-foreground",
              )}
              title={label}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{label}</span>}
            </button>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <Button onClick={onLogout} variant="outline" className="w-full justify-center gap-2 bg-transparent" size="sm">
          <LogOut className="h-4 w-4" />
          {!collapsed && "Logout"}
        </Button>
      </div>
    </div>
  )
}
