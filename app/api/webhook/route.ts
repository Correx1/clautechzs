import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const secretHash = process.env.FLW_WEBHOOK_HASH;
  const signature = req.headers['verif-hash'];
  
  if (!signature || signature !== secretHash) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const payload = req.body;
  
  try {
    // Verify transaction with Flutterwave
    const verifyUrl = `https://api.flutterwave.com/v3/transactions/${payload.data.id}/verify`;
    const response = await axios.get(verifyUrl, {
      headers: {
        Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
      },
    });

    const transaction = response.data.data;
    
    // Check if transaction was successful
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

      // Submit to Google Sheets
      const scriptURL = process.env.NEXT_PUBLIC_GOOGLE_SHEET_SCRIPT_URL || "";
      await fetch(scriptURL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      // Firebase submission (commented out)
      // const DeliveryData = { ...orderData, createdAt: serverTimestamp() };
      // await addDoc(collection(db, "Orders"), DeliveryData);

      // Remove from pending orders
      const pendingOrders = JSON.parse(meta._pendingOrders || '{}');
      delete pendingOrders[meta.orderNumber];
      localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));

      return res.status(200).json({ success: true });
    }
    
    return res.status(400).json({ message: 'Transaction verification failed' });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}