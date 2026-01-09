import { initDB, clearAllProducts } from "../lib/db"

async function clearDatabase() {
  console.log("Clearing all products from database...")

  try {
    await initDB()
    console.log("[v0] Database initialized")

    await clearAllProducts()
    console.log("[v0] All products cleared successfully!")
  } catch (error) {
    console.error("[v0] Error clearing products:", error)
  }
}

clearDatabase()
