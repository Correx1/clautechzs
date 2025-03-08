// /app/api/webhook/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Retrieve the verification hash from the request headers
    const flutterwaveHash = request.headers.get('verif-hash');
    const secretHash = process.env.FLUTTERWAVE_SECRET_HASH; // Set this in your .env.local

    if (!flutterwaveHash || flutterwaveHash !== secretHash) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ message: 'Unauthorized webhook call' }, { status: 401 });
    }

    // Parse the webhook payload from Flutterwave
    const body = await request.json();
    console.log("Received webhook:", body);

    // Verify that the payment was successful.
    if (body.status !== 'successful') {
      return NextResponse.json({ message: 'Payment not successful' }, { status: 400 });
    }

    // Extract meta data (passed from the client during payment initiation)
    const meta = body.meta || {};
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
      transactionId: body.transaction_id || "",
      paymentStatus: body.status,
    };

    // Submit order to Google Sheets
    const scriptURL = process.env.NEXT_PUBLIC_GOOGLE_SHEET_SCRIPT_URL ||process.env.GOOGLE_SHEET_SCRIPT_URL;
    if (!scriptURL) {
      console.error("Google Sheets script URL not defined");
      return NextResponse.json({ message: 'Google Sheets URL not configured' }, { status: 500 });
    }

    await fetch(scriptURL, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData)
    });

    /* 
    // Firebase code (completely commented out)
    // import { db } from '@/app/firebase';
    // import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
    // const DeliveryData = {
    //   Name: orderData.personName,
    //   Email: orderData.email,
    //   Phone: orderData.phone,
    //   location: orderData.location,
    //   Shoe_Size: orderData.size || "",
    //   Cloth_Size: orderData.clothSize || "",
    //   createdAt: serverTimestamp(),
    //   items: JSON.parse(orderData.items),
    //   totalPrice: orderData.totalPrice,
    //   orderNumber: orderData.orderNumber,
    //   transactionId: orderData.transactionId,
    //   paymentStatus: orderData.paymentStatus
    // };
    // await addDoc(collection(db, "Orders"), { ...DeliveryData });
    */

    return NextResponse.json({ message: 'Order processed successfully' }, { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
