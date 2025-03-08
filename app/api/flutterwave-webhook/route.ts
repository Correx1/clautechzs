// app/api/webhook/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // 1. Verify signature
  const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
  const signature = request.headers.get('verif-hash');
  
  if (!secretHash || signature !== secretHash) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Process payload
  try {
    const payload = await request.json();
    console.log('Webhook payload:', payload);

    if (payload.event === 'charge.completed') {
      // 3. Verify transaction
      const verifyRes = await fetch(
        `https://api.flutterwave.com/v3/transactions/${payload.data.id}/verify`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_FLUTTER}`,
          },
        }
      );
      
      const verification = await verifyRes.json();
      console.log('Verification response:', verification);

      if (verification.status === 'success' && verification.data.status === 'successful') {
        // 4. Extract order data
        const meta = verification.data.meta;
        const orderData = {
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
          paymentStatus: 'successful',
          date: new Date().toISOString()
        };

        // 5. Submit to Google Sheets
        console.log('Submitting to Google Sheets:', orderData);
        const sheetResponse = await fetch(process.env.NEXT_PUBLIC_GOOGLE_SHEET_SCRIPT_URL!, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        });

        console.log('Google Sheets response status:', sheetResponse.status);
        return NextResponse.json({ success: true });
      }
    }
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}