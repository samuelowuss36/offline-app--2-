"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSales, getProducts } from "@/lib/db"
import type { Sale, Product } from "@/lib/db"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { TrendingUp, Package, TrendingDown, DollarSign } from "lucide-react"

export default function AdminDashboard() {
  const [sales, setSales] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  console.log("[DEBUG] AdminDashboard component mounted")

  useEffect(() => {
    console.log("[DEBUG] AdminDashboard useEffect running")
    const loadData = async () => {
      try {
        console.log("[DEBUG] Loading sales and products data")
        const [salesData, productsData] = await Promise.all([getSales(), getProducts()])
        console.log("[DEBUG] Data loaded successfully", { salesCount: salesData.length, productsCount: productsData.length })
        setSales(salesData)
        setProducts(productsData)
      } catch (error) {
        console.error("[DEBUG] Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0)
  const totalSales = sales.length
  const lowStockProducts = products.filter((p) => p.quantity < 20).length

  const totalProfit = sales.reduce((sum, sale) => {
    const saleProfit = sale.items.reduce((itemSum, item) => {
      const product = products.find((p) => p.id === item.productId)
      const itemProfit = (product?.profit || 0) * item.quantity
      return itemSum + itemProfit
    }, 0)
    return sum + saleProfit
  }, 0)

  const paymentMethodData = [
    { name: "Cash", value: sales.filter((s) => s.paymentMethod === "cash").length },
    { name: "Mobile Money", value: sales.filter((s) => s.paymentMethod === "mobileMoney").length },
  ]

  const dailySalesData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    const dayStart = new Date(date).setHours(0, 0, 0, 0)
    const dayEnd = new Date(date).setHours(23, 59, 59, 999)
    const daySales = sales.filter((s) => s.createdAt >= dayStart && s.createdAt <= dayEnd)
    const dayTotal = daySales.reduce((sum, s) => sum + s.total, 0)
    return {
      date: date.toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" }),
      sales: dayTotal,
    }
  })

  const categoryData = products.reduce(
    (acc, product) => {
      const existing = acc.find((c) => c.category === product.category)
      if (existing) {
        existing.value += product.quantity
      } else {
        acc.push({ category: product.category, value: product.quantity })
      }
      return acc
    },
    [] as Array<{ category: string; value: number }>,
  )

  const COLORS = ["#2d6a4f", "#52b788", "#d4a574", "#ed8936"]

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales}</div>
            <p className="text-xs text-muted-foreground">Sales recorded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <Package className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">Need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {totalProfit.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Profit from all sales</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Sales Trend</CardTitle>
            <CardDescription>Last 7 days revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailySalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-primary)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Transaction breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory by Category</CardTitle>
          <CardDescription>Stock levels across categories</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="category" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="value" fill="var(--color-accent)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Last 5 sales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sales
              .slice(-5)
              .reverse()
              .map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between border-b border-border pb-4 last:border-0"
                >
                  <div>
                    <p className="font-medium text-sm">{sale.id}</p>
                    <p className="text-xs text-muted-foreground">{new Date(sale.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">GHS {sale.total.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground capitalize">{sale.paymentMethod}</p>
                  </div>
                </div>
              ))}
            {sales.length === 0 && <p className="text-center text-muted-foreground py-4">No sales yet</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
