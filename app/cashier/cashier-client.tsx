"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Minus, Plus, ShoppingCart, Printer, Search, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { getProducts, addSale, Product, SaleItem } from "@/lib/db"
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
  const [paymentReference, setPaymentReference] = useState("")
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
      if (!paymentReference.trim()) {
        errors.paymentReference = "Transaction reference is required"
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
      const saleId = await addSale({
        items: cart,
        subtotal: subtotal,
        tax: 0,
        discount: 0,
        total: total,
        paymentMethod: paymentMethod as "cash" | "mobileMoney",
        paymentReference: paymentMethod === "mobileMoney" ? paymentReference : undefined,
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
        const displayAmountReceived = paymentMethod === "cash" ? amountReceived : total
        const displayChange = paymentMethod === "cash" ? change : 0
        
        // Get absolute URL for logo
        const logoUrl = `${window.location.origin}/logo.jpeg`

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
                }
                .receipt-container {
                  max-width: 400px;
                  margin: 0 auto;
                  background: white;
                  border-radius: 24px;
                  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                  overflow: hidden;
                }
                .header {
                  background: linear-gradient(to right, #ec4899, #db2777);
                  color: white;
                  padding: 32px;
                  text-align: center;
                  border-bottom: 4px solid #ec4899;
                }
                .logo-container {
                  display: inline-block;
                  margin-bottom: 12px;
                  padding: 4px;
                  background: white;
                  border-radius: 50%;
                  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                }
                .logo {
                  width: 64px;
                  height: 64px;
                  object-fit: contain;
                }
                .store-name {
                  font-size: 24px;
                  font-weight: 800;
                  letter-spacing: -0.025em;
                  margin-bottom: 4px;
                  color: #be185d;
                }
                .subtitle {
                  font-size: 12px;
                  color: #cbd5e1;
                  text-transform: uppercase;
                  letter-spacing: 0.1em;
                  font-weight: 600;
                }
                .tagline {
                  font-size: 14px;
                  color: #e2e8f0;
                  font-style: italic;
                }
                .receipt-id-section {
                  background: linear-gradient(to right, #fbcfe8, white);
                  padding: 24px 32px;
                  text-align: center;
                  border-bottom: 2px solid #fbcfe8;
                }
                .receipt-label {
                  font-size: 12px;
                  color: #475569;
                  font-weight: 600;
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
                  margin-bottom: 8px;
                }
                .receipt-number {
                  font-size: 28px;
                  font-weight: 900;
                  font-family: monospace;
                  color: #be185d;
                  letter-spacing: -0.025em;
                }
                .transaction-details {
                  padding: 20px 32px;
                  border-bottom: 1px solid #e2e8f0;
                }
                .customer-section {
                  padding: 16px 32px;
                  background: #fef3c7;
                  border-bottom: 1px solid #fcd34d;
                }
                .customer-title {
                  font-size: 12px;
                  color: #92400e;
                  font-weight: 600;
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
                  margin-bottom: 8px;
                }
                .customer-name {
                  font-size: 16px;
                  font-weight: 700;
                  color: #78350f;
                  margin-bottom: 4px;
                }
                .customer-phone {
                  font-size: 14px;
                  color: #92400e;
                  font-family: monospace;
                }
                .detail-row {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 12px;
                }
                .detail-row:last-child { margin-bottom: 0; }
                .detail-label {
                  font-size: 12px;
                  color: #475569;
                  font-weight: 500;
                }
                .detail-value {
                  font-size: 14px;
                  font-family: monospace;
                  color: #1e293b;
                }
                .items-section {
                  padding: 24px 32px;
                  border-bottom: 1px solid #e2e8f0;
                }
                .item {
                  margin-bottom: 16px;
                }
                .item:last-child { margin-bottom: 0; }
                .item-header {
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
                }
                .item-name {
                  font-size: 14px;
                  font-weight: 600;
                  color: #0f172a;
                  flex: 1;
                }
                .item-total {
                  font-size: 14px;
                  font-family: monospace;
                  font-weight: 700;
                  color: #0f172a;
                  margin-left: 12px;
                }
                .item-details {
                  font-size: 12px;
                  color: #64748b;
                  margin-top: 4px;
                }
                .divider {
                  padding: 12px 32px;
                }
                .dashed-line {
                  border-top: 2px dashed #cbd5e1;
                }
                .totals-section {
                  padding: 20px 32px;
                  background: #f8fafc;
                  border-bottom: 1px solid #e2e8f0;
                }
                .total-row {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 12px;
                }
                .total-row:last-child { margin-bottom: 0; }
                .total-label {
                  font-size: 14px;
                  color: #475569;
                  font-weight: 500;
                }
                .total-value {
                  font-size: 14px;
                  font-family: monospace;
                  font-weight: 600;
                  color: #1e293b;
                }
                .grand-total {
                  padding-top: 12px;
                  border-top: 1px solid #cbd5e1;
                }
                .grand-total .total-label {
                  font-size: 16px;
                  font-weight: 700;
                  color: #0f172a;
                }
                .grand-total .total-value {
                  font-size: 24px;
                  font-weight: 900;
                  color: #0f172a;
                }
                .payment-section {
                  padding: 20px 32px;
                  border-bottom: 1px solid #e2e8f0;
                }
                .payment-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 16px;
                  margin-bottom: 16px;
                }
                .payment-box {
                  border-radius: 12px;
                  padding: 16px;
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
                  font-size: 12px;
                  color: #475569;
                  font-weight: 600;
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
                  margin-bottom: 8px;
                }
                .payment-box-value {
                  font-size: 18px;
                  font-weight: 900;
                  font-family: monospace;
                }
                .payment-box.pink .payment-box-value { color: #be185d; }
                .payment-box.green .payment-box-value { color: #16a34a; }
                .payment-method-box {
                  background: linear-gradient(to right, #1e293b, #0f172a);
                  border-radius: 12px;
                  padding: 16px;
                  color: white;
                }
                .payment-method-label {
                  font-size: 12px;
                  font-weight: 600;
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
                  margin-bottom: 8px;
                  opacity: 0.8;
                }
                .payment-method-value {
                  font-size: 16px;
                  font-weight: 700;
                  text-transform: capitalize;
                }
                .footer {
                  padding: 24px 32px;
                  text-align: center;
                  background: white;
                }
                .thank-you {
                  font-size: 14px;
                  font-weight: 700;
                  color: #0f172a;
                  margin-bottom: 8px;
                }
                .footer-note {
                  font-size: 12px;
                  color: #64748b;
                  margin-bottom: 4px;
                }
                .footer-divider {
                  border-top: 1px solid #e2e8f0;
                  margin-top: 12px;
                  padding-top: 12px;
                }
                .phone-number {
                  font-size: 12px;
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
                    padding: 12px;
                    border-bottom: none;
                  }
                  .store-name { color: black !important; font-size: 16px; }
                  .subtitle, .tagline { color: black !important; }
                  .logo-container {
                    background: transparent;
                    box-shadow: none;
                    margin-bottom: 8px;
                  }
                  .logo { width: 48px; height: 48px; }
                  .receipt-id-section {
                    background: white !important;
                    padding: 12px 16px;
                    border-bottom: none;
                  }
                  .receipt-number { font-size: 20px; }
                  .transaction-details,
                  .customer-section,
                  .items-section,
                  .totals-section,
                  .payment-section,
                  .footer {
                    padding: 8px 16px;
                  }
                  .totals-section { background: white !important; }
                  .customer-section {
                    background: white !important;
                    border-bottom: 1px dashed #ccc;
                  }
                  .customer-title { color: black !important; }
                  .customer-name { color: black !important; }
                  .customer-phone { color: black !important; }
                  .payment-box { padding: 8px; }
                  .payment-method-box {
                    background: white !important;
                    color: black !important;
                    border: 1px solid #ccc;
                  }
                  .footer-note:not(.phone-number) { display: none; }
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
                  <p class="tagline">Quality care for mothers & kids</p>
                </div>

                <div class="receipt-id-section">
                  <p class="receipt-label">Receipt Number</p>
                  <p class="receipt-number">${saleId}</p>
                </div>

                <div class="customer-section">
                  <p class="customer-title">Customer Details</p>
                  <p class="customer-name">${manualCustomerName}</p>
                  <p class="customer-phone">Tel: ${manualCustomerPhone}</p>
                </div>

                <div class="transaction-details">
                  <div class="detail-row">
                    <span class="detail-label">Date & Time</span>
                    <span class="detail-value">${receiptDate}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Cashier</span>
                    <span class="detail-value">${cashierName}</span>
                  </div>
                </div>

                <div class="items-section">
                  ${cart
                    .map(
                      (item: any) => `
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

                <div class="divider">
                  <div class="dashed-line"></div>
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
                      <p class="payment-box-label">Amount Paid</p>
                      <p class="payment-box-value">GHS ${displayAmountReceived.toFixed(2)}</p>
                    </div>
                    <div class="payment-box green">
                      <p class="payment-box-label">Change</p>
                      <p class="payment-box-value">GHS ${displayChange.toFixed(2)}</p>
                    </div>
                  </div>
                  <div class="payment-method-box">
                    <p class="payment-method-label">Payment Method</p>
                    <p class="payment-method-value">${displayPaymentMethod}</p>
                  </div>
                </div>

                <div class="footer">
                  <p class="thank-you">✓ Thank You for Your Purchase!</p>
                  <p class="footer-note">Keep this receipt for your records</p>
                  <p class="footer-note">Valid proof of purchase</p>
                  <p class="footer-note">Items Purchased are non-refundable!</p>
                  <div class="footer-divider">
                    <p class="phone-number">Tel: 0548 048 520</p>
                  </div>
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
      setPaymentReference("")
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
                  setPaymentReference("")
                  setValidationErrors({ ...validationErrors, paymentReference: "" })
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
                  onChange={(e) => setAmountReceived(Math.max(0, Number.parseFloat(e.target.value) || 0))}
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
                  Transaction Reference <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="e.g., MTN-123456789"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className={cn("h-9 text-sm", validationErrors.paymentReference && "border-destructive")}
                />
                {validationErrors.paymentReference && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.paymentReference}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Print Button - Fixed at Bottom */}
          <div className="flex-shrink-0 border-t border-border p-4 bg-card space-y-2">
            <Button
              onClick={handleCompleteTransaction}
              disabled={processingPayment || cart.length === 0}
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
                setPaymentReference("")
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="pb-2">
              <CardTitle>Receipt Preview</CardTitle>
            </CardHeader>
            <div className="px-2">
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
                amountReceived={paymentMethod === "cash" ? amountReceived : total}
                change={paymentMethod === "cash" ? change : 0}
                paymentMethod={paymentMethod === "cash" ? "Cash" : "Mobile Money"}
                dateTime={new Date().toLocaleString()}
                cashierName="Benedicta Sarpong"
                customerName={manualCustomerName}
                customerPhone={manualCustomerPhone}
              />
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 border-t border-border p-4 bg-card space-y-2">
              <Button onClick={confirmPrintReceipt} disabled={processingPayment} className="w-full h-12 font-bold">
                {processingPayment ? "Processing..." : "Confirm & Print"}
              </Button>
              <Button
                onClick={() => setShowReceiptPreview(false)}
                variant="outline"
                className="w-full h-10"
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
