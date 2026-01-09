import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Note: Database is initialized on client side in init-client.ts
    // The IndexedDB API is browser-only and cannot be accessed from server routes.
    // This route acknowledges the initialization request from the client.
    
    return NextResponse.json({ 
      message: "Initialization acknowledged (DB initialized client-side)" 
    })
  } catch (error) {
    console.error("[v0] Init error:", error)
    return NextResponse.json(
      { error: "Initialization failed" },
      { status: 500 }
    )
  }
}
