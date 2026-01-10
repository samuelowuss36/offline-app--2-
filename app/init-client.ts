import { initDB, getUsers, addUser } from "@/lib/db"

// Helper function to add timeout to promises
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(errorMessage))
    }, timeoutMs)

    promise
      .then((result) => {
        clearTimeout(timeoutId)
        resolve(result)
      })
      .catch((error) => {
        clearTimeout(timeoutId)
        reject(error)
      })
  })
}

export async function initializeSystem(): Promise<boolean> {
  // Check if we're in a browser environment
  if (typeof window === "undefined" || typeof indexedDB === "undefined") {
    console.warn("[v0] IndexedDB not available, skipping initialization")
    return false
  }

  try {
    // Initialize database with a 5 second timeout
    await withTimeout(initDB(), 5000, "Database initialization timed out")

    // Check if users exist, if not create demo users (with timeout)
    const users = await withTimeout(getUsers(), 3000, "Failed to get users")
    
    if (users.length === 0) {
      // Create demo users
      await withTimeout(
        addUser({
          id: `USER-${Date.now()}-1`,
          username: "admin",
          password: "admin123",
          role: "admin",
        }),
        3000,
        "Failed to create admin user"
      )

      await withTimeout(
        addUser({
          id: `USER-${Date.now()}-2`,
          username: "cashier",
          password: "cashier123",
          role: "cashier",
        }),
        3000,
        "Failed to create cashier user"
      )

      console.log("[v0] Demo users created successfully")
    }

    console.log("[v0] System initialized successfully")
    return true
  } catch (error) {
    console.error("[v0] Error initializing system:", error)
    // Return false but don't throw - allow the app to continue
    return false
  }
}
