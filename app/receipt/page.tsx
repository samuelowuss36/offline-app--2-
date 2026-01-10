"use client"

import ReceiptDisplay from "@/components/receipt/receipt-display"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

export default function ReceiptPage() {
  const sampleReceipt = {
    receiptId: "RCP-2025-001847",
    storeName: "Mother Care & Kids",
    items: [
      { name: "Baby Girl Dress", quantity: 2, price: 45.99, total: 91.98 },
      { name: "Kids T-Shirt Pack", quantity: 1, price: 32.5, total: 32.5 },
      { name: "Baby Socks Set", quantity: 3, price: 12.99, total: 38.97 },
      { name: "Stroller Accessories", quantity: 1, price: 28.75, total: 28.75 },
    ],
    subtotal: 192.2,
    tax: 15.38,
    total: 207.58,
    amountReceived: 250.0,
    change: 42.42,
    paymentMethod: "cash",
    dateTime: new Date().toLocaleString(),
    cashierName: "Sarah",
  }

  const handlePrint = () => {
    setTimeout(() => {
      window.print()
    }, 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="print:hidden text-center">
          <h1 className="text-4xl font-black text-white mb-2">Receipt</h1>
          <p className="text-slate-400">Professional & Modern Design</p>
        </div>

        {/* Print Button */}
        <div className="flex justify-center print:hidden">
          <Button
            onClick={handlePrint}
            className="bg-gradient-to-r from-[var(--brand-pink)] to-[var(--brand-pink-600)] hover:from-[var(--brand-pink-600)] hover:to-[var(--brand-pink-600)] text-white font-bold rounded-xl px-8 py-3 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            <Printer className="w-5 h-5" />
            Print Receipt
          </Button>
        </div>

        {/* Receipt */}
        <ReceiptDisplay {...sampleReceipt} />

        {/* Info */}
        <div className="text-center print:hidden text-sm text-slate-400">
          Click "Print Receipt" to open the browser print preview window
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @page { size: 80mm auto; margin: 4mm; }
        @media print {
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print\:hidden {
            display: none !important;
          }
          /* ensure receipt fits POS-80 width */
          #receipt-container, #print-area {
            width: 80mm !important;
            max-width: 80mm !important;
            margin: 0 auto !important;
          }
        }
      `}</style>
    </div>
  )
}
