import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get('order_id');
  
  if (!orderId) {
    return NextResponse.json(
      { error: 'Missing order ID' },
      { status: 400 }
    );
  }

  // In a real implementation, check your database here
  // For demo, check localStorage (not recommended for production)
  try {
    const pendingOrders = JSON.parse(process.env.PENDING_ORDERS || '{}');
    return NextResponse.json({
      verified: !pendingOrders[orderId]
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}