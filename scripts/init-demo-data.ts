import { initDB, addProduct, addUser, addCustomer } from "../lib/db"

async function initDemoData() {
  console.log("Initializing database with demo data...")

  try {
    await initDB()
    console.log("[v0] Database initialized")

    // Create demo users
    const adminId = `USER-${Date.now()}-1`
    const cashierId = `USER-${Date.now()}-2`

    await addUser({
      id: adminId,
      username: "admin",
      password: "admin123", // In production, use bcrypt
      role: "admin",
    })
    console.log("[v0] Admin user created")

    await addUser({
      id: cashierId,
      username: "cashier",
      password: "cashier123",
      role: "cashier",
    })
    console.log("[v0] Cashier user created")

    // Sample products for mother care and kids boutique
    const products = [
      {
        id: `PROD-${Date.now()}-1`,
        name: "Baby Diaper Pack (M)",
        sku: "DIAPER-M-001",
        category: "Baby Diapers",
        wholesalePrice: 30,
        profit: 15.99,
        price: 45.99,
        quantity: 150,
        description: "Medium size diapers, pack of 20",
        image: "/baby-diaper.jpg",
      },
      {
        id: `PROD-${Date.now()}-2`,
        name: "Baby Wipes Bundle",
        sku: "WIPES-001",
        category: "Baby Hygiene & Bath",
        wholesalePrice: 8,
        profit: 4.99,
        price: 12.99,
        quantity: 200,
        description: "Gentle wipes for sensitive skin",
        image: "/baby-wipes.jpg",
      },
      {
        id: `PROD-${Date.now()}-3`,
        name: "Infant Formula 400g",
        sku: "FORMULA-400",
        category: "Baby Food & Milk Formulas",
        wholesalePrice: 18,
        profit: 10.5,
        price: 28.5,
        quantity: 80,
        description: "Nutritious infant formula",
        image: "/baby-formula.jpg",
      },
      {
        id: `PROD-${Date.now()}-4`,
        name: "Kids T-Shirt (Size 2-3)",
        sku: "TSHIRT-23-001",
        category: "Baby Clothing",
        wholesalePrice: 12,
        profit: 7.99,
        price: 19.99,
        quantity: 120,
        description: "Comfortable cotton t-shirt",
        image: "/kids-tshirt.jpg",
      },
      {
        id: `PROD-${Date.now()}-5`,
        name: "Baby Bottle Set",
        sku: "BOTTLE-SET",
        category: "Feeding Bottles & Accessories",
        wholesalePrice: 22,
        profit: 12.99,
        price: 34.99,
        quantity: 90,
        description: "Set of 3 bottles with nipples",
        image: "/baby-bottle.jpg",
      },
      {
        id: `PROD-${Date.now()}-6`,
        name: "Newborn Sleep Suit",
        sku: "SLEEP-SUIT-0",
        category: "Baby Clothing",
        wholesalePrice: 15,
        profit: 9.99,
        price: 24.99,
        quantity: 110,
        description: "Soft newborn sleep suit",
        image: "/baby-sleep.jpg",
      },
      {
        id: `PROD-${Date.now()}-7`,
        name: "Kids Shoes Size 6",
        sku: "SHOES-6-001",
        category: "Baby Gear & Accessories",
        wholesalePrice: 28,
        profit: 17,
        price: 45.0,
        quantity: 75,
        description: "Durable kids shoes",
        image: "/kids-shoes.jpg",
      },
      {
        id: `PROD-${Date.now()}-8`,
        name: "Baby Bath Tub",
        sku: "TUB-001",
        category: "Baby Hygiene & Bath",
        wholesalePrice: 40,
        profit: 19.99,
        price: 59.99,
        quantity: 40,
        description: "Portable baby bath tub",
        image: "/baby-bath.jpg",
      },
    ]

    for (const product of products) {
      await addProduct(product)
    }
    console.log("[v0] Products added")

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
    console.log("[v0] Customers added")

    console.log("Demo data initialized successfully!")
  } catch (error) {
    console.error("Error initializing demo data:", error)
  }
}

initDemoData()
