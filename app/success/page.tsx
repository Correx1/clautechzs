'use client'

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useShoppingCart } from "use-shopping-cart";
import Link from 'next/link';



const SuccessPage: React.FC = () => {
  const {
    clearCart
  } = useShoppingCart();


  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const tx_ref = searchParams.get('tx_ref');
  const transaction_id = searchParams.get('transaction_id');


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
        <p className="text-sm text-gray-700 italic">Note: The Order NO. may be requested for during delivery.</p>
        <Button onClick={()=>clearCart()}
        className=' text-center items-center justify-center mt-2'
        > <Link href={"/"}> Return to Homepage </Link></Button>
      </div>
    </div>
  );
}

export default SuccessPage;