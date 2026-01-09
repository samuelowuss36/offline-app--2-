"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Minus, Plus, ShoppingCart, Printer, Search, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { getProducts, addSale } from "@/lib/db"
import { useToast } from "@/hooks/use-toast"

const CashierClient = () => {
  const { toast } = useToast()
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [cart, setCart] = useState([])
  const [manualCustomerName, setManualCustomerName] = useState("")
  const [manualCustomerPhone, setManualCustomerPhone] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [paymentReference, setPaymentReference] = useState("")
  const [amountReceived, setAmountReceived] = useState(0)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [showReceiptPreview, setShowReceiptPreview] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

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

  const addToCart = (product) => {
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

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.productId !== productId))
  }

  const updateCartQuantity = (productId, newQuantity) => {
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

      const printWindow = window.open("", "", "height=600,width=800")
      if (printWindow) {
        const receiptHTML = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Receipt #${saleId}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; background: white; }
                .receipt { max-width: 400px; margin: 0 auto; border: 1px solid #ccc; padding: 20px; }
                .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 10px; }
                .receipt-id { text-align: center; font-size: 18px; font-weight: bold; margin: 10px 0; font-family: monospace; }
                .customer-info { font-size: 12px; margin: 10px 0; }
                .items { margin: 15px 0; border-bottom: 1px dashed #ccc; padding-bottom: 10px; }
                .item { display: flex; justify-content: space-between; margin: 5px 0; font-size: 12px; }
                .totals { margin: 15px 0; font-size: 12px; }
                .total-line { display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; margin-top: 10px; }
                .footer { text-align: center; font-size: 11px; margin-top: 20px; border-top: 1px solid #ccc; padding-top: 10px; }
                @media print { body { background: white; } }
              </style>
            </head>
            <body>
              <div class="receipt">
                <div class="header">
                  <h2>RECEIPT</h2>
                  <p>POS System</p>
                </div>
                
                <div class="receipt-id">Receipt #${saleId}</div>
                
                <div class="customer-info">
                  <p><strong>Cashier:</strong> Benedicta Sarpong</p>
                  <p><strong>Customer:</strong> ${manualCustomerName || "Walk-in"}</p>
                  <p><strong>Phone:</strong> ${manualCustomerPhone || "N/A"}</p>
                  <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                </div>
                
                <div class="items">
                  <p><strong>Items:</strong></p>
                  ${cart
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
                    <span>GHS ${subtotal.toFixed(2)}</span>
                  </div>
                  <div class="total-line">
                    <span>TOTAL:</span>
                    <span>GHS ${total.toFixed(2)}</span>
                  </div>
                </div>
                
                <div class="totals">
                  <div class="item">
                    <span><strong>Payment Method:</strong></span>
                    <span>${paymentMethod === "cash" ? "Cash" : "Mobile Money"}</span>
                  </div>
                  ${
                    paymentMethod === "cash"
                      ? `
                    <div class="item">
                      <span>Amount Received:</span>
                      <span>GHS ${amountReceived.toFixed(2)}</span>
                    </div>
                    <div class="item">
                      <span>Change:</span>
                      <span>GHS ${change.toFixed(2)}</span>
                    </div>
                  `
                      : ""
                  }
                </div>
                
                <div class="footer">
                  <p>Thank you for your purchase!</p>
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
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Receipt Preview</CardTitle>
            </CardHeader>
            <div className="px-6 py-4 space-y-4">
              {/* Receipt Content */}
              <div className="border-b border-border pb-4 space-y-2">
                <div className="text-center space-y-1">
                  <p className="font-bold text-lg">RECEIPT</p>
                  <p className="text-xs text-muted-foreground">POS System</p>
                </div>
              </div>

              {/* Receipt ID display */}
              <div className="bg-[var(--brand-pink-300)] px-4 py-3 rounded border border-[var(--brand-pink-300)]">
                <p className="text-xs text-muted-foreground font-semibold">Receipt Number</p>
                <p className="text-lg font-mono font-bold text-[var(--brand-pink-600)]">ID will be generated</p>
              </div>

              {/* Customer Info */}
              <div className="space-y-1 text-sm border-b border-border pb-4">
                <p>
                  <span className="font-semibold">Customer:</span> {manualCustomerName || "Walk-in"}
                </p>
                {manualCustomerPhone && (
                  <p>
                    <span className="font-semibold">Phone:</span> {manualCustomerPhone}
                  </p>
                )}
                <p>
                  <span className="font-semibold">Cashier:</span> Benedicta Sarpong
                </p>
                <p>
                  <span className="font-semibold">Date:</span> {new Date().toLocaleDateString()}
                </p>
              </div>

              {/* Items */}
              <div className="space-y-2 border-b border-border pb-4">
                <p className="font-semibold text-sm">Items:</p>
                {cart.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span>
                      {item.productName} x{item.quantity}
                    </span>
                    <span className="font-medium">GHS {item.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 border-b border-border pb-4 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>GHS {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-base text-primary">
                  <span>TOTAL:</span>
                  <span>GHS {total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="space-y-1 text-sm border-b border-border pb-4">
                <p>
                  <span className="font-semibold">Payment Method:</span>{" "}
                  {paymentMethod === "cash" ? "Cash" : "Mobile Money"}
                </p>
                {paymentMethod === "cash" && (
                  <>
                    <p>
                      <span className="font-semibold">Amount Received:</span> GHS {amountReceived.toFixed(2)}
                    </p>
                    {change > 0 && (
                      <p className="text-green-700 font-semibold">
                        <span>Change:</span> GHS {change.toFixed(2)}
                      </p>
                    )}
                  </>
                )}
                {paymentMethod === "mobileMoney" && (
                  <p>
                    <span className="font-semibold">Reference:</span> {paymentReference}
                  </p>
                )}
              </div>

              {/* Thank You */}
              <div className="text-center text-sm text-muted-foreground">
                <p>Thank you for your purchase!</p>
              </div>
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
