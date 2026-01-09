import { getUser } from "./db"

export interface AuthSession {
  userId: string
  username: string
  role: "admin" | "cashier"
}

const SESSION_KEY = "pos_session"

export function setSession(session: AuthSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null
  const data = localStorage.getItem(SESSION_KEY)
  return data ? JSON.parse(data) : null
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY)
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
