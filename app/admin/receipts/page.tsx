"use client"

import { useEffect, useState } from "react"
import { getSales, getProducts } from "@/lib/db"
import type { Sale, Product } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Download, Printer } from "lucide-react"

export default function ReceiptsPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0],
  )
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0])

  useEffect(() => {
    loadData()
  }, [startDate, endDate])

  const loadData = async () => {
    try {
      const [salesData, productsData] = await Promise.all([getSales(), getProducts()])

      const startTime = new Date(startDate).getTime()
      const endTime = new Date(endDate).getTime() + 86400000

      const filteredSales = salesData.filter((s) => s.createdAt >= startTime && s.createdAt <= endTime)
      setSales(filteredSales)
      setProducts(productsData)
    } finally {
      setLoading(false)
    }
  }

  const filteredSales = sales.filter((sale) => {
    const searchLower = searchTerm.toLowerCase()
    const customerInfo = sale.notes ? sale.notes.split(",")[0].replace("Customer: ", "") : "Walk-in"
    return sale.id.toLowerCase().includes(searchLower) || customerInfo.toLowerCase().includes(searchLower)
  })

  const calculateSaleProfit = (sale: Sale): number => {
    return sale.items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId)
      return sum + (product?.profit || 0) * item.quantity
    }, 0)
  }

  const handlePrintReceipt = (sale: Sale) => {
    window.print()
  }

  const handleExportReceipts = () => {
    let csvContent = "data:text/csv;charset=utf-8,"
    csvContent += "Receipt ID,Date,Customer,Cashier,Phone,Payment Method,Total,Profit,Items Count\n"

    filteredSales.forEach((sale) => {
      const customerInfo = sale.notes ? sale.notes.split(",")[0].replace("Customer: ", "") : "Walk-in"
      const profit = calculateSaleProfit(sale)
      csvContent += `${sale.id},${new Date(sale.createdAt).toLocaleString()},${customerInfo},${sale.cashierName || "Unknown"},${sale.paymentReference || "N/A"},${sale.paymentMethod},GHS ${sale.total.toFixed(2)},GHS ${profit.toFixed(2)},${sale.items.length}\n`
    })

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `receipts_${new Date().getTime()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return <div className="p-8 text-center">Loading receipts...</div>
  }

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold">Receipts</h1>
        <p className="text-muted-foreground">View and manage all printed receipts</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Receipt Filters</CardTitle>
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
              <Label htmlFor="search">Search Receipt ID or Customer</Label>
              <Input
                id="search"
                placeholder="Enter receipt ID or customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={handleExportReceipts} className="bg-primary hover:bg-primary/90 gap-2">
            <Download className="h-4 w-4" />
            Export Receipts (CSV)
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Receipts ({filteredSales.length})</CardTitle>
          <CardDescription>All printed receipts from the cashier</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Receipt ID</th>
                  <th className="text-left py-3 px-4 font-semibold">Date & Time</th>
                  <th className="text-left py-3 px-4 font-semibold">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold">Cashier</th>
                  <th className="text-left py-3 px-4 font-semibold">Payment Method</th>
                  <th className="text-left py-3 px-4 font-semibold">Items</th>
                  <th className="text-right py-3 px-4 font-semibold">Total Amount</th>
                  <th className="text-right py-3 px-4 font-semibold">Profit</th>
                  <th className="text-center py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => {
                  const customerInfo = sale.notes ? sale.notes.split(",")[0].replace("Customer: ", "") : "Walk-in"
                  const profit = calculateSaleProfit(sale)
                  return (
                    <tr key={sale.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs font-semibold text-primary">{sale.id}</td>
                      <td className="py-3 px-4 text-xs">{new Date(sale.createdAt).toLocaleString()}</td>
                      <td className="py-3 px-4">{customerInfo}</td>
                      <td className="py-3 px-4">{sale.cashierName || "Unknown"}</td>
                      <td className="py-3 px-4 capitalize">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            sale.paymentMethod === "cash"
                              ? "bg-green-100/20 text-green-700"
                              : "bg-blue-100/20 text-blue-700"
                          }`}
                        >
                          {sale.paymentMethod === "cash" ? "Cash" : "Mobile Money"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">{sale.items.length}</td>
                      <td className="py-3 px-4 text-right font-semibold text-primary">GHS {sale.total.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-semibold text-green-600">GHS {profit.toFixed(2)}</td>
                      <td className="py-3 px-4 text-center">
                        <Button variant="ghost" size="sm" onClick={() => handlePrintReceipt(sale)}>
                          <Printer className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filteredSales.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No receipts found</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
