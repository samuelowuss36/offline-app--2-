"use client"

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
    { href: "./", label: "Dashboard", icon: Home, matchPath: "/admin" },
    { href: "./inventory/", label: "Inventory", icon: Package, matchPath: "/admin/inventory" },
    { href: "./receipts/", label: "Receipts", icon: Receipt, matchPath: "/admin/receipts" },
    { href: "./reports/", label: "Reports", icon: BarChart3, matchPath: "/admin/reports" },
  ]

  const links = userRole === "admin" ? adminLinks : []

  const handleNavigation = (href: string) => {
    window.location.href = href
  }

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
        {links.map(({ href, label, icon: Icon, matchPath }) => (
          <button
            key={href}
            onClick={() => handleNavigation(href)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors",
              pathname === matchPath || pathname === matchPath + "/"
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "hover:bg-sidebar-accent/20 text-sidebar-foreground",
            )}
            title={label}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">{label}</span>}
          </button>
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
