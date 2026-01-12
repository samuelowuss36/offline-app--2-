// IndexedDB wrapper for offline data persistence
export interface Product {
  id: string
  name: string
  sku: string
  category: string
  price: number
  wholesalePrice: number
  profit: number
  quantity: number
  image?: string
  description?: string
  createdAt: number
}

export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  totalSpent: number
  createdAt: number
}

export interface SaleItem {
  productId: string
  productName: string
  quantity: number
  price: number
  total: number
  profit?: number
  itemProfit?: number
}

export interface Sale {
  id: string
  customerId?: string
  items: SaleItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentMethod: "cash" | "mobileMoney"
  paymentReference?: string
  amountReceived: number
  change: number
  cashierName?: string
  notes?: string
  createdAt: number
}

export interface User {
  id: string
  username: string
  password: string
  role: "admin" | "cashier"
  createdAt: number
}

const DB_NAME = "POSSystemDB"
const DB_VERSION = 1

let db: IDBDatabase | null = null

export async function initDB(): Promise<IDBDatabase> {
  // Check if IndexedDB is available
  if (typeof indexedDB === "undefined") {
    throw new Error("IndexedDB is not available in this environment")
  }

  // If already initialized, return existing connection
  if (db) {
    return db
  }

  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        console.error("[v0] IndexedDB open error:", request.error)
        reject(request.error || new Error("Failed to open IndexedDB"))
      }
      
      request.onsuccess = () => {
        db = request.result
        console.log("[v0] IndexedDB initialized successfully")
        resolve(db)
      }

      request.onblocked = () => {
        console.warn("[v0] IndexedDB blocked - close other tabs using this database")
        reject(new Error("Database blocked - please close other tabs"))
      }

      request.onupgradeneeded = (event) => {
        console.log("[v0] IndexedDB upgrade needed, creating object stores...")
        const database = (event.target as IDBOpenDBRequest).result

        // Products
        if (!database.objectStoreNames.contains("products")) {
          const productStore = database.createObjectStore("products", { keyPath: "id" })
          productStore.createIndex("sku", "sku", { unique: true })
          productStore.createIndex("category", "category", { unique: false })
        }

        // Customers
        if (!database.objectStoreNames.contains("customers")) {
          const customerStore = database.createObjectStore("customers", { keyPath: "id" })
          customerStore.createIndex("phone", "phone", { unique: true })
        }

        // Sales
        if (!database.objectStoreNames.contains("sales")) {
          const salesStore = database.createObjectStore("sales", { keyPath: "id" })
          salesStore.createIndex("createdAt", "createdAt", { unique: false })
          salesStore.createIndex("customerId", "customerId", { unique: false })
        }

        // Users
        if (!database.objectStoreNames.contains("users")) {
          const userStore = database.createObjectStore("users", { keyPath: "id" })
          userStore.createIndex("username", "username", { unique: true })
        }
      }
    } catch (error) {
      console.error("[v0] Error initializing IndexedDB:", error)
      reject(error)
    }
  })
}

async function getDB(): Promise<IDBDatabase> {
  if (!db) {
    await initDB()
  }
  return db!
}

