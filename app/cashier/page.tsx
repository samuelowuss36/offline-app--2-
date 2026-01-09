import { Suspense } from "react"
import CashierClient from "./cashier-client"

export default function CashierPage() {
  return (
    <Suspense fallback={null}>
      <CashierClient />
    </Suspense>
  )
}
