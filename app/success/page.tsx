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
  
  // Use a ref to track if we've processed this transaction
  const [isProcessed, setIsProcessed] = useState<boolean>(false);
  const [processingState, setProcessingState] = useState<'pending' | 'success' | 'failed'>(
    status === 'successful' ? 'pending' : 'failed'
  );

  // Run this effect only once
  useEffect(() => {
    // Skip if already processed or not successful
    if (isProcessed || status !== 'successful') {
      return;
    }

    const processSuccessfulPayment = async () => {
      try {
        // Mark as processed right away to prevent re-runs
        setIsProcessed(true);
        
        // Clear cart
        clearCart();
        
        // Cleanup stored data
        localStorage.removeItem('pendingOrderData');
        
        // Update state to success
        setProcessingState('success');
        
        // Fallback order processing after delay
        setTimeout(async () => {
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
            const scriptURL = process.env.GOOGLE_SHEET_SCRIPT_URL || 
            process.env.NEXT_PUBLIC_GOOGLE_SHEET_SCRIPT_URL || "";
            await fetch(scriptURL, {
              method: "POST",
              mode: "no-cors",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(completeOrderData),
            });
    
            console.log("Fallback order processing completed");
          } catch (error) {
            console.error("Error in fallback processing:", error);
          }
        }, 5000);
      } catch (error) {
        console.error("Error processing payment:", error);
        setProcessingState('success'); // Still show success to user
      }
    };

    processSuccessfulPayment();
  }, [status, transaction_id, clearCart, isProcessed]);

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