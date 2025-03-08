"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { Home, ListPlus} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ShoppingCart} from "lucide-react"
import { useShoppingCart } from "use-shopping-cart"

// CartIcon Component
function CartIcon() {
  const { handleCartClick, cartCount } = useShoppingCart()
  return (
    <Button 
      className="px-3 text-gray-800 bg-non hover:bg-transparent hover:text-[#f97e27] fontb"
      onClick={() => handleCartClick()}
    >
      <ShoppingCart
      size={25}
      strokeWidth={1.5} />
      <span className=" font-bold text-sm text-[#f97e27] pb-4">{cartCount}</span>
    </Button>
  )
}




// BottomNavbar Component
export default function BottomNavbar() {
  const pathname = usePathname()

  // Define navigation items (excluding the logo and cart button)
  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Services", href: "/Services", icon: ListPlus },
  ]

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-[#fff] shadow-xl flex justify-around items-center py-3 z-50 mx-2">
      {/* Logo Section */}
      <div className="cursor-pointer outline-none">
        <Link href="/" className=" outline-none">
          <Image src="/assets/fav.png" alt="logo" width={50} height={50} />
        </Link>
      </div>

      {/* Navigation Items */}
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link
            key={item.name}
            href={item.href}
            className="flex flex-col items-center"
          >
            <Icon
              size={25}
              strokeWidth={1.5}
              className={
                isActive
                  ? "text-[#f97e27]"
                  : "text-gray-800 hover:text-[#f97e27]"
              }
            />
          </Link>
        )
      })}

      {/* Cart Icon Button */}
      <CartIcon />
    </nav>
  )
}
