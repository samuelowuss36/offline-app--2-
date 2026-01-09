"use client"

import { useEffect, useState } from "react"
import { getSales, getProducts, getCustomers } from "@/lib/db"
import type { Sale, Product, Customer } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download } from "lucide-react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

export default function ReportsPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0],
  )
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0])
  const [reportType, setReportType] = useState<"sales" | "products" | "customers">("sales")

  useEffect(() => {
    loadData()
  }, [startDate, endDate])

  const loadData = async () => {
    try {
      const [salesData, productsData, customersData] = await Promise.all([getSales(), getProducts(), getCustomers()])

      const startTime = new Date(startDate).getTime()
      const endTime = new Date(endDate).getTime() + 86400000

      setSales(salesData.filter((s) => s.createdAt >= startTime && s.createdAt <= endTime))
      setProducts(productsData)
      setCustomers(customersData)
    } finally {
      setLoading(false)
    }
  }

  // Generate sales report data
  const dailySalesData = Array.from({ length: 31 }, (_, i) => {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    const dayStart = new Date(date).setHours(0, 0, 0, 0)
    const dayEnd = new Date(date).setHours(23, 59, 59, 999)
    const daySales = sales.filter((s) => s.createdAt >= dayStart && s.createdAt <= dayEnd)
    const dayTotal = daySales.reduce((sum, s) => sum + s.total, 0)
    const dayCount = daySales.length
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue: dayTotal,
      transactions: dayCount,
    }
  }).filter((d) => d.revenue > 0 || d.transactions > 0)

  const topProducts = products
    .map((p) => ({
      ...p,
      unitsSold: sales.reduce(
        (sum, s) => sum + s.items.filter((i) => i.productId === p.id).reduce((s, i) => s + i.quantity, 0),
        0,
      ),
    }))
    .filter((p) => p.unitsSold > 0)
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 10)

  const topCustomers = customers.sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 10)

  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0)
  const totalTransactions = sales.length
  const totalTax = sales.reduce((sum, s) => sum + s.tax, 0)
  const totalDiscount = sales.reduce((sum, s) => sum + s.discount, 0)
  const cashSales = sales.filter((s) => s.paymentMethod === "cash").length
  const mobileMoneySales = sales.filter((s) => s.paymentMethod === "mobileMoney").length

  const handleExportReport = () => {
    let csvContent = "data:text/csv;charset=utf-8,"

    if (reportType === "sales") {
      csvContent += "Sales Report\n"
      csvContent += `Period: ${startDate} to ${endDate}\n\n`
      csvContent += "Summary\n"
      csvContent += `Total Revenue,${totalRevenue}\n`
      csvContent += `Total Transactions,${totalTransactions}\n`
      csvContent += `Cash Sales,${cashSales}\n`
      csvContent += `Mobile Money Sales,${mobileMoneySales}\n`
      csvContent += `Tax Collected,${totalTax}\n`
      csvContent += `Total Discount,${totalDiscount}\n\n`
      csvContent += "Daily Sales\n"
      csvContent += "Date,Revenue,Transactions\n"
      dailySalesData.forEach((d) => {
        csvContent += `${d.date},${d.revenue},${d.transactions}\n`
      })
    } else if (reportType === "products") {
      csvContent += "Product Sales Report\n"
      csvContent += `Period: ${startDate} to ${endDate}\n\n`
      csvContent += "Top Products Sold\n"
      csvContent += "Product Name,SKU,Units Sold,Category\n"
      topProducts.forEach((p) => {
        csvContent += `"${p.name}",${p.sku},${p.unitsSold},${p.category}\n`
      })
    } else {
      csvContent += "Top Customers Report\n"
      csvContent += `Period: ${startDate} to ${endDate}\n\n`
      csvContent += "Top Customers\n"
      csvContent += "Name,Phone,Total Spent\n"
      topCustomers.forEach((c) => {
        csvContent += `"${c.name}",${c.phone},${c.totalSpent}\n`
      })
    }

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${reportType}_report_${new Date().getTime()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return <div className="p-8 text-center">Loading reports...</div>
  }

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground">View detailed sales and business insights</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="reportType">Report Type</Label>
              <select
                id="reportType"
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                <option value="sales">Sales Report</option>
                <option value="products">Product Sales</option>
                <option value="customers">Top Customers</option>
              </select>
            </div>
          </div>
          <Button onClick={handleExportReport} className="bg-primary hover:bg-primary/90 gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </CardContent>
      </Card>

      {reportType === "sales" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">GHS {totalRevenue.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTransactions}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  GHS {totalTransactions > 0 ? (totalRevenue / totalTransactions).toFixed(2) : "0.00"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Cash vs Mobile Money</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <p>Cash: {cashSales}</p>
                  <p>Mobile: {mobileMoneySales}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Daily Sales Trend</CardTitle>
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
                    }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      {reportType === "products" && (
        <Card>
          <CardHeader>
            <CardTitle>Top Products Sold</CardTitle>
            <CardDescription>Most sold items during the period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4">Product Name</th>
                    <th className="text-left py-3 px-4">SKU</th>
                    <th className="text-left py-3 px-4">Category</th>
                    <th className="text-right py-3 px-4">Units Sold</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product) => (
                    <tr key={product.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4">{product.name}</td>
                      <td className="py-3 px-4 font-mono text-xs">{product.sku}</td>
                      <td className="py-3 px-4">{product.category}</td>
                      <td className="py-3 px-4 text-right font-semibold text-primary">{product.unitsSold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {topProducts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">No sales data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {reportType === "customers" && (
        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
            <CardDescription>Highest spending customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4">Customer Name</th>
                    <th className="text-left py-3 px-4">Phone</th>
                    <th className="text-right py-3 px-4">Total Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {topCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4">{customer.name}</td>
                      <td className="py-3 px-4">{customer.phone}</td>
                      <td className="py-3 px-4 text-right font-semibold text-primary">
                        GHS {customer.totalSpent.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {topCustomers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">No customer data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
