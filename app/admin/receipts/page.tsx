"use client"

import { useEffect, useState } from "react"
import { getSales, getProducts } from "@/lib/db"
import type { Sale, Product } from "@/lib/db"
import { getLogoPath } from "@/lib/navigation"
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
    const storeName = "Owoabenes Mothercare & Kids Boutique"
    const receiptDate = new Date(sale.createdAt).toLocaleString()
    const cashierName = sale.cashierName || "Benedicta Sarpong"
    const displayPaymentMethod = sale.paymentMethod === "cash" ? "Cash" : "Mobile Money"
    const displayAmountReceived = sale.total
    const displayChange = 0

    // Parse customer info from notes
    let customerName = "Walk-in"
    let customerPhone = ""
    if (sale.notes) {
      const customerMatch = sale.notes.match(/Customer:\s*([^,]+)/)
      const phoneMatch = sale.notes.match(/Phone:\s*([^,]+)/)
      if (customerMatch) customerName = customerMatch[1].trim()
      if (phoneMatch) customerPhone = phoneMatch[1].trim()
    }

    // Get logo URL that works in Electron
    const logoUrl = getLogoPath()

    const printWindow = window.open("", "", "height=800,width=600")
    if (printWindow) {
      const receiptHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receipt #${sale.id}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body {
                font-family: 'Segoe UI', Arial, sans-serif;
                background: white;
                padding: 20px;
                display: flex;
                justify-content: center;
              }
              .receipt-container {
                width: 100%;
                max-width: 320px;
                background: white;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
              }
              .header {
                background: linear-gradient(to right, #ec4899, #db2777);
                color: white;
                padding: 16px;
                text-align: center;
                border-bottom: 2px solid #ec4899;
              }
              .logo-container {
                display: inline-block;
                margin-bottom: 8px;
                padding: 2px;
                background: white;
                border-radius: 50%;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              }
              .logo {
                width: 40px;
                height: 40px;
                object-fit: contain;
              }
              .store-name {
                font-size: 18px;
                font-weight: 800;
                letter-spacing: -0.025em;
                margin-bottom: 2px;
                color: #be185d;
              }
              .subtitle {
                font-size: 10px;
                color: #cbd5e1;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                font-weight: 600;
              }
              .receipt-id-section {
                background: linear-gradient(to right, #fce7f3, white);
                padding: 12px 16px;
                text-align: center;
                border-bottom: 1px solid #fce7f3;
              }
              .receipt-label {
                font-size: 10px;
                color: #475569;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                margin-bottom: 4px;
              }
              .receipt-number {
                font-size: 20px;
                font-weight: 900;
                font-family: monospace;
                color: #be185d;
                letter-spacing: -0.025em;
              }
              .customer-section {
                padding: 12px 16px;
                background: #fef3c7;
                border-bottom: 1px solid #fcd34d;
              }
              .customer-title {
                font-size: 10px;
                color: #92400e;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                margin-bottom: 4px;
              }
              .customer-name {
                font-size: 14px;
                font-weight: 700;
                color: #78350f;
                margin-bottom: 2px;
              }
              .customer-phone {
                font-size: 12px;
                color: #92400e;
                font-family: monospace;
              }
              .transaction-details {
                padding: 12px 16px;
                border-bottom: 1px solid #e2e8f0;
              }
              .detail-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 6px;
              }
              .detail-row:last-child { margin-bottom: 0; }
              .detail-label {
                font-size: 10px;
                color: #475569;
                font-weight: 500;
              }
              .detail-value {
                font-size: 12px;
                font-family: monospace;
                color: #1e293b;
              }
              .items-section {
                padding: 12px 16px;
                border-bottom: 1px solid #e2e8f0;
              }
              .item {
                margin-bottom: 8px;
              }
              .item:last-child { margin-bottom: 0; }
              .item-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
              }
              .item-name {
                font-size: 12px;
                font-weight: 600;
                color: #0f172a;
                flex: 1;
              }
              .item-total {
                font-size: 12px;
                font-family: monospace;
                font-weight: 700;
                color: #0f172a;
                margin-left: 8px;
              }
              .item-details {
                font-size: 10px;
                color: #64748b;
                margin-top: 2px;
              }
              .totals-section {
                padding: 12px 16px;
                background: #f8fafc;
                border-bottom: 1px solid #e2e8f0;
              }
              .total-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 6px;
              }
              .total-row:last-child { margin-bottom: 0; }
              .total-label {
                font-size: 12px;
                color: #475569;
                font-weight: 500;
              }
              .total-value {
                font-size: 12px;
                font-family: monospace;
                font-weight: 600;
                color: #1e293b;
              }
              .grand-total {
                padding-top: 6px;
                border-top: 1px solid #cbd5e1;
              }
              .grand-total .total-label {
                font-size: 14px;
                font-weight: 700;
                color: #0f172a;
              }
              .grand-total .total-value {
                font-size: 18px;
                font-weight: 900;
                color: #0f172a;
              }
              .payment-section {
                padding: 12px 16px;
                border-bottom: 1px solid #e2e8f0;
              }
              .payment-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
                margin-bottom: 8px;
              }
              .payment-box {
                border-radius: 8px;
                padding: 8px;
                border: 1px solid;
              }
              .payment-box.pink {
                background: #fdf2f8;
                border-color: #fbcfe8;
              }
              .payment-box.green {
                background: #f0fdf4;
                border-color: #bbf7d0;
              }
              .payment-box-label {
                font-size: 10px;
                color: #475569;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                margin-bottom: 4px;
              }
              .payment-box-value {
                font-size: 14px;
                font-weight: 900;
                font-family: monospace;
              }
              .payment-box.pink .payment-box-value { color: #be185d; }
              .payment-box.green .payment-box-value { color: #16a34a; }
              .payment-method-box {
                background: #1e293b;
                border-radius: 8px;
                padding: 8px;
                color: white;
              }
              .payment-method-label {
                font-size: 10px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                margin-bottom: 4px;
                opacity: 0.8;
              }
              .payment-method-value {
                font-size: 12px;
                font-weight: 700;
                text-transform: capitalize;
              }
              .footer {
                padding: 12px 16px;
                text-align: center;
                background: white;
                font-weight: bold;
              }
              .thank-you {
                font-size: 12px;
                font-weight: 700;
                color: #0f172a;
                margin-bottom: 4px;
              }
              .phone-number {
                font-size: 10px;
                color: #94a3b8;
              }
              @media print {
                body {
                  background: white;
                  padding: 0;
                }
                .receipt-container {
                  box-shadow: none;
                  border-radius: 0;
                  max-width: 80mm;
                  width: 80mm;
                  margin: 0 auto;
                }
                .header {
                  background: white !important;
                  color: black !important;
                  padding: 8px;
                  border-bottom: none;
                }
                .store-name { color: black !important; font-size: 14px; }
                .subtitle { color: black !important; }
                .logo-container {
                  background: transparent;
                  box-shadow: none;
                  margin-bottom: 4px;
                }
                .logo { width: 32px; height: 32px; }
                .receipt-id-section {
                  background: white !important;
                  padding: 8px 12px;
                  border-bottom: none;
                }
                .receipt-number { font-size: 16px; }
                .customer-section {
                  background: white !important;
                  border-bottom: 1px dashed #ccc;
                  padding: 8px 12px;
                }
                .customer-title { color: black !important; }
                .customer-name { color: black !important; }
                .customer-phone { color: black !important; }
                .transaction-details,
                .items-section,
                .totals-section,
                .payment-section,
                .footer {
                  padding: 8px 12px;
                }
                .totals-section { background: white !important; }
                .payment-box { padding: 6px; }
                .payment-method-box {
                  background: white !important;
                  color: black !important;
                  border: 1px solid #ccc;
                }
              }
            </style>
          </head>
          <body>
            <div class="receipt-container">
              <div class="header">
                <div class="logo-container">
                  <img src="${logoUrl}" alt="Logo" class="logo" />
                </div>
                <h1 class="store-name">${storeName}</h1>
                <p class="subtitle">Official Receipt</p>
              </div>

              <div class="receipt-id-section">
                <p class="receipt-label">Receipt Number</p>
                <p class="receipt-number">${sale.id}</p>
              </div>

              ${(customerName !== "Walk-in" || customerPhone) ? `
              <div class="customer-section">
                <p class="customer-title">Customer</p>
                ${customerName !== "Walk-in" ? `<div class="customer-name">${customerName}</div>` : ''}
                ${customerPhone ? `<div class="customer-phone">Tel: ${customerPhone}</div>` : ''}
              </div>
              ` : ''}

              <div class="transaction-details">
                <div class="detail-row">
                  <span class="detail-label">Date</span>
                  <span class="detail-value">${receiptDate}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Cashier</span>
                  <span class="detail-value">${cashierName}</span>
                </div>
              </div>

              <div class="items-section">
                ${sale.items
                  .map(
                    (item) => `
                  <div class="item">
                    <div class="item-header">
                      <span class="item-name">${item.productName}</span>
                      <span class="item-total">GHS ${item.total.toFixed(2)}</span>
                    </div>
                    <div class="item-details">${item.quantity} × GHS ${item.price.toFixed(2)}</div>
                  </div>
                `,
                  )
                  .join("")}
              </div>

              <div class="totals-section">
                <div class="total-row">
                  <span class="total-label">Subtotal</span>
                  <span class="total-value">GHS ${(sale.subtotal ?? sale.total).toFixed(2)}</span>
                </div>
                <div class="total-row grand-total">
                  <span class="total-label">Total</span>
                  <span class="total-value">GHS ${sale.total.toFixed(2)}</span>
                </div>
              </div>

              <div class="payment-section">
                <div class="payment-grid">
                  <div class="payment-box pink">
                    <p class="payment-box-label">${displayPaymentMethod === "Mobile Money" ? "Sent" : "Paid"}</p>
                    <p class="payment-box-value">GHS ${displayAmountReceived.toFixed(2)}</p>
                  </div>
                  ${displayChange > 0 ? `
                  <div class="payment-box green">
                    <p class="payment-box-label">Change</p>
                    <p class="payment-box-value">GHS ${displayChange.toFixed(2)}</p>
                  </div>
                  ` : ''}
                </div>
                <div class="payment-method-box">
                  <p class="payment-method-label">Method</p>
                  <p class="payment-method-value">${displayPaymentMethod}</p>
                </div>
              </div>

              <div class="footer">
                <p class="thank-you">✓ Thank You for Your Purchase!</p>
                <p class="phone-number">Visit Us Again...!</p>
                <p class="phone-number">Tel: 0548 048 520/ 0549 241 991</p>

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
