'use client'

import { Button } from '@/components/ui/button'
import {ShoppingBag} from 'lucide-react'
import React from 'react'
import { useShoppingCart } from "use-shopping-cart";

function CartIcon() {
    const { handleCartClick, cartCount } = useShoppingCart()

  return (
    <div>
          <div className=" flex flex-row border-r top-14 fixed right-0 font-light  z-10">
              <Button className=' px-3  ' onClick={() => handleCartClick()}>
                  <ShoppingBag size={20} />
                  <span >{cartCount}</span>
              </Button>
          </div> 
    </div>
  )
}

export default CartIcon
