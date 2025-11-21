import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request
    if (!body.type || !body.side || !body.price || !body.size || !body.tif) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 300))

    // Return success response
    return NextResponse.json({
      success: true,
      orderId: `order_${Date.now()}`,
      message: "Order placed successfully",
      order: {
        type: body.type,
        side: body.side,
        price: body.price,
        size: body.size,
        tif: body.tif,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", message: String(error) },
      { status: 500 }
    )
  }
}

