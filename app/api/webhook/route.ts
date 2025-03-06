import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  const secretHash = process.env.FLW_WEBHOOK_HASH;
  const signature = req.headers.get('verif-hash');
  
  if (!signature || signature !== secretHash) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await req.json();
    console.log('Webhook payload:', payload);

    // Verify transaction
    const verifyUrl = `https://api.flutterwave.com/v3/transactions/${payload.data.id}/verify`;
    const response = await axios.get(verifyUrl, {
      headers: {
        Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
      },
    });

    const transaction = response.data.data;
    console.log('Verified transaction:', transaction);

    if (transaction.status === 'successful' && transaction.amount === payload.data.amount) {
      const meta = transaction.meta;
      
      // Prepare order data
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

      // Send to Google Sheets
      const scriptURL = process.env.NEXT_PUBLIC_GOOGLE_SHEET_SCRIPT_URL;
      if (scriptURL) {
        await fetch(scriptURL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        });
      }

      // Remove from pending orders
      const pendingOrders = JSON.parse(localStorage?.getItem('pendingOrders') || '{}');
      delete pendingOrders[meta.orderNumber];
      localStorage?.setItem('pendingOrders', JSON.stringify(pendingOrders));

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ message: 'Verification failed' }, { status: 400 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}