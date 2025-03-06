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
  const orderId = searchParams.get('order_id');
  const [orderStatus, setOrderStatus] = useState<'processing' | 'completed' | 'failed'>('processing');

  useEffect(() => {
    const checkOrderStatus = async () => {
      try {
        // Clear cart regardless of status
        clearCart();

        // Check localStorage for pending orders
        const pendingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '{}');
        
        if (orderId && pendingOrders[orderId]) {
          setOrderStatus('completed');
          delete pendingOrders[orderId];
          localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));
        } else {
          setOrderStatus('completed');
        }
      } catch (error) {
        console.error('Order status check failed:', error);
        setOrderStatus('failed');
      }
    };

    checkOrderStatus();
  }, [orderId, clearCart]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="flex items-center justify-center mb-4">
        {orderStatus === 'completed' ? (
          <CheckCircle className="w-8 h-8 text-green-500 mr-2" />
        ) : (
          <XCircle className="w-8 h-8 text-red-500 mr-2" />
        )}
        <h1 className="text-xl font-bold">
          {orderStatus === 'completed' ? 'Thank You!' : 'Processing...'}
        </h1>
      </div>
      <div className="bg-white p-6 rounded shadow-md">
        {orderStatus === 'completed' ? (
          <>
            <h1 className="text-xl font-bold mb-4">Payment Successful</h1>
            <p className="mb-2 text-xl font-bold">Order NO: {orderId}</p>
            <p className="text-sm text-gray-700 italic">Note: The Order NO. may be requested for during delivery.</p>
          </>
        ) : orderStatus === 'failed' ? (
          <>
            <h1 className="text-xl font-bold mb-4">Payment Processing Issue</h1>
            <p className="mb-4 text-center">Please contact support with your order number: {orderId}</p>
          </>
        ) : (
          <p className="text-sm text-yellow-600 mb-2">Processing your order...</p>
        )}
        
        <Button className="text-center items-center justify-center mt-4">
          <Link href="/">Return to Homepage</Link>
        </Button>
      </div>
    </div>
  );
}

export default SuccessPage;