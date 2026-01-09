"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { validateLogin, setSession } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const session = await validateLogin(username, password)

      if (session) {
        setSession(session)
        router.push(session.role === "admin" ? "/admin" : "/cashier")
      } else {
        setError("Invalid username or password")
      }
    } catch (err) {
      setError("An error occurred during login. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary to-primary/80 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold text-primary">Mother Care & Kids</CardTitle>
          <CardDescription>Professional POS System</CardDescription>
          <p className="text-sm text-muted-foreground">Offline Boutique Management</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={loading || !username || !password}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>

            <div className="space-y-2 border-t pt-4 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">Demo Credentials:</p>
              <div>
                <p>Admin:</p>
                <code className="rounded bg-muted px-2 py-1 text-xs">admin / admin123</code>
              </div>
              <div>
                <p>Cashier:</p>
                <code className="rounded bg-muted px-2 py-1 text-xs">cashier / cashier123</code>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
