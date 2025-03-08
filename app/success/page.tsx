'use client'

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useShoppingCart } from "use-shopping-cart";
import Link from 'next/link';
// Commenting out firebase imports
// import { db } from "@/app/firebase";
// import { addDoc, collection, serverTimestamp } from "firebase/firestore";

const SuccessPage: React.FC = () => {
  const { clearCart } = useShoppingCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const tx_ref = searchParams.get('tx_ref');
  const transaction_id = searchParams.get('transaction_id');
  const [processingState, setProcessingState] = useState<'pending' | 'success' | 'failed'>('pending');

  useEffect(() => {
    // This effect now focuses on local cleanup rather than order processing
    // since the webhook handles the actual order processing
    
    // Only proceed if there's a successful status
    if (status !== 'successful') {
      setProcessingState('failed');
      return;
    }

    try {
      // Clear cart as payment was successful
      clearCart();
      
      // Cleanup stored data (optional, but good practice)
      localStorage.removeItem('pendingOrderData');
      
      // Set success state
      setProcessingState('success');
      
      // As a fallback, we still try to submit the order data in case the webhook failed
      // This creates a race condition, but Flutterwave should deduplicate transactions
      const submitOrderAsFallback = async () => {
        try {
          // Get stored order data
          const storedDataString = localStorage.getItem('pendingOrderData');
          if (!storedDataString) {
            console.log("No pending order data found for fallback processing");
            return;
          }

          const orderData = JSON.parse(storedDataString);
          
          // Add transaction details
          const completeOrderData = {
            ...orderData,
            transactionId: transaction_id || "",
            paymentStatus: status
          };

          // Check if this transaction has already been processed
          const processedTxs = JSON.parse(localStorage.getItem('processedTransactions') || '{}');
          if (transaction_id && processedTxs[transaction_id]) {
            console.log("Transaction already processed in fallback:", transaction_id);
            return;
          }

          // Mark as processed
          if (transaction_id) {
            processedTxs[transaction_id] = true;
            localStorage.setItem('processedTransactions', JSON.stringify(processedTxs));
          }

          // Send to Google Sheets as fallback
          const scriptURL = process.env.NEXT_PUBLIC_GOOGLE_SHEET_SCRIPT_URL || "";
          await fetch(scriptURL, {
            method: "POST",
            mode: "no-cors",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(completeOrderData),
          });

          // Firebase would go here if uncommented
          /*
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
            transactionId: transaction_id || "",
            paymentStatus: status
          };
          await addDoc(collection(db, "Orders"), { ...DeliveryData });
          */

          console.log("Fallback order processing completed");
        } catch (error) {
          console.error("Error in fallback processing:", error);
          // This is just a fallback, so we don't change the UI state on failure
        }
      };

      // Execute the fallback after a delay to give the webhook time to process
      setTimeout(submitOrderAsFallback, 5000);
      
    } catch (error) {
      console.error("Error in success page:", error);
      // We still show success to the user if payment was successful
      // The webhook should have handled the order processing
      setProcessingState('success');
    }
  }, [status, tx_ref, transaction_id, clearCart]);

  // If payment failed, show failure page
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

  // For successful payments
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
        
        {processingState === 'pending' && (
          <p className="text-sm text-yellow-600 mb-2">Confirming your order...</p>
        )}
        {processingState === 'success' && (
          <p className="text-sm text-green-600 mb-2">Order confirmed! We are processing your order now.</p>
        )}
        {processingState === 'failed' && (
          <p className="text-sm text-red-600 mb-2">There was an issue confirming your order. Please contact support.</p>
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