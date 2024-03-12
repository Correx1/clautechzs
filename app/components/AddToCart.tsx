"use client"
import { Button } from '@/components/ui/button'
import React from 'react'
import { useShoppingCart } from 'use-shopping-cart'
import { urlFor } from '../lib/sanity';

export interface ProductCart {
    name: string;
    price: number;
    currency: string;
    image: any;
    id: string;
}

const AddToCart = ({ currency, name, price, image, id
}: ProductCart) => {
    const { addItem, handleCartClick} = useShoppingCart()

    const product = {
        name: name,
        price: price,
        currency: currency,
        image: urlFor(image).url(),
        id: id,
        
    }

    return (
        <Button
            onClick={() => { addItem(product), handleCartClick() }}
            className="mt-auto mx-5">Add to Cart</Button>
    )
}

export default AddToCart
