import { type NextRequest, NextResponse } from "next/server"
import { initDB, addProduct, addUser, addCustomer, getUsers } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    await initDB()

    // Check if users already exist
    const users = await getUsers()
    if (users.length > 0) {
      return NextResponse.json({ message: "System already initialized" })
    }

    // Create demo users
    const adminId = `USER-${Date.now()}-1`
    const cashierId = `USER-${Date.now()}-2`

    await addUser({
      id: adminId,
      username: "admin",
      password: "admin123",
      role: "admin",
    })

    await addUser({
      id: cashierId,
      username: "cashier",
      password: "cashier123",
      role: "cashier",
    })

    // Sample products
    const products = [
      {
        id: `PROD-${Date.now()}-1`,
        name: "Baby Diaper Pack (M)",
        sku: "DIAPER-M-001",
        category: "Diapers",
        price: 45.99,
        quantity: 150,
        description: "Medium size diapers, pack of 20",
      },
      {
        id: `PROD-${Date.now()}-2`,
        name: "Baby Wipes Bundle",
        sku: "WIPES-001",
        category: "Care Products",
        price: 12.99,
        quantity: 200,
        description: "Gentle wipes for sensitive skin",
      },
      {
        id: `PROD-${Date.now()}-3`,
        name: "Infant Formula 400g",
        sku: "FORMULA-400",
        category: "Food",
        price: 28.5,
        quantity: 80,
        description: "Nutritious infant formula",
      },
      {
        id: `PROD-${Date.now()}-4`,
        name: "Kids T-Shirt (Size 2-3)",
        sku: "TSHIRT-23-001",
        category: "Clothing",
        price: 19.99,
        quantity: 120,
        description: "Comfortable cotton t-shirt",
      },
      {
        id: `PROD-${Date.now()}-5`,
        name: "Baby Bottle Set",
        sku: "BOTTLE-SET",
        category: "Feeding",
        price: 34.99,
        quantity: 90,
        description: "Set of 3 bottles with nipples",
      },
      {
        id: `PROD-${Date.now()}-6`,
        name: "Newborn Sleep Suit",
        sku: "SLEEP-SUIT-0",
        category: "Clothing",
        price: 24.99,
        quantity: 110,
        description: "Soft newborn sleep suit",
      },
      {
        id: `PROD-${Date.now()}-7`,
        name: "Kids Shoes Size 6",
        sku: "SHOES-6-001",
        category: "Footwear",
        price: 45.0,
        quantity: 75,
        description: "Durable kids shoes",
      },
      {
        id: `PROD-${Date.now()}-8`,
        name: "Baby Bath Tub",
        sku: "TUB-001",
        category: "Bath",
        price: 59.99,
        quantity: 40,
        description: "Portable baby bath tub",
      },
    ]

    for (const product of products) {
      await addProduct(product)
    }

    // Sample customers
    const customers = [
      {
        id: `CUST-${Date.now()}-1`,
        name: "Jane Smith",
        phone: "+254712345678",
        email: "jane@example.com",
        address: "123 Main St, City",
        totalSpent: 0,
      },
      {
        id: `CUST-${Date.now()}-2`,
        name: "Mary Johnson",
        phone: "+254722345678",
        email: "mary@example.com",
        address: "456 Oak Ave, Town",
        totalSpent: 0,
      },
      {
        id: `CUST-${Date.now()}-3`,
        name: "Sarah Williams",
        phone: "+254732345678",
        email: "sarah@example.com",
        address: "789 Pine Rd, Village",
        totalSpent: 0,
      },
    ]

    for (const customer of customers) {
      await addCustomer(customer)
    }

    return NextResponse.json({
      message: "System initialized successfully",
      data: {
        users: 2,
        products: products.length,
        customers: customers.length,
      },
    })
  } catch (error) {
    console.error("[v0] Init error:", error)
    return NextResponse.json({ error: "Initialization failed" }, { status: 500 })
  }
}
