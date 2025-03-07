// app/api/webhook/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // 1. Verify webhook signature
  const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
  const signature = request.headers.get('verif-hash');
  
  if (!secretHash || !signature || signature !== secretHash) {
    return new Response('Unauthorized', { status: 401 });
  }

  // 2. Process payload
  const payload = await request.json();
  
  try {
    if (payload.event === 'charge.completed') {
      const transactionId = payload.data.id;
      
      // 3. Verify transaction with Flutterwave
      const verifyRes = await fetch(
        `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_FLUTTER}`,
          },
        }
      );
      
      const verification = await verifyRes.json();
      
      if (verification.status === 'success' && verification.data.status === 'successful') {
        // 4. Extract order data from meta
        const meta = verification.data.meta;
        
        // 5. Submit to Google Sheets
        await fetch(process.env.NEXT_PUBLIC_GOOGLE_SHEET_SCRIPT_URL!, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            personName: meta.personName,
            email: meta.email,
            phone: meta.phone,
            location: meta.location,
            size: meta.size,
            clothSize: meta.clothSize,
            items: meta.items,
            totalPrice: meta.totalPrice,
            orderNumber: meta.orderNumber,
            transactionId: verification.data.id,
            paymentStatus: 'successful'
          }),
        });
      }
    }
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }

  return NextResponse.json({ status: 'received' });
}