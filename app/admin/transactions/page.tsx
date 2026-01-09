"use client"

import { useEffect, useState } from "react"
import { getSales, getProducts, getCustomers } from "@/lib/db"
import type { Sale, Product, Customer } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Download, Printer, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function TransactionsPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<"all" | "cash" | "mobileMoney">("all")
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0],
  )
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedTransaction, setSelectedTransaction] = useState<Sale | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    loadData()
  }, [startDate, endDate])

  const loadData = async () => {
    try {
      const [salesData, productsData, customersData] = await Promise.all([getSales(), getProducts(), getCustomers()])

      const startTime = new Date(startDate).getTime()
      const endTime = new Date(endDate).getTime() + 86400000

      const filteredSales = salesData.filter((s) => s.createdAt >= startTime && s.createdAt <= endTime)
      setSales(filteredSales)
      setProducts(productsData)
      setCustomers(customersData)
    } finally {
      setLoading(false)
    }
  }

  const filteredSales = sales.filter((sale) => {
    const searchLower = searchTerm.toLowerCase()
    const customerInfo = sale.notes ? sale.notes.split(",")[0].replace("Customer: ", "") : "Walk-in"
    const matchesSearch =
      sale.id.toLowerCase().includes(searchLower) || customerInfo.toLowerCase().includes(searchLower)
    const matchesPayment = filterPaymentMethod === "all" || sale.paymentMethod === filterPaymentMethod
    return matchesSearch && matchesPayment
  })

  const calculateSaleProfit = (sale: Sale): number => {
    return sale.items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId)
      return sum + (product?.profit || 0) * item.quantity
    }, 0)
  }

  const handleViewDetails = (sale: Sale) => {
    setSelectedTransaction(sale)
    setShowDetails(true)
  }

  const handlePrintReceipt = (sale: Sale) => {
    const printWindow = window.open("", "", "height=600,width=800")
    if (printWindow) {
      const profit = calculateSaleProfit(sale)
      const receiptHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receipt #${sale.id}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; background: white; }
              .receipt { max-width: 500px; margin: 0 auto; border: 1px solid #ccc; padding: 20px; }
              .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 10px; }
              .receipt-id { text-align: center; font-size: 18px; font-weight: bold; margin: 10px 0; font-family: monospace; }
              .customer-info { font-size: 12px; margin: 10px 0; line-height: 1.5; }
              .items { margin: 15px 0; border-bottom: 1px dashed #ccc; padding-bottom: 10px; }
              .item { display: flex; justify-content: space-between; margin: 5px 0; font-size: 12px; }
              .totals { margin: 15px 0; font-size: 12px; }
              .total-line { display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; margin-top: 10px; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
              .profit-line { display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 5px; }
              .footer { text-align: center; font-size: 11px; margin-top: 20px; border-top: 1px solid #ccc; padding-top: 10px; }
              @media print { body { background: white; } }
            </style>
          </head>
          <body>
            <div class="receipt">
              <div class="header">
                <h2>TRANSACTION RECEIPT</h2>
                <p>Mother Care & Kids POS</p>
              </div>
              
              <div class="receipt-id">Receipt #${sale.id}</div>
              
              <div class="customer-info">
                <p><strong>Date:</strong> ${new Date(sale.createdAt).toLocaleString()}</p>
                <p><strong>Cashier:</strong> ${sale.cashierName || "N/A"}</p>
                <p><strong>Customer:</strong> ${sale.notes ? sale.notes.split(",")[0].replace("Customer: ", "") : "Walk-in"}</p>
                ${sale.notes ? `<p><strong>Phone:</strong> ${sale.notes.split(",")[1]?.replace("Phone: ", "").trim() || "N/A"}</p>` : ""}
              </div>
              
              <div class="items">
                <p><strong>Items Purchased:</strong></p>
                ${sale.items
                  .map(
                    (item) => `
                  <div class="item">
                    <span>${item.productName} x${item.quantity}</span>
                    <span>GHS ${item.total.toFixed(2)}</span>
                  </div>
                `,
                  )
                  .join("")}
              </div>
              
              <div class="totals">
                <div class="item">
                  <span>Subtotal:</span>
                  <span>GHS ${sale.subtotal.toFixed(2)}</span>
                </div>
                <div class="item">
                  <span>Tax:</span>
                  <span>GHS ${sale.tax.toFixed(2)}</span>
                </div>
                <div class="item">
                  <span>Discount:</span>
                  <span>-GHS ${sale.discount.toFixed(2)}</span>
                </div>
                <div class="total-line">
                  <span>TOTAL:</span>
                  <span>GHS ${sale.total.toFixed(2)}</span>
                </div>
                <div class="profit-line">
                  <span>Profit:</span>
                  <span>GHS ${profit.toFixed(2)}</span>
                </div>
              </div>
              
              <div class="totals">
                <div class="item">
                  <span><strong>Payment Method:</strong></span>
                  <span>${sale.paymentMethod === "cash" ? "Cash" : "Mobile Money"}</span>
                </div>
                ${
                  sale.paymentReference
                    ? `
                  <div class="item">
                    <span>Reference:</span>
                    <span>${sale.paymentReference}</span>
                  </div>
                `
                    : ""
                }
              </div>
              
              <div class="footer">
                <p>Thank you for your business!</p>
                <p>Keep this receipt for your records</p>
              </div>
            </div>
            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `
      printWindow.document.write(receiptHTML)
      printWindow.document.close()
    }
  }

  const handleExportTransactions = () => {
    let csvContent = "data:text/csv;charset=utf-8,"
    csvContent +=
      "Transaction ID,Date,Customer,Cashier,Phone,Payment Method,Reference,Items Count,Subtotal,Tax,Discount,Total,Profit\n"

    filteredSales.forEach((sale) => {
      const customerInfo = sale.notes ? sale.notes.split(",")[0].replace("Customer: ", "") : "Walk-in"
      const phone = sale.notes ? sale.notes.split(",")[1]?.replace("Phone: ", "").trim() : "N/A"
      const profit = calculateSaleProfit(sale)
      csvContent += `${sale.id},${new Date(sale.createdAt).toLocaleString()},${customerInfo},${sale.cashierName || "Unknown"},${phone},${sale.paymentMethod},${sale.paymentReference || "N/A"},${sale.items.length},${sale.subtotal.toFixed(2)},${sale.tax.toFixed(2)},${sale.discount.toFixed(2)},${sale.total.toFixed(2)},${profit.toFixed(2)}\n`
    })

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `transactions_${new Date().getTime()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return <div className="p-8 text-center">Loading transactions...</div>
  }

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0)
  const totalProfit = filteredSales.reduce((sum, sale) => sum + calculateSaleProfit(sale), 0)

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Transactions</h1>
        <p className="text-muted-foreground">Manage and view all store transactions and receipts</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredSales.length}</div>
          </CardContent>
        </Card>
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
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">GHS {totalProfit.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              GHS {filteredSales.length > 0 ? (totalRevenue / filteredSales.length).toFixed(2) : "0.00"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="search">Search Transaction ID or Customer</Label>
              <Input
                id="search"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <select
                id="paymentMethod"
                value={filterPaymentMethod}
                onChange={(e) => setFilterPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
              >
                <option value="all">All Methods</option>
                <option value="cash">Cash</option>
                <option value="mobileMoney">Mobile Money</option>
              </select>
            </div>
          </div>
          <Button onClick={handleExportTransactions} className="bg-primary hover:bg-primary/90 gap-2">
            <Download className="h-4 w-4" />
            Export All Transactions (CSV)
          </Button>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions ({filteredSales.length})</CardTitle>
          <CardDescription>View detailed transaction information and generate receipts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Transaction ID</th>
                  <th className="text-left py-3 px-4 font-semibold">Date & Time</th>
                  <th className="text-left py-3 px-4 font-semibold">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold">Payment Method</th>
                  <th className="text-center py-3 px-4 font-semibold">Items</th>
                  <th className="text-right py-3 px-4 font-semibold">Total</th>
                  <th className="text-right py-3 px-4 font-semibold">Profit</th>
                  <th className="text-center py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.length > 0 ? (
                  filteredSales.map((sale) => {
                    const customerInfo = sale.notes ? sale.notes.split(",")[0].replace("Customer: ", "") : "Walk-in"
                    const profit = calculateSaleProfit(sale)
                    return (
                      <tr key={sale.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs font-semibold text-primary">{sale.id}</td>
                        <td className="py-3 px-4 text-xs">{new Date(sale.createdAt).toLocaleString()}</td>
                        <td className="py-3 px-4 text-sm">{customerInfo}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              sale.paymentMethod === "cash"
                                ? "bg-green-100/20 text-green-700"
                                : "bg-[var(--brand-pink-300)]/20 text-[var(--brand-pink-600)]"
                            }`}
                          >
                            {sale.paymentMethod === "cash" ? "Cash" : "Mobile Money"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">{sale.items.length}</td>
                        <td className="py-3 px-4 text-right font-semibold text-primary">GHS {sale.total.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-semibold text-green-600">GHS {profit.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(sale)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePrintReceipt(sale)}
                              title="Print Receipt"
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-muted-foreground">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Transaction ID</Label>
                  <p className="font-mono text-sm font-semibold">{selectedTransaction.id}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Date & Time</Label>
                  <p className="text-sm">{new Date(selectedTransaction.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Customer</Label>
                  <p className="text-sm">
                    {selectedTransaction.notes
                      ? selectedTransaction.notes.split(",")[0].replace("Customer: ", "")
                      : "Walk-in"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Cashier</Label>
                  <p className="text-sm">{selectedTransaction.cashierName || "N/A"}</p>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Items</Label>
                <div className="mt-2 border border-border rounded-md">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border bg-muted/50">
                      <tr>
                        <th className="text-left py-2 px-3">Product</th>
                        <th className="text-center py-2 px-3">Qty</th>
                        <th className="text-right py-2 px-3">Price</th>
                        <th className="text-right py-2 px-3">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTransaction.items.map((item, idx) => (
                        <tr key={idx} className="border-b border-border last:border-0">
                          <td className="py-2 px-3">{item.productName}</td>
                          <td className="py-2 px-3 text-center">{item.quantity}</td>
                          <td className="py-2 px-3 text-right">GHS {item.price.toFixed(2)}</td>
                          <td className="py-2 px-3 text-right font-semibold">GHS {item.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Payment Method</Label>
                  <p className="text-sm capitalize">{selectedTransaction.paymentMethod}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    {selectedTransaction.paymentMethod === "cash" ? "Amount Received" : "Reference"}
                  </Label>
                  <p className="text-sm">{selectedTransaction.paymentReference || "N/A"}</p>
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>GHS {selectedTransaction.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>GHS {selectedTransaction.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Discount:</span>
                  <span>-GHS {selectedTransaction.discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold border-t border-border pt-2">
                  <span>Total:</span>
                  <span className="text-primary">GHS {selectedTransaction.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => handlePrintReceipt(selectedTransaction)}
                  className="bg-primary hover:bg-primary/90 flex-1"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Receipt
                </Button>
                <Button variant="outline" onClick={() => setShowDetails(false)} className="flex-1">
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
