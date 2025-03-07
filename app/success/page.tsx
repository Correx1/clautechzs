// app/success/page.tsx
'use client'
import React, { useEffect, useState, useRef } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useShoppingCart } from "use-shopping-cart";
import Link from 'next/link';

const SuccessPage: React.FC = () => {
  const { clearCart } = useShoppingCart();
  const [status, setStatus] = useState<string | null>(null);
  const [tx_ref, setTx_ref] = useState<string | null>(null);
  const [transaction_id, setTransaction_id] = useState<string | null>(null);
  const hasCleared = useRef(false); // Add ref to track clearing status

  useEffect(() => {
    // Only run once on component mount
    const params = new URLSearchParams(window.location.search);
    setStatus(params.get('status'));
    setTx_ref(params.get('tx_ref'));
    setTransaction_id(params.get('transaction_id'));

    // Clear cart only once
    if (!hasCleared.current) {
      clearCart();
      hasCleared.current = true;
    }
  }, [clearCart]); // Include clearCart in dependencies

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
            <Button asChild>
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
        <h1 className="text-xl font-bold mb-4">Payment Successful</h1>
        <p className="mb-2 text-xl font-bold">Order NO: {tx_ref}</p>
        <p className="text-sm text-gray-700 italic">
          Your order has been processed. Youll receive a confirmation email shortly.
        </p>
        <Button className="mt-4 w-full" asChild>
          <Link href="/">Return to Homepage</Link>
        </Button>
      </div>
    </div>
  );
}

export default SuccessPage;