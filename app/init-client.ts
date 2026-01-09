import { initDB, getUsers, addUser } from "@/lib/db"

export async function initializeSystem() {
  try {
    await initDB()

    // Check if users exist, if not create demo users
    const users = await getUsers()
    if (users.length === 0) {
      // Create demo users
      await addUser({
        id: `USER-${Date.now()}-1`,
        username: "admin",
        password: "admin123",
        role: "admin",
      })

      await addUser({
        id: `USER-${Date.now()}-2`,
        username: "cashier",
        password: "cashier123",
        role: "cashier",
      })

      console.log("[v0] Demo users created successfully")
    }

    return true
  } catch (error) {
    console.error("[v0] Error initializing system:", error)
    return false
  }
}
