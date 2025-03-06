'use client'

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const ErrorPage: React.FC = () => {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const transaction_id = searchParams.get('transaction_id');

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="flex items-center justify-center mb-4">
        <XCircle className="w-8 h-8 text-red-500 mr-2" />
        <h1 className="text-xl font-bold">Payment Failed</h1>
      </div>
      <div className="bg-white p-6 rounded shadow-md">
        <p className="mb-4 text-center">
          {status === 'cancelled'
            ? 'Payment was cancelled. Please try again.'
            : 'Failed to process your order. Please contact support with your transaction ID.'}
        </p>
        <p className="mb-2 text-gray-700">
          Transaction ID: {transaction_id || 'Not available'}
        </p>
        <div className="flex justify-center mt-4">
          <Button>
            <Link href="/Checkout">Return Bacl</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
