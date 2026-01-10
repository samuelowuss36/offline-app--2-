import { getUser } from "./db"

export interface AuthSession {
  userId: string
  username: string
  role: "admin" | "cashier"
}

const SESSION_KEY = "pos_session"

export function setSession(session: AuthSession): void {
  // Use sessionStorage so session clears when app/browser is closed
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null
  // Use sessionStorage so session clears when app/browser is closed
  const data = sessionStorage.getItem(SESSION_KEY)
  return data ? JSON.parse(data) : null
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY)
}

export async function validateLogin(username: string, password: string): Promise<AuthSession | null> {
  const user = await getUser(username)
  if (!user) return null

  // Simple password validation (in production, use bcrypt)
  if (user.password !== password) return null

  const session: AuthSession = {
    userId: user.id,
    username: user.username,
    role: user.role,
  }

  return session
}
