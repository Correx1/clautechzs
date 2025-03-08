'use client'

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useShoppingCart } from "use-shopping-cart";
import Link from 'next/link';
// Firebase imports commented out
// import { db } from "@/app/firebase";
// import { addDoc, collection, serverTimestamp } from "firebase/firestore";

const SuccessPage: React.FC = () => {
  const { clearCart } = useShoppingCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const tx_ref = searchParams.get('tx_ref');
  const transaction_id = searchParams.get('transaction_id');
  const [processingState, setProcessingState] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');

  useEffect(() => {
    const processPayment = async () => {
      if (status !== 'successful') {
        setProcessingState('failed');
        return;
      }

      const processedTransactions = localStorage.getItem('processedTransactions') || '{}';
      const processedTxs = JSON.parse(processedTransactions);
      
      if (transaction_id && processedTxs[transaction_id]) {
        console.log("Transaction already processed:", transaction_id);
        setProcessingState('completed');
        return;
      }

      setProcessingState('processing');

      try {
        if (transaction_id) {
          processedTxs[transaction_id] = true;
          localStorage.setItem('processedTransactions', JSON.stringify(processedTxs));
        }

        const storedDataString = localStorage.getItem('pendingOrderData');
        if (!storedDataString) {
          console.log("No pending order data found");
          setProcessingState('failed');
          return;
        }

        const orderData = JSON.parse(storedDataString);

        // Firebase code commented out
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
        //   transactionId: transaction_id || "",
        //   paymentStatus: status
        // };
        // await addDoc(collection(db, "Orders"), { ...DeliveryData });

        const scriptURL = process.env.NEXT_PUBLIC_GOOGLE_SHEET_SCRIPT_URL || process.env.GOOGLE_SHEET_SCRIPT_URL || "";
        await fetch(scriptURL, {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...orderData,
            transactionId: transaction_id || "",
            paymentStatus: status
          }),
        });

        clearCart();
        localStorage.removeItem('pendingOrderData');
        
        setProcessingState('completed');
        console.log("Order processing completed successfully");
      } catch (error) {
        console.error("Error processing order:", error);
        setProcessingState('failed');
        
        if (transaction_id) {
          delete processedTxs[transaction_id];
          localStorage.setItem('processedTransactions', JSON.stringify(processedTxs));
        }
      }
    };

    if (processingState === 'pending') {
      processPayment();
    }
  }, [status, tx_ref, transaction_id, clearCart, processingState]);

  if (status !== 'successful') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="flex items-center justify-center mb-4">
          <XCircle className="w-8 h-8 text-red-500 mr-2" />
          <h1 className="text-xl font-bold">Payment Failed</h1>
        </div>
        <div className="bg-white p-6 rounded shadow-md">
          <p className="mb-4 text-center">Failed to process your order. Please contact support with your transaction ID.</p>
          <p className="mb-2 text-gray-700">Transaction ID: {transaction_id || 'Not available'}</p>
          <div className="flex justify-center mt-4">
            <Button>
              <Link href="/">Return to Homepage</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="flex items-center justify-center mb-4">
        <CheckCircle className="w-8 h-8 text-green-500 mr-2" />
        <h1 className="text-xl font-bold">Thank You!</h1>
      </div>
      <div className="bg-white p-6 rounded shadow-md">
        <h1 className="text-xl font-bold mb-4">Payment Status: {status}</h1>
        <p className="mb-2 text-xl font-bold">Order NO: {tx_ref}</p>
        <p className="mb-2 text-xl font-bold">Transaction ID: {transaction_id}</p>
        
        {processingState === 'processing' && (
          <p className="text-sm text-yellow-600 mb-2">Processing your order...</p>
        )}
        {processingState === 'completed' && (
          <p className="text-sm text-green-600 mb-2">Order processed successfully!</p>
        )}
        {processingState === 'failed' && (
          <p className="text-sm text-red-600 mb-2">There was an issue processing your order. Please contact support.</p>
        )}
        
        <p className="text-sm text-gray-700 italic">Note: The Order NO. may be requested for during delivery.</p>
        <Button className="text-center items-center justify-center mt-2">
          <Link href="/">Return to Homepage</Link>
        </Button>
      </div>
    </div>
  );
}

export default SuccessPage;