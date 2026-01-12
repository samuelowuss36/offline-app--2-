"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Minus, Plus, ShoppingCart, Printer, Search, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { getProducts, addSale, Product, SaleItem } from "@/lib/db"
import { getLogoPath } from "@/lib/navigation"
import { useToast } from "@/hooks/use-toast"
import ReceiptDisplay from "@/components/receipt/receipt-display"

const CashierClient = () => {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [cart, setCart] = useState<SaleItem[]>([])
  const [manualCustomerName, setManualCustomerName] = useState("")
  const [manualCustomerPhone, setManualCustomerPhone] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [mobileMoneyAmount, setMobileMoneyAmount] = useState(0)
  const [amountReceived, setAmountReceived] = useState(0)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [showReceiptPreview, setShowReceiptPreview] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [printSale, setPrintSale] = useState<{
    id: string
    items: any[]
    subtotal: number
    total: number
    amountReceived: number
    change: number
    paymentMethod: string
    dateTime: string
    cashierName: string
  } | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) || product.id.toString().includes(searchQuery),
    )
    setFilteredProducts(filtered)
  }, [searchQuery, products])

  const loadProducts = async () => {
    const data = await getProducts()
    setProducts(data)
  }

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.productId === product.id)
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item,
        ),
      )
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity: 1,
          total: product.price,
        },
      ])
    }
  }

  const subtotal = cart.reduce((acc, item) => acc + item.total, 0)
  const total = cart.reduce((acc, item) => acc + item.total, 0)
  const change = amountReceived - total

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId))
  }

  const updateCartQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
    } else {
      setCart(
        cart.map((item) =>
          item.productId === productId ? { ...item, quantity: newQuantity, total: newQuantity * item.price } : item,
        ),
      )
    }
  }

  const validateCheckout = (): boolean => {
    const errors: Record<string, string> = {}

    if (!manualCustomerName.trim()) {
      errors.customerName = "Customer name is required"
    }
    if (!manualCustomerPhone.trim()) {
      errors.customerPhone = "Customer phone is required"
    }

    if (paymentMethod === "cash") {
      if (amountReceived <= 0) {
        errors.amountReceived = "Amount received must be greater than 0"
      }
      if (amountReceived < total) {
        errors.amountReceived = "Amount received cannot be less than total"
      }
    } else if (paymentMethod === "mobileMoney") {
      if (mobileMoneyAmount <= 0) {
        errors.mobileMoneyAmount = "Amount sent must be greater than 0"
      }
      if (mobileMoneyAmount < total) {
        errors.mobileMoneyAmount = "Amount sent cannot be less than total"
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCompleteTransaction = () => {
    if (!validateCheckout()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly",
        variant: "destructive",
      })
      return
    }
    setShowReceiptPreview(true)
  }

  const confirmPrintReceipt = async () => {
    setProcessingPayment(true)
    try {
      const amountReceivedValue = paymentMethod === "cash" ? amountReceived : mobileMoneyAmount
      const changeValue = paymentMethod === "cash" ? change : (mobileMoneyAmount - total)

      const saleId = await addSale({
        items: cart,
        subtotal: subtotal,
        tax: 0,
        discount: 0,
        total: total,
        paymentMethod: paymentMethod as "cash" | "mobileMoney",
        paymentReference: undefined,
        amountReceived: amountReceivedValue,
        change: changeValue,
        cashierName: "Benedicta Sarpong",
        notes: `Customer: ${manualCustomerName}, Phone: ${manualCustomerPhone}`,
      })

      console.log("[v0] Sale completed with ID:", saleId)

      toast({
        title: "Transaction Saved",
        description: `Receipt #${saleId} has been saved to the database successfully`,
        variant: "default",
      })

      const printWindow = window.open("", "", "height=800,width=600")
      if (printWindow) {
        const storeName = "Owoabenes Mothercare & Kids Boutique"
        const receiptDate = new Date().toLocaleString()
        const cashierName = "Benedicta Sarpong"
        const displayPaymentMethod = paymentMethod === "cash" ? "Cash" : "Mobile Money"
        const displayAmountReceived = paymentMethod === "cash" ? amountReceived : mobileMoneyAmount
        const displayChange = paymentMethod === "cash" ? change : (mobileMoneyAmount - total)
        console.log("[DEBUG] Print values - paymentMethod:", paymentMethod, "displayAmountReceived:", displayAmountReceived, "displayChange:", displayChange)
        
        // Get logo URL that works in Electron
        const logoUrl = getLogoPath()

        const receiptHTML = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Receipt #${saleId}</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                  font-family: 'Segoe UI', Arial, sans-serif;
                  background: #f5f5f5;
                  padding: 20px;
                  display: flex;
                  justify-content: center;
                }
                .receipt-container {
                  max-width: 400px;
                  width: 100%;
                  background: white;
                  border-radius: 16px;
                  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                  overflow: hidden;
                }
                .header {
                  background: linear-gradient(to right, #ec4899, #db2777);
                  color: white;
                  padding: 16px;
                  text-align: center;
                  border-bottom: 4px solid #ec4899;
                }
                .logo-container {
                  display: inline-block;
                  margin-bottom: 8px;
                  padding: 2px;
                  background: white;
                  border-radius: 50%;
                  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
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
                  background: linear-gradient(to right, #fbcfe8, white);
                  padding: 12px 16px;
                  text-align: center;
                  border-bottom: 2px solid #fbcfe8;
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
                  padding: 8px 16px;
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
                  padding: 8px 16px;
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
                  margin-left: 6px;
                }
                .item-details {
                  font-size: 10px;
                  color: #64748b;
                  margin-top: 2px;
                }
                .totals-section {
                  padding: 8px 16px;
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
                  padding: 8px 16px;
                  border-bottom: 1px solid #e2e8f0;
                }
                .payment-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr 1fr;
                  gap: 8px;
                  margin-bottom: 8px;
                }
                .payment-box {
                  border-radius: 8px;
                  padding: 8px;
                  border: 1px solid;
                  text-align: center;
                }
                .payment-box.pink {
                  background: #fdf2f8;
                  border-color: #fbcfe8;
                }
                .payment-box.green {
                  background: #f0fdf4;
                  border-color: #bbf7d0;
                }
                .payment-box.dark {
                  background: #1e293b;
                  border-color: #334155;
                  color: white;
                }
                .payment-box-label {
                  font-size: 10px;
                  font-weight: 600;
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
                  margin-bottom: 4px;
                  opacity: 0.8;
                }
                .payment-box-value {
                  font-size: 14px;
                  font-weight: 900;
                  font-family: monospace;
                }
                .payment-box.pink .payment-box-value { color: #be185d; }
                .payment-box.green .payment-box-value { color: #16a34a; }
                .payment-box.dark .payment-box-value { color: white; }
                .footer {
                  padding: 12px 16px;
                  text-align: center;
                  background: white;
                }
                .thank-you {
                  font-size: 12px;
                  font-weight: 700;
                  color: #0f172a;
                  margin-bottom: 4px;
                }
                .visit-again {
                  font-size: 10px;
                  color: #94a3b8;
                  margin-bottom: 2px;
                }
                .phone-number {
                  font-size: 10px;
                  color: #94a3b8;
                  font-weight: 700;
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
                  .customer-section,
                  .transaction-details,
                  .items-section,
                  .totals-section,
                  .payment-section,
                  .footer {
                    padding: 6px 12px;
                  }
                  .totals-section { background: white !important; }
                  .customer-section {
                    background: white !important;
                    border-bottom: 1px dashed #ccc;
                  }
                  .customer-title { color: black !important; }
                  .customer-name { color: black !important; }
                  .customer-phone { color: black !important; }
                  .payment-box { padding: 6px; }
                  .footer { padding: 12px 16px; }
                  .thank-you, .visit-again, .phone-number { color: black; }
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
                  <p class="receipt-number">${saleId}</p>
                </div>

                ${(manualCustomerName || manualCustomerPhone) ? `
                <div class="customer-section">
                  <p class="customer-title">Customer</p>
                  <div style="display: flex; flex-direction: column; gap: 4px;">
                    ${manualCustomerName ? `<div style="display: flex; justify-content: space-between; align-items: center;"><span class="detail-label" style="font-size: 10px; color: #92400e; font-weight: 500;">Name:</span><p class="customer-name">${manualCustomerName}</p></div>` : ''}
                    ${manualCustomerPhone ? `<div style="display: flex; justify-content: space-between; align-items: center;"><span class="detail-label" style="font-size: 10px; color: #92400e; font-weight: 500;">Phone:</span><p class="customer-phone">${manualCustomerPhone}</p></div>` : ''}
                  </div>
                </div>
                ` : ''}

                <div class="transaction-details">
                  <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">${receiptDate}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Cashier:</span>
                    <span class="detail-value">${cashierName}</span>
                  </div>
                </div>

                <div class="items-section">
                  <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
                    <span style="flex: 1;">Item</span>
                    <span style="width: 48px; text-align: center;">Qty</span>
                    <span style="width: 64px; text-align: right;">Price</span>
                    <span style="width: 64px; text-align: right; margin-left: 6px;">Total</span>
                  </div>
                  ${cart
                    .map(
                      (item: any) => `
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; margin-bottom: 8px;">
                      <span style="flex: 1; font-weight: 600; color: #0f172a;">${item.productName}</span>
                      <span style="width: 48px; text-align: center; font-family: monospace; color: #475569;">${item.quantity}</span>
                      <span style="width: 64px; text-align: right; font-family: monospace; color: #475569;">GHS ${item.price.toFixed(2)}</span>
                      <span style="width: 64px; text-align: right; font-family: monospace; font-weight: 700; color: #0f172a; margin-left: 6px;">GHS ${item.total.toFixed(2)}</span>
                    </div>
                  `,
                    )
                    .join("")}
                </div>

                <div class="totals-section">
                  <div class="total-row">
                    <span class="total-label">Subtotal</span>
                    <span class="total-value">GHS ${subtotal.toFixed(2)}</span>
                  </div>
                  <div class="total-row grand-total">
                    <span class="total-label">Total</span>
                    <span class="total-value">GHS ${total.toFixed(2)}</span>
                  </div>
                </div>

                <div class="payment-section">
                  <div class="payment-grid">
                    <div class="payment-box pink">
                      <p class="payment-box-label">${displayPaymentMethod === "Mobile Money" ? "Sent" : "Paid"}</p>
                      <p class="payment-box-value">GHS ${displayAmountReceived.toFixed(2)}</p>
                    </div>
                    <div class="payment-box green">
                      <p class="payment-box-label">Change</p>
                      <p class="payment-box-value">GHS ${displayChange.toFixed(2)}</p>
                    </div>
                    <div class="payment-box dark">
                      <p class="payment-box-label">Method</p>
                      <p class="payment-box-value">${displayPaymentMethod}</p>
                    </div>
                  </div>
                </div>

                <div class="footer">
                  <p class="thank-you">✓ Thank You for Your Purchase!</p>
                  <p class="visit-again">Visit Us Again...!</p>
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

      setCart([])
      setManualCustomerName("")
      setManualCustomerPhone("")
      setPaymentMethod("cash")
      setMobileMoneyAmount(0)
      setAmountReceived(0)
      setValidationErrors({})
      setShowReceiptPreview(false)

      toast({
        title: "Success",
        description: `Receipt #${saleId} printed. Stock updated.`,
      })

      await loadProducts()
    } catch (error) {
      console.error("[v0] Error processing sale:", error)
      toast({
        title: "Error",
        description: "Failed to process transaction",
        variant: "destructive",
      })
    } finally {
      setProcessingPayment(false)
    }
  }

  return (
    <div className="flex h-screen gap-4 p-4 bg-background">
      {/* LEFT SIDE - PRODUCTS */}
      <div className="flex-1 flex flex-col min-h-0">
        <Card className="flex flex-col h-full">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="text-lg">Products</CardTitle>
            <CardDescription>{filteredProducts.length} items available</CardDescription>

            <div className="mt-4 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
          </CardHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="grid grid-cols-3 gap-3">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="border border-border rounded-lg p-3 hover:bg-accent/50 transition-colors text-left"
                  >
                    <p className="font-semibold text-sm truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground mb-2">Stock: {product.quantity}</p>
                    <p className="text-sm font-bold text-primary">GHS {product.price.toFixed(2)}</p>
                  </button>
                ))
              ) : (
                <div className="col-span-3 flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-10 w-10 mb-2 opacity-20" />
                  <p className="text-sm font-medium">No products found</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* RIGHT SIDE - CHECKOUT */}
      <div className="w-96 flex flex-col min-h-0">
        <Card className="flex flex-col h-full overflow-y-auto">
          {/* Customer Information - Always Visible at Top */}
          <div className="flex-shrink-0 border-b border-border p-4">
            <Label className="text-xs font-semibold block mb-3">
              Customer Information <span className="text-destructive">*</span>
            </Label>
            <div className="space-y-2">
              <div>
                <Input
                  placeholder="Customer Name *"
                  value={manualCustomerName}
                  onChange={(e) => setManualCustomerName(e.target.value)}
                  className={cn("h-9 text-sm mb-1", validationErrors.customerName && "border-destructive")}
                />
                {validationErrors.customerName && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.customerName}
                  </p>
                )}
              </div>
              <div>
                <Input
                  placeholder="Customer Phone *"
                  value={manualCustomerPhone}
                  onChange={(e) => setManualCustomerPhone(e.target.value)}
                  className={cn("h-9 text-sm", validationErrors.customerPhone && "border-destructive")}
                />
                {validationErrors.customerPhone && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.customerPhone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Shopping Cart - No Internal Scroll */}
          <div className="flex-shrink-0 border-b border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <CardTitle className="text-sm font-semibold">Items in Cart</CardTitle>
              <span className="text-xs bg-primary text-primary-foreground rounded px-2 py-1">{cart.length}</span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {cart.length > 0 ? (
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div
                      key={item.productId}
                      className="border border-border rounded p-2 space-y-1 bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">GHS {item.price.toFixed(2)}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.productId)}
                          className="h-6 w-6 p-0 hover:text-destructive flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between bg-muted/50 rounded p-1 gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                          className="h-6 w-6 p-0 flex-shrink-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="font-semibold text-sm w-6 text-center flex-shrink-0">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                          className="h-6 w-6 p-0 flex-shrink-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <div className="ml-auto flex-shrink-0">
                          <span className="font-semibold text-xs text-primary">GHS {item.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 text-muted-foreground">
                  <ShoppingCart className="h-8 w-8 mb-1 opacity-20" />
                  <p className="text-xs font-medium">Cart is empty</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="flex-shrink-0 border-b border-border p-4 bg-muted/50">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">GHS {subtotal.toFixed(2)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-bold text-base text-primary">
                <span>TOTAL:</span>
                <span>GHS {total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="flex-shrink-0 border-b border-border p-4">
            <Label className="text-xs font-semibold block mb-3">
              Payment Method <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => {
                  setPaymentMethod("cash")
                  setMobileMoneyAmount(0)
                  setValidationErrors({ ...validationErrors, mobileMoneyAmount: "" })
                }}
                className={cn(
                  "px-3 py-2 rounded border-2 text-sm font-medium transition-all",
                  paymentMethod === "cash"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary",
                )}
              >
                Cash
              </button>
              <button
                onClick={() => setPaymentMethod("mobileMoney")}
                className={cn(
                  "px-3 py-2 rounded border-2 text-sm font-medium transition-all",
                  paymentMethod === "mobileMoney"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary",
                )}
              >
                Mobile Money
              </button>
            </div>

            {paymentMethod === "cash" && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold">
                  Amount Received (GHS) <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  value={amountReceived}
                  onChange={(e) => {
                    const val = Math.max(0, Number.parseFloat(e.target.value) || 0);
                    console.log("[DEBUG] Amount received input changed to:", val);
                    setAmountReceived(val);
                  }}
                  className={cn("h-9 text-sm font-bold", validationErrors.amountReceived && "border-destructive")}
                  placeholder="0"
                />
                {validationErrors.amountReceived && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.amountReceived}
                  </p>
                )}
                {change > 0 && (
                  <div className="bg-green-100/20 border border-green-200 rounded p-2">
                    <p className="text-xs text-green-700 font-semibold">Change: GHS {change.toFixed(2)}</p>
                  </div>
                )}
              </div>
            )}

            {paymentMethod === "mobileMoney" && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold">
                  Amount Sent (GHS) <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  value={mobileMoneyAmount}
                  onChange={(e) => setMobileMoneyAmount(Math.max(0, Number.parseFloat(e.target.value) || 0))}
                  className={cn("h-9 text-sm font-bold", validationErrors.mobileMoneyAmount && "border-destructive")}
                  placeholder="0"
                />
                {validationErrors.mobileMoneyAmount && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.mobileMoneyAmount}
                  </p>
                )}
                {mobileMoneyAmount > total && (
                  <div className="bg-green-100/20 border border-green-200 rounded p-2">
                    <p className="text-xs text-green-700 font-semibold">Change: GHS {(mobileMoneyAmount - total).toFixed(2)}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Print Button - Fixed at Bottom */}
          <div className="flex-shrink-0 border-t border-border p-4 bg-card space-y-2">
            <Button
              onClick={handleCompleteTransaction}
              disabled={
                processingPayment ||
                cart.length === 0 ||
                !manualCustomerName.trim() ||
                !manualCustomerPhone.trim() ||
                (paymentMethod === "cash" && amountReceived < total) ||
                (paymentMethod === "mobileMoney" && mobileMoneyAmount < total)
              }
              className="w-full h-14 text-base font-bold"
              size="lg"
            >
              <Printer className="h-5 w-5 mr-2" />
              Complete & Print Receipt
            </Button>
            <Button
              onClick={() => {
                setCart([])
                setManualCustomerName("")
                setManualCustomerPhone("")
                setPaymentMethod("cash")
                setMobileMoneyAmount(0)
                setAmountReceived(0)
                setValidationErrors({})
              }}
              variant="outline"
              className="w-full h-10"
            >
              Clear Cart
            </Button>
          </div>
        </Card>
      </div>

      {showReceiptPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 z-50">
          <Card className="w-full max-w-md flex flex-col max-h-[98vh]">
            <CardHeader className="pb-2 flex-shrink-0">
              <CardTitle>Receipt Preview</CardTitle>
            </CardHeader>
            <div className="flex-1 overflow-y-auto px-2">
              <ReceiptDisplay
                receiptId="(Will be generated)"
                items={cart.map((item: any) => ({
                  name: item.productName,
                  quantity: item.quantity,
                  price: item.price,
                  total: item.total,
                }))}
                subtotal={subtotal}
                total={total}
                amountReceived={paymentMethod === "cash" ? amountReceived : mobileMoneyAmount}
                change={paymentMethod === "cash" ? change : (mobileMoneyAmount - total)}
                paymentMethod={paymentMethod === "cash" ? "Cash" : "Mobile Money"}
                dateTime={new Date().toLocaleString()}
                cashierName="Benedicta Sarpong"
                customerName={manualCustomerName}
                customerPhone={manualCustomerPhone}
              />
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 border-t border-border p-3 bg-card space-y-2">
              <Button onClick={confirmPrintReceipt} disabled={processingPayment} className="w-full h-10 font-bold">
                {processingPayment ? "Processing..." : "Confirm & Print"}
              </Button>
              <Button
                onClick={() => setShowReceiptPreview(false)}
                variant="outline"
                className="w-full h-9"
                disabled={processingPayment}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default CashierClient
