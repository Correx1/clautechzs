"use client"

import { ReactNode } from "react"
import { CartProvider as USCProvider } from "use-shopping-cart"



export default function CartProvider({ children }: { children: ReactNode }) {
    return (
        <USCProvider
            mode="payment"
            cartMode="client-only"
            stripe="nsskksn"
            successUrl="http://localhost:3000/success"
            cancelUrl="http://localhost:3000/error"
            currency="USD"
            billingAddressCollection={false}
            shouldPersist={true}
            language="en-US">
          
            {children}         
        </USCProvider>
    )
}