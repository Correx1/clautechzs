"use client";

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const SuccessPage: React.FC = () => {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const tx_ref = searchParams.get('tx_ref');
  const transaction_id = searchParams.get('transaction_id');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      {status === 'successful' ? (
        <>
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-500 mr-2" />
            <h1 className="text-xl font-bold">Thank You!</h1>
          </div>
          <div className="bg-white p-6 rounded shadow-md text-center">
            <h1 className="text-xl font-bold mb-4">Payment Successful</h1>
            <p className="mb-2 text-lg font-bold">Order No: {tx_ref}</p>
            <p className="mb-2 text-lg font-bold">Transaction ID: {transaction_id}</p>
            <p className="text-sm text-gray-700 mb-4">
              Your payment has been received and your order is being processed.
            </p>
            <Button className="mt-2">
              <Link href="/">Return to Homepage</Link>
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-500 mr-2" />
            <h1 className="text-xl font-bold">Payment Failed</h1>
          </div>
          <div className="bg-white p-6 rounded shadow-md text-center">
            <p className="mb-4">Failed to process your order. Please contact support with your transaction ID.</p>
            <p className="mb-2 text-gray-700">Transaction ID: {transaction_id || 'Not available'}</p>
            <Button className="mt-2">
              <Link href="/">Return to Homepage</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuccessPage;
