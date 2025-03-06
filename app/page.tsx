import React from 'react'
import Products from '@/app/components/Products'


export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="bg-[#f8f8f8] overflow-x-hidden font-manrope">
      <Products/>
    </div>
  );
}
