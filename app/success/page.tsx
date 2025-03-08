// /app/success/page.tsx
'use client'
import React, { useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useShoppingCart } from 'use-shopping-cart';

const SuccessPage: React.FC = () => {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const { clearCart } = useShoppingCart();

  // Only clear cart if the payment is successful and clear hasn't been done already.
  useEffect(() => {
    if (status === 'successful') {
      // Check if the cart was already cleared to ensure this runs only once.
      if (!localStorage.getItem('cartCleared')) {
        clearCart();
        localStorage.setItem('cartCleared', 'true');
      }
    }
  }, [status, clearCart]);

  // Display failure message if payment was not successful.
  if (status !== 'successful') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="flex items-center justify-center mb-4">
          <XCircle className="w-8 h-8 text-red-500 mr-2" />
          <h1 className="text-xl font-bold">Payment Failed</h1>
        </div>
        <div className="bg-white p-6 rounded shadow-md text-center">
          <p className="mb-4">Your payment was not successful. Please try again or contact support.</p>
          <Button>
            <Link href="/">Return to Homepage</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Otherwise, display the success message.
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="flex items-center justify-center mb-4">
        <CheckCircle className="w-8 h-8 text-green-500 mr-2" />
        <h1 className="text-xl font-bold">Thank You!</h1>
      </div>
      <div className="bg-white p-6 rounded shadow-md text-center">
        <h2 className="text-lg font-bold mb-2">Your payment was successful.</h2>
        <p className="mb-4">Your order is being processed. You will receive a confirmation email shortly.</p>
        <Button className="mt-2">
          <Link href="/">Return to Homepage</Link>
        </Button>
      </div>
    </div>
  );
}

export default SuccessPage;
