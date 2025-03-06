"use client";
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useShoppingCart } from "use-shopping-cart";
import Link from 'next/link';

export default function SuccessPage() {
  const { clearCart } = useShoppingCart();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');

  useEffect(() => {
    const verifyOrder = async () => {
      try {
        // Clear cart first
        clearCart();

        // Check localStorage for pending order
        const pendingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '{}');
        if (orderId && pendingOrders[orderId]) {
          // If order exists in pending, check webhook status
          const response = await fetch(`/api/verify?order_id=${orderId}`);
          const data = await response.json();
          
          if (data.verified) {
            setStatus('success');
            delete pendingOrders[orderId];
            localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));
          } else {
            setStatus('failed');
          }
        } else {
          setStatus('success');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('failed');
      }
    };

    verifyOrder();
  }, [orderId, clearCart]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        {status === 'success' ? (
          <>
            <div className="flex items-center justify-center mb-4 text-green-600">
              <CheckCircle className="h-8 w-8 mr-2" />
              <h1 className="text-2xl font-bold">Payment Successful!</h1>
            </div>
            <p className="text-center mb-4">
              Order ID: <span className="font-mono">{orderId}</span>
            </p>
          </>
        ) : status === 'failed' ? (
          <>
            <div className="flex items-center justify-center mb-4 text-red-600">
              <XCircle className="h-8 w-8 mr-2" />
              <h1 className="text-2xl font-bold">Payment Failed</h1>
            </div>
            <p className="text-center mb-4">
              Please contact support with Order ID: {orderId}
            </p>
          </>
        ) : (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying payment...</p>
          </div>
        )}

        <Button asChild className="w-full mt-6">
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  );
}