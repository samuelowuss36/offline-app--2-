"use client"

import { useEffect, useState } from "react"
import Logo from "@/components/ui/logo"
import { getLogoPath } from "@/lib/navigation"
import { CheckCircle } from "lucide-react"

interface ReceiptItem {
  name: string
  quantity: number
  price: number
  total: number
}

interface ReceiptProps {
  receiptId: string
  storeName?: string
  items: ReceiptItem[]
  subtotal: number
  tax?: number
  total: number
  amountReceived: number
  change: number
  paymentMethod: string
  dateTime?: string
  cashierName?: string
  customerName?: string
  customerPhone?: string
}

export default function ReceiptDisplay({
  receiptId,
  storeName = "Owoabenes Mothercare & Kids Boutique",
  items,
  subtotal,
  total,
  amountReceived,
  change,
  paymentMethod,
  dateTime,
  cashierName = "Benedicta Sarpong",
  customerName,
  customerPhone,
}: ReceiptProps) {
  console.log("[DEBUG] ReceiptDisplay props - amountReceived:", amountReceived, "change:", change, "paymentMethod:", paymentMethod)
  const receiptDate = dateTime || new Date().toLocaleString()
  const [logoSrc, setLogoSrc] = useState("./logo.jpeg")

  useEffect(() => {
    setLogoSrc(getLogoPath())
  }, [])

  return (
    <div className="w-full flex justify-center p-2 print:p-0">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none print:rounded-none print:max-w-[80mm] print:w-[80mm] print:mx-auto print:p-2 print:rounded-none print:text-black">
        {/* Header with Accent Line */}
        <div className="bg-gradient-to-r from-[var(--brand-pink)] to-[var(--brand-pink-600)] text-white p-4 border-b-2 border-[var(--brand-pink)] print:bg-white print:text-black print:border-b-0 print:p-3">
          <div className="text-center">
            <div className="inline-block mb-2 p-1 bg-white rounded-full shadow-lg print:mb-2 print:p-0 print:bg-transparent print:rounded-none print:shadow-none">
              <img src={logoSrc} alt="Logo" className="w-10 h-10 object-contain print:w-12 print:h-12" />
            </div>
            <h1 className="text-lg font-extrabold tracking-tight mb-0.5 brand-font text-primary print:text-lg print:font-bold print:text-black">{storeName}</h1>
            <p className="text-[10px] text-slate-300 uppercase tracking-widest font-semibold print:text-xs print:text-black">Official Receipt</p>
          </div>
        </div>

        {/* Receipt ID - Prominent */}
        <div className="bg-gradient-to-r from-[var(--brand-pink-300)] to-white px-4 py-3 border-b border-[var(--brand-pink-300)] print:px-4 print:py-3 print:bg-white print:border-b-0">
          <div className="text-center">
            <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider mb-1 print:text-xs print:text-black">Receipt Number</p>
            <p className="text-xl font-black font-mono text-[var(--brand-pink-600)] tracking-tight print:text-xl print:text-black">{receiptId}</p>
          </div>
        </div>

        {/* Customer Details */}
        {(customerName || customerPhone) && (
          <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 print:px-4 print:py-2 print:bg-white print:border-b print:border-dashed print:border-slate-300">
            <p className="text-[10px] text-amber-700 font-semibold uppercase tracking-wider mb-1 print:text-xs print:text-black">Customer</p>
            <div className="space-y-1">
              {customerName && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-amber-700 font-medium print:text-xs print:text-black">Name:</span>
                  <p className="text-sm font-bold text-amber-900 print:text-sm print:text-black">{customerName}</p>
                </div>
              )}
              {customerPhone && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-amber-700 font-medium print:text-xs print:text-black">Phone:</span>
                  <p className="text-xs font-mono text-amber-800 print:text-xs print:text-black">{customerPhone}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Transaction Details */}
        <div className="px-4 py-2 border-b border-slate-200 print:px-4 print:py-2 print:space-y-1">
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 font-medium print:text-xs print:text-black">Date:</span>
              <span className="font-medium text-slate-800 print:text-xs print:text-black">{receiptDate}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 font-medium print:text-xs print:text-black">Cashier:</span>
              <span className="font-medium text-slate-800 print:text-xs print:text-black">{cashierName}</span>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="px-4 py-3 border-b border-slate-200 print:px-4 print:py-3">
          {/* Items Header */}
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2 print:text-[10px] print:text-slate-700">
            <span className="flex-1">Item</span>
            <span className="w-12 text-center">Qty</span>
            <span className="w-16 text-right">Price</span>
            <span className="w-16 text-right ml-2">Total</span>
          </div>
          <div className="space-y-2 print:space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-xs print:text-xs">
                <span className="flex-1 font-semibold text-slate-900 print:text-slate-900">{item.name}</span>
                <span className="w-12 text-center font-mono text-slate-700 print:text-slate-700">{item.quantity}</span>
                <span className="w-16 text-right font-mono text-slate-700 print:text-slate-700">GHS {item.price.toFixed(2)}</span>
                <span className="w-16 text-right font-mono font-bold text-slate-900 ml-2 print:text-slate-900">GHS {item.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals Section */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 print:px-4 print:py-3 print:bg-white">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-slate-600 print:text-xs">Subtotal</span>
              <span className="text-sm font-mono text-slate-800 print:text-sm">GHS {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-300">
              <span className="text-sm font-bold text-slate-900 print:text-sm">Total</span>
              <span className="text-xl font-black font-mono text-slate-900 print:text-xl">GHS {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="px-4 py-3 border-b border-slate-200 print:px-4 print:py-3">
          <div className="grid grid-cols-3 gap-2 print:grid-cols-1">
            <div className="bg-[var(--brand-pink-300)] rounded-lg p-2 border border-[var(--brand-pink-300)] print:bg-transparent print:border-none print:p-2">
              <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-wide mb-0.5 print:text-xs print:text-black">{paymentMethod === "Mobile Money" ? "Sent" : "Paid"}</p>
              <p className="text-sm font-black font-mono text-[var(--brand-pink-600)] print:text-sm">GHS {amountReceived.toFixed(2)}</p>
            </div>
            {change > 0 && (
              <div className="bg-green-50 rounded-lg p-2 border border-green-200 print:bg-transparent print:border-none print:p-2">
                <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-wide mb-0.5 print:text-xs print:text-black">Change</p>
                <p className="text-sm font-black font-mono text-green-600 print:text-sm">GHS {change.toFixed(2)}</p>
              </div>
            )}
            <div className={`bg-slate-800 rounded-lg p-2 text-white print:bg-transparent print:text-black print:p-2 ${change > 0 ? "" : "col-span-2"}`}>
              <p className="text-[10px] font-semibold uppercase tracking-wide mb-0.5 opacity-80 print:text-xs">Method</p>
              <p className="text-sm font-bold capitalize print:text-sm">{paymentMethod}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 text-center bg-white print:px-4 print:py-3 print:space-y-1 print:bg-white">
          <p className="text-xs font-bold text-slate-900 brand-font print:text-sm">✓ Thank You for Your Purchase!</p>
          <p className="text-[10px] text-slate-400 print:text-xs">Visit Us Again...!</p>
          <p className="text-[10px] font-bold text-slate-400 print:text-xs">Tel: 0548 048 520/ 0549 241 991</p>
        </div>
      </div>
    </div>
  )
}
