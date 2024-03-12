import React from 'react'
import { client } from "@/app/lib/sanity";
import { simplifiedProduct } from '@/app/Interface';
import ImageGallery from '@/app/components/ImageGallery';
import {  Star, Truck } from 'lucide-react';
import Suggestions from '@/app/components/Suggestions';
import AddToCart from '@/app/components/AddToCart';
import Footer from '@/app/components/Footer';
import CartIcon from '@/app/components/CartIcon';
import Navbar from '@/app/components/Navbar'


async function getData(slug: string) {
    const query = `*[_type == "product" && slug.current == "${slug}"][0] {
        _id,
          images,
          price,
          shoeSizes,
          clothSizes,
          color,
          fakePrice,
          name,
          description,
          "slug": slug.current,
          "categoryName": category->name,
          price_id
      }`;

    const data = await client.fetch(query);

    return data;
}

 export const dynamic = "force-dynamic";

async function Page({
  params,
}: {
  params: { slug: string };
  }) {
  const data: simplifiedProduct = await getData(params.slug);

  
  return (
    <div className='bg-[#f8f8f8] overflow-x-hidden'>
      <Navbar/>
   <CartIcon/>
        <div className=' bg-[#f8f8f8] overflow-x-hidden'>
          <div className=' flex md:flex-row flex-col md:gap-8 gap-5 md:mx-20 px-5 md:py-10 py-2 '>
            <div className=" flex pt-5 lg:pt-1 ">
              <ImageGallery images={data.images} />
            </div>

            <div className=" flex md:w-3/3">
              <div className="md:py-8">
                <div className="mb-2 ">
                  <span className="mb-0.5 inline-block text-gray-500 italic text-base md:text-lg">
                    {data.categoryName}
                  </span>
                  <h2 className="text-xl font-bold text-gray-800 md:text-3xl capitalize">
                    {data.name}
                  </h2>
                </div>

                <div className="mb-3 flex items-center ">
                  <div className="rounded-xl flex gap-x-1 px-2 bg-[#f97e27]  py-1  text-gray-100">
                    <span className="text-sm">4.2</span>
                    <Star className="h-5 w-4" />
                  </div>
                </div>

                <div className=" mb-3">
                  <div className="flex items-end gap-2">
                    <span className='font-bold text-gray-700 text-lg md:text-xl'>₦{data.price}</span>
                    <span className=" text-base md:text-lg text-red-500 line-through">
                      ${data.fakePrice}
                    </span>
                  </div>
                </div>

                <div className=" mb-4">
                  <p className="text-lg md:text-xl font-bold md:pb- pt-2  text-gray-700 ">
                    Details
                  </p>
                  <p className=" text-base md:text-lg text-gray-700 ">
                    {data.description}
                  </p>
                </div>



                <div className="mb-4 flex flex-col  text-gray-700 md:text-lg text-base font-semibold">
                  <p>  Free Delivery</p>
                  <p className=" flex-row flex gap-2 "> <Truck /> 1-4 Days</p>
                </div>



                <div className=" -ml-5">
                  <AddToCart
                    currency='USD'
                    price={data.price}
                    image={data.images[0]}
                    name={data.name}
                    key={data._id}
                    id={data._id}
                  />
                </div>
              </div>
            </div>


          </div>
          <div>
            <Suggestions />
          </div>
          <div>
            <Footer />
          </div>
        </div>
   
      </div>
   
  )
}

export default Page
