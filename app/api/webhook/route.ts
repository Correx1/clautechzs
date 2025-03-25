import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Verify webhook authenticity
  const verifHash = request.headers.get('verif-hash');
  const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;

  if (verifHash !== secretHash) {
    console.error('Invalid webhook hash');
    return NextResponse.json({ error: 'Invalid hash' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = body.data;

    // Robust status checking for successful transactions
    const validStatuses = ['successful', 'completed'];
    const isSuccessfulTransaction = validStatuses.some(
      status => data.status.toLowerCase() === status
    );

    if (!isSuccessfulTransaction) {
      console.warn(`Skipping webhook for non-successful status: ${data.status}`);
      return NextResponse.json({ message: 'Payment not completed' }, { status: 200 });
    }

    // Construct order data from webhook payload  
    const orderData = {  
      personName: data.customer.name,  
      email: data.customer.email,  
      phone: data.customer.phoneNumber,  
      location: data.meta?.location || '',
      size: data.meta?.size || '',
      clothSize: data.meta?.clothSize || '', 
      items: data.meta?.items || '', // Stringified items from checkout  
      totalPrice: data.amount,  
      orderNumber: data.txRef,  
      transactionId: data.id,  
      paymentStatus: data.status,  
    };  

    // Send to Google Sheets  
    const scriptURL = process.env.NEXT_PUBLIC_GOOGLE_SHEET_SCRIPT_URL || process.env.GOOGLE_SHEET_SCRIPT_URL;  
    if (!scriptURL) {  
      throw new Error('Google Sheets script URL not configured');  
    }  

    const response = await fetch(scriptURL, {  
      method: 'POST',  
      headers: {  
        'Content-Type': 'application/json',  
      },  
      body: JSON.stringify(orderData),  
    });  

    if (!response.ok) {  
      throw new Error('Failed to send data to Google Sheets');  
    }  

    console.log('Webhook processed successfully:', data.txRef);  
    return NextResponse.json({ message: 'Order processed' });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Failed to process order' }, { status: 500 });
  }
}