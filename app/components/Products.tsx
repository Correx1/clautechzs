import React from 'react'
import Link from 'next/link'
import { client } from "@/app/lib/sanity";
import { simplifiedProduct } from '../Interface';
import Image from 'next/image';
import AddToCart from '@/app/components/AddToCart';


async function getData() {
    const query = `*[_type =="product"][0...12]|order(_createdAt desc){
        _id,
        price,
        fakePrice,
        discount,
        name,
        description,
        "slug":slug.current,
        "categoryName":category->name,
        "imageUrl":images[0].asset->url
    }`

    const data = await client.fetch(query)

    return data;
}


async function Products() {
    const data: simplifiedProduct[] = await getData()  
  
  return (
      <div className=" overflow-x-hidden pt-5">
          <div className="flex flex-row md:py-7 p-4">
              <h2 className='font-bold uppercase text-gray-700 lg:text-3xl text-xl'>Our Products</h2>
         </div>

          <div className="md:px-12 md:py-3 px-2  grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-6 gap-4 gap-y-8">
              {data.map((product, id) => (
                  <div key={id} className="flex flex-col bg-[#f5f5f5] p-2 py-2 shadow-[rgba(0,_0,_0,0.14)_0px_2px_4px] rounded-md relative">
                   
                      <div className="absolute top-1 right-1 bg-[#f97e27] text-white py-1 px-2 rounded-e-md text-xs">
                          {product.discount}% OFF
                      </div>

                      <Link href={`/product/${product.slug}`} className="flex flex-col h-full">
                          <div className="flex items-center justify-center h-44 overflow-hidden">
                              <Image className='object-contain '
                                  src={product.imageUrl} alt=""
                                  width={150}
                                  height={150}/>
                          </div>
                          <div className="text p-2 text-center ">
                              <p className='font-bold truncate md:text-lg sm:text-base capitalize'>{product.name}</p>
                              <p className='truncate first-letter:uppercase lowercase text-md font-semibold text-gray-600'>{product.description}</p>
                              <span className='font-bold text-gray-800 text-md'>₦{product.price}</span>
                              <span className='block text-gray-600 line-through text-sm'>₦{product.fakePrice}</span>
                             
                          </div>
                      </Link>
                      <AddToCart
                          currency='USD'
                          price={product.price}
                          image={product.imageUrl}
                          name={product.name}
                          key={product._id}
                          id={product._id}
                      />
                  </div>
              ))}
          </div>
          <div className="mt-4 md:px-12 px-4">
              <Link href={"/Products"} className='  text-primary text-lg md:text-xl font-bold '>See More... </Link>
</div>
      </div>
  )
}

export default Products
