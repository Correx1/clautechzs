// app/api/flutterwave-webhook/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  // Verify that the request method is POST and check the verif-hash header.
  const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
  const signature = req.headers.get('verif-hash');
  if (!signature || signature !== secretHash) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Parse the JSON payload from Flutterwave
    const payload = await req.json();
    console.log('Received webhook payload:', payload);

    // Process only if this is a successful charge event
    if (payload.event === 'charge.completed' && payload.data.status === 'successful') {
      const orderData = {
        personName: payload.data.customer.name,
        email: payload.data.customer.email,
        phone: payload.data.customer.phone_number,
        location: payload.data.meta.location,
        size: payload.data.meta.size,
        clothSize: payload.data.meta.clothSize,
        items: payload.data.meta.items,
        totalPrice: payload.data.amount,
        orderNumber: payload.data.tx_ref,
        transactionId: payload.data.id,
        paymentStatus: payload.data.status,
      };

      // Send order data to Google Sheets
      const scriptURL = process.env.NEXT_PUBLIC_GOOGLE_SHEET_SCRIPT_URL || "";
      if (scriptURL) {
        await fetch(scriptURL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        });
      }

      // Optionally, add order to Firebase (code commented out)
      /*
      import { db } from '@/app/firebase';
      import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

      const DeliveryData = {
        Name: orderData.personName,
        Email: orderData.email,
        Phone: orderData.phone,
        location: orderData.location,
        Shoe_Size: orderData.size || "",
        Cloth_Size: orderData.clothSize || "",
        createdAt: serverTimestamp(),
        items: JSON.parse(orderData.items),
        totalPrice: orderData.totalPrice,
        orderNumber: orderData.orderNumber,
        transactionId: orderData.transactionId || "",
        paymentStatus: orderData.paymentStatus
      };

      await addDoc(collection(db, "Orders"), { ...DeliveryData });
      */

      console.log("Order processed successfully:", orderData.orderNumber);
      return NextResponse.json({ message: 'Order processed successfully' }, { status: 200 });
    } else {
      console.log("Payment not successful or unhandled event type.");
      return NextResponse.json({ message: 'Event ignored' }, { status: 200 });
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