// Product operations
export async function addProduct(product: Omit<Product, "createdAt">): Promise<void> {
  const database = await getDB()
  const tx = database.transaction("products", "readwrite")
  await new Promise<void>((resolve, reject) => {
    const request = tx.objectStore("products").add({
      ...product,
      createdAt: Date.now(),
    })
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      console.log("[v0] Product saved to database:", product.name)
    }
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function updateProduct(product: Product): Promise<void> {
  const database = await getDB()
  const tx = database.transaction("products", "readwrite")
  await new Promise((resolve, reject) => {
    const request = tx.objectStore("products").put(product)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(null)
  })
}

export async function getProducts(): Promise<Product[]> {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const tx = database.transaction("products", "readonly")
    const request = tx.objectStore("products").getAll()
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

export async function getProduct(id: string): Promise<Product | undefined> {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const tx = database.transaction("products", "readonly")
    const request = tx.objectStore("products").get(id)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

export async function deleteProduct(id: string): Promise<void> {
  const database = await getDB()
  const tx = database.transaction("products", "readwrite")
  return new Promise((resolve, reject) => {
    const request = tx.objectStore("products").delete(id)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      tx.oncomplete = () => resolve()
    }
  })
}

export async function clearAllProducts(): Promise<void> {
  const database = await getDB()
  const tx = database.transaction("products", "readwrite")
  return new Promise((resolve, reject) => {
    const request = tx.objectStore("products").clear()
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      tx.oncomplete = () => resolve()
    }
  })
}

// Customer operations
export async function addCustomer(customer: Omit<Customer, "createdAt">): Promise<void> {
  const database = await getDB()
  const tx = database.transaction("customers", "readwrite")
  await new Promise((resolve, reject) => {
    const request = tx.objectStore("customers").add({
      ...customer,
      createdAt: Date.now(),
    })
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(null)
  })
}

export async function getCustomers(): Promise<Customer[]> {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const tx = database.transaction("customers", "readonly")
    const request = tx.objectStore("customers").getAll()
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

export async function getCustomer(id: string): Promise<Customer | undefined> {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const tx = database.transaction("customers", "readonly")
    const request = tx.objectStore("customers").get(id)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

export async function updateCustomer(customer: Customer): Promise<void> {
  const database = await getDB()
  const tx = database.transaction("customers", "readwrite")
  await new Promise((resolve, reject) => {
    const request = tx.objectStore("customers").put(customer)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(null)
  })
}

// Sales operations
export async function addSale(sale: Omit<Sale, "createdAt" | "id">): Promise<string> {
  const database = await getDB()
  const id = `SALE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  const tx = database.transaction(["sales", "products", "customers"], "readwrite")

  // Add sale first
  const saleId = await new Promise<string>((resolve, reject) => {
    const request = tx.objectStore("sales").add({
      ...sale,
      id,
      createdAt: Date.now(),
    })
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      console.log("[v0] Sale transaction saved:", id, "Total: GHS", sale.total.toFixed(2))
      resolve(id)
    }
  })

  // Update product quantities within same transaction
  for (const item of sale.items) {
    const product = await new Promise<Product | undefined>((resolve, reject) => {
      const request = tx.objectStore("products").get(item.productId)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })

    if (product) {
      product.quantity -= item.quantity
      await new Promise<void>((resolve, reject) => {
        const request = tx.objectStore("products").put(product)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve()
      })
    }
  }

  // Update customer if exists
  if (sale.customerId) {
    const customer = await new Promise<Customer | undefined>((resolve, reject) => {
      const request = tx.objectStore("customers").get(sale.customerId!)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })

    if (customer) {
      customer.totalSpent += sale.total
      await new Promise<void>((resolve, reject) => {
        const request = tx.objectStore("customers").put(customer)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve()
      })
    }
  }

  // Wait for transaction to complete
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })

  return saleId
}

export async function getSales(): Promise<Sale[]> {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const tx = database.transaction("sales", "readonly")
    const request = tx.objectStore("sales").getAll()
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

export async function getSalesByDateRange(startDate: number, endDate: number): Promise<Sale[]> {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const tx = database.transaction("sales", "readonly")
    const index = tx.objectStore("sales").index("createdAt")
    const range = IDBKeyRange.bound(startDate, endDate)
    const request = index.getAll(range)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

// User operations
export async function addUser(user: Omit<User, "createdAt">): Promise<void> {
  const database = await getDB()
  const tx = database.transaction("users", "readwrite")
  await new Promise((resolve, reject) => {
    const request = tx.objectStore("users").add({
      ...user,
      createdAt: Date.now(),
    })
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(null)
  })
}

export async function getUser(username: string): Promise<User | undefined> {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const tx = database.transaction("users", "readonly")
    const index = tx.objectStore("users").index("username")
    const request = index.get(username)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

export async function getUsers(): Promise<User[]> {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const tx = database.transaction("users", "readonly")
    const request = tx.objectStore("users").getAll()
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}
