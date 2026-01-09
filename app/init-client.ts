import { initDB, getUsers } from "@/lib/db"

export async function initializeSystem() {
  try {
    await initDB()

    // Check if users exist, if not trigger server init
    const users = await getUsers()
    if (users.length === 0) {
      try {
        const response = await fetch("/api/init", { method: "POST" })
        if (response.ok) {
          console.log("[v0] System initialized successfully")
        }
      } catch (error) {
        console.warn("[v0] Could not trigger server init, continuing anyway")
      }
    }

    return true
  } catch (error) {
    console.error("[v0] Error initializing system:", error)
    return false
  }
}
