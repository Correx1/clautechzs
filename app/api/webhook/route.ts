import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  // Ensure method is POST (this check is optional because this handler only runs for POST)
  if (request.method !== 'POST') {
    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
  }

  const secretHash = process.env.FLW_WEBHOOK_HASH;
  const signature = request.headers.get('verif-hash');
  
  if (!signature || signature !== secretHash) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // In the App Router, use await request.json() to parse the request body
  const payload = await request.json();
  
  try {
    // Verify transaction with Flutterwave
    const verifyUrl = `https://api.flutterwave.com/v3/transactions/${payload.data.id}/verify`;
    const response = await axios.get(verifyUrl, {
      headers: {
        Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
      },
    });
    const transaction = response.data.data;
    
    if (transaction.status === 'successful' && transaction.amount === payload.data.amount) {
      const meta = transaction.meta;
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
        transactionId: transaction.id,
        paymentStatus: transaction.status,
      };

      // Submit to Google Sheets
      const scriptURL = process.env.NEXT_PUBLIC_GOOGLE_SHEET_SCRIPT_URL || "";
      await fetch(scriptURL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      // Note: localStorage is not available on the server.
      // If you need to manage pending orders, consider using a server-side store.

      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ message: 'Transaction verification failed' }, { status: 400 });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
