// app/api/webhooks/flutterwave/route.ts

import { NextResponse } from 'next/server';
import crypto from 'crypto';

// This function verifies the webhook signature from Flutterwave
function verifyFlutterwaveSignature(
  signature: string | null,
  requestBody: any,
  secretHash: string
): boolean {
  if (!signature) return false;

  // Create a hash using the request body and your secret hash
  const hash = crypto
    .createHmac('sha256', secretHash)
    .update(JSON.stringify(requestBody))
    .digest('hex');

  // Compare the created hash with the signature from the request
  return hash === signature;
}

// Process the order data from the webhook
async function processOrder(payload: any) {
  try {
    // Extract customer and order details from the payload
    const { 
      customer, 
      tx_ref: orderNumber,
      amount, 
      status, 
      id: transactionId,
      meta
    } = payload;

    // Only process successful payments
    if (status !== 'successful') {
      console.log('Payment not successful:', status);
      return false;
    }

    // Format order data for Google Sheets
    const orderData = {
      personName: customer.name,
      email: customer.email,
      phone: customer.phone_number,
      location: meta.location,
      size: meta.size || "",
      clothSize: meta.clothSize || "",
      items: meta.items,
      totalPrice: amount,
      orderNumber,
      transactionId,
      paymentStatus: status
    };

    // Send to Google Sheets
    const scriptURL = process.env.NEXT_PUBLIC_GOOGLE_SHEET_SCRIPT_URL || "";
    
    await fetch(scriptURL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    // Here you would also handle Firebase if uncommented:
    /*
    const DeliveryData = {
      Name: orderData.personName,
      Email: orderData.email,
      Phone: orderData.phone,
      location: orderData.location,
      Shoe_Size: orderData.size,
      Cloth_Size: orderData.clothSize,
      createdAt: serverTimestamp(),
      items: JSON.parse(orderData.items),
      totalPrice: orderData.totalPrice,
      orderNumber: orderData.orderNumber,
      transactionId,
      paymentStatus: status
    };
    await addDoc(collection(db, "Orders"), { ...DeliveryData });
    */

    console.log('Order processed successfully via webhook');
    return true;
  } catch (error) {
    console.error('Error processing order via webhook:', error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    // Get the request body
    const payload = await request.json();
    
    // Get the Flutterwave signature from the request headers
    const signature = request.headers.get('verif-hash');
    
    // Your secret hash from Flutterwave dashboard
    const secretHash = process.env.FLUTTERWAVE_SECRET_HASH || '';

    // Validate the webhook signature
    if (!verifyFlutterwaveSignature(signature, payload, secretHash)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    // Process the order
    await processOrder(payload);

    // Return a successful response
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}