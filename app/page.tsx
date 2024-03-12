import React from 'react'
import Hero from '@/app/components/Hero'
import NewProducts from '@/app/components/NewProducts'
import HotDeals from '@/app/components/HotDeals'
import Products from '@/app/components/Products'
import Footer from '@/app/components/Footer'
import SubFooter from '@/app/components/SubFooter'
import Navbar from '@/app/components/Navbar'
import CartIcon from '@/app/components/CartIcon'

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="bg-[#f8f8f8] overflow-x-hidden">
      <Navbar/>
      <CartIcon />
      <Hero />
      <NewProducts />
      <HotDeals />
      <Products />
      <SubFooter />
      <Footer />
     
  
    </div>
  );
}
