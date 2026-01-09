"use client"

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
}

export default function ReceiptDisplay({
  receiptId,
  storeName = "Mother Care & Kids",
  items,
  subtotal,
  tax = 0,
  total,
  amountReceived,
  change,
  paymentMethod,
  dateTime,
  cashierName = "Cashier",
}: ReceiptProps) {
  const receiptDate = dateTime || new Date().toLocaleString()

  return (
    <div className="w-full flex justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none">
        {/* Header with Accent Line */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8 border-b-4 border-blue-500">
          <div className="text-center">
            <div className="inline-block mb-3 p-3 bg-blue-500 rounded-full">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-1">{storeName}</h1>
            <p className="text-xs text-slate-300 uppercase tracking-widest font-semibold">Official Receipt</p>
          </div>
        </div>

        {/* Receipt ID - Prominent */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b-2 border-blue-100">
          <div className="text-center">
            <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider mb-2">Receipt Number</p>
            <p className="text-3xl font-black font-mono text-blue-600 tracking-tight">{receiptId}</p>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="px-8 py-5 border-b border-slate-200 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-600 font-medium">Date & Time</span>
            <span className="text-sm font-mono text-slate-800">{receiptDate}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-600 font-medium">Cashier</span>
            <span className="text-sm font-medium text-slate-800">{cashierName}</span>
          </div>
        </div>

        {/* Items */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-semibold text-slate-900 flex-1">{item.name}</span>
                  <span className="text-sm font-mono font-bold text-slate-900 ml-3">GHS {item.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>
                    {item.quantity} × GHS {item.price.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="px-8 py-3">
          <div className="border-t-2 border-dashed border-slate-300"></div>
        </div>

        {/* Totals Section */}
        <div className="px-8 py-5 space-y-3 bg-slate-50 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 font-medium">Subtotal</span>
            <span className="text-sm font-mono font-semibold text-slate-800">GHS {subtotal.toFixed(2)}</span>
          </div>

          {tax > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 font-medium">Tax</span>
              <span className="text-sm font-mono font-semibold text-slate-800">GHS {tax.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-3 border-t border-slate-300">
            <span className="text-base font-bold text-slate-900">Total</span>
            <span className="text-2xl font-black font-mono text-slate-900">GHS {total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Details */}
        <div className="px-8 py-5 space-y-4 border-b border-slate-200">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide mb-2">Amount Paid</p>
              <p className="text-lg font-black font-mono text-blue-600">GHS {amountReceived.toFixed(2)}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide mb-2">Change</p>
              <p className="text-lg font-black font-mono text-green-600">GHS {change.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-4 text-white">
            <p className="text-xs font-semibold uppercase tracking-wide mb-2 opacity-80">Payment Method</p>
            <p className="text-base font-bold capitalize">{paymentMethod}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 text-center space-y-2 bg-white">
          <p className="text-sm font-bold text-slate-900">✓ Thank You!</p>
          <p className="text-xs text-slate-500">Keep this receipt for your records</p>
          <p className="text-xs text-slate-400 pt-2 border-t border-slate-200 mt-3">Valid proof of purchase</p>
        </div>
      </div>
    </div>
  )
}
