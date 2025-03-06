"use client";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Trash2, Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useShoppingCart } from "use-shopping-cart";

export default function Cart() {
  const {
    cartCount,
    shouldDisplayCart,
    handleCartClick,
    cartDetails,
    removeItem,
    totalPrice,
    incrementItem,
    decrementItem,
  } = useShoppingCart();

  

  return (
    <Sheet open={shouldDisplayCart} onOpenChange={() => handleCartClick()}>
      <SheetContent className="sm:max-w-lg w-[90vw] z-[10000] m-1 rounded-lg bg-gray-100 py-1 px-2 sm:px-3 pb-6">
        <SheetHeader>
          <SheetTitle className="font-bold text-lg md:text-xl">
            Shopping Cart
          </SheetTitle>
        </SheetHeader>

        <div className="h-full flex flex-col justify-between ">
          <div className="mt-8 flex-1 overflow-y-auto no-scrollbar scroll-smooth">
            <ul className="-my-6 divide-y divide-gray-300 overflow-y-auto">
              {cartCount === 0 ? (
                <h1 className="py-6 font-semibold text-sm sm:text-base">
                  You don’t have any items
                </h1>
              ) : (
                <>
                  {Object.values(cartDetails ?? {}).map((entry) => (
                    <li key={entry.id} className="flex py-6">
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-50">
                        <Image
                          src={entry.image as string}
                          alt="Product image"
                          width={100}
                          height={100}
                        />
                      </div>

                      <div className="ml-5 flex flex-1 flex-col">
                        <div>
                          <div className="flex flex-1 items-end justify-between text-sm sm:text-base text-gray-900">
                            <h3 className="text-sm sm:text-base font-bold">{entry.name}</h3>
                            <p className="ml-4 font-medium">
                              ₦{entry.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-1 items-end justify-between text-sm">
                          <div className="flex flex-col">
                            <p className="text-xs sm:text-base pb-1 text-gray-900">
                              Quantity
                            </p>
                            <div className="flex pt-1">
                              <button
                                className="border outline-none border-gray-400 text-gray-600 px-0 py-0 cursor-pointer"
                                onClick={() => decrementItem(entry.id)}
                              >
                                <Minus />
                              </button>
                              <span className="border outline-none text-gray-600 text-base border-gray-500 px-2 py-0">
                                {entry.quantity}
                              </span>
                              <button
                                className="border outline-none border-gray-400 text-gray-600 px-0 py-0 cursor-pointer"
                                onClick={() => incrementItem(entry.id)}
                              >
                                <Plus />
                              </button>
                            </div>
                          </div>

                          <div className="flex">
                            <button
                              type="button"
                              onClick={() => removeItem(entry.id)}
                              className="font-medium text-primary hover:text-primary/80"
                            >
                              <Trash2 />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </>
              )}
            </ul>
          </div>

          <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
            
            <div className="flex justify-between sm:text-sm font-base font-bold text-gray-900 mt-4">
              <p>Total:</p>
              <p>₦{(totalPrice ?? 0).toFixed(2)}</p>
            </div>

            <div className="mt-6">
              {cartCount === 0 ? (
                <Button className="w-full" disabled>
                  <Link href="/Checkout">Checkout</Link>
                </Button>
              ) : (
                <Link
                  href={{
                    pathname: "/Checkout",
                    query: {
                      items: JSON.stringify(
                        Object.values(cartDetails ?? {}).map((entry) => ({
                          name: entry.name,
                          quantity: entry.quantity,
                        }))
                      ),
                      totalPrice: totalPrice,
                    },
                  }}
                >
                  <Button
                    className="w-full"
                    onClick={() => handleCartClick()}
                  >
                    Checkout Now
                  </Button>
                </Link>
              )}
            </div>

            <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
              <p>
                OR
                <button
                  onClick={() => handleCartClick()}
                  className="font-medium text-primary hover:text-primary/80 pl-2"
                >
                  Continue Shopping
                </button>
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
