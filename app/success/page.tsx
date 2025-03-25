'use client'

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useShoppingCart } from "use-shopping-cart";
import Link from 'next/link';

const SuccessPage: React.FC = () => {
  const { clearCart } = useShoppingCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Normalize status to handle both 'successful' and 'completed'
  const rawStatus = searchParams.get('status') || '';
  const status = ['successful', 'completed'].find(s => rawStatus.toLowerCase() === s) ? 'successful' : rawStatus;
  
  const tx_ref = searchParams.get('tx_ref');
  const transaction_id = searchParams.get('transaction_id');
  const [processingState, setProcessingState] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const processPayment = async () => {
      // Check if status is successfully normalized
      const successStatuses = ['successful', 'completed'];
      if (!successStatuses.includes(status.toLowerCase())) {
        setProcessingState('failed');
        setErrorMessage('Payment was not successful. Please contact support.');
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
          setErrorMessage('No order data found. Please contact support.');
          return;  
        }  

        const orderData = JSON.parse(storedDataString);  

        const scriptURL = process.env.NEXT_PUBLIC_GOOGLE_SHEET_SCRIPT_URL || process.env.GOOGLE_SHEET_SCRIPT_URL || "";  
        const response = await fetch(scriptURL, {  
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

        // Additional error handling for response
        if (response.type === 'opaque') {
          // no-cors mode doesn't allow reading the response
          clearCart();  
          localStorage.removeItem('pendingOrderData');  
          setProcessingState('completed');  
          console.log("Order processing completed successfully");  
        } else if (!response.ok) {
          throw new Error('Failed to send data to Google Sheets');
        }

        clearCart();  
        localStorage.removeItem('pendingOrderData');  
          
        setProcessingState('completed');  
        console.log("Order processing completed successfully");  
      } catch (error) {  
        console.error("Error processing order:", error);  
        setProcessingState('failed');
        setErrorMessage('An error occurred while processing your order. Please contact support.');
          
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

  // Normalize the rendering logic to handle both 'successful' and 'completed'
  const isSuccessful = ['successful', 'completed'].includes(status.toLowerCase());

  if (!isSuccessful) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="flex items-center justify-center mb-4">
          <XCircle className="w-8 h-8 text-red-500 mr-2" />
          <h1 className="text-xl font-bold">Payment Failed</h1>
        </div>
        <div className="bg-white p-6 rounded shadow-md">
          <p className="mb-4 text-center">{errorMessage || 'Failed to process your order. Please contact support with your transaction ID.'}</p>
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
        <h1 className="text-xl font-bold mb-4">Payment Status: Successful</h1>
        <p className="mb-2 text-xl font-bold">Order NO: {tx_ref}</p>
        <p className="mb-2 text-xl font-bold">Transaction ID: {transaction_id}</p>

        {processingState === 'processing' && (  
          <p className="text-sm text-yellow-600 mb-2">Processing your order...</p>  
        )}  
        {processingState === 'completed' && (  
          <p className="text-sm text-green-600 mb-2">Order processed successfully!</p>  
        )}  
        {processingState === 'failed' && (  
          <p className="text-sm text-red-600 mb-2">{errorMessage}</p>  
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