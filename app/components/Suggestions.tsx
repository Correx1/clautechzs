import React from 'react';
import { simplifiedProduct } from '../Interface';
import { client } from "@/app/lib/sanity";
import CarouselComponent from './Carousel';
import Link from 'next/link';
import Image from 'next/image';


const Suggestions = async () => {
  const getData = async () => {
    const query = `*[_type =="product"]|order(_createdAt desc){
        _id, 
        price,
         fakePrice,
        name,
        "slug":slug.current,
        "categoryName":category->name,
        "imageUrl":images[0].asset->url
    }`

    return await client.fetch(query);
  };

  const data: simplifiedProduct[] = await getData();

  return (
    <div className=" overflow-x-hidden pb-10">
      <h2 className='font-bold uppercase text-gray-700 lg:text-3xl text-xl lg:py-10 py-6 px-6 lg:px-4 pt-20'>You may also like</h2>
      <CarouselComponent>
        {data.map((product, _id) => (
          <div className="embla__slide md:basis-1/2 lg:basis-1/6 flex flex-row" key={_id}>
            <Link href={`/product/${product.slug}`}>
              <div className='mx-2 h-[250px] w-[230px] p-5 bg-[#f5f5f5] shadow-[rgba(0,_0,_0,0.14)_0px_3px_8px] rounded-lg relative overflow-hidden'>
                <div className="absolute top-0 right-2  bg-[#f97e27] text-white py-1 px-2 text-xs rounded-e-md">
                { Math.round(((product.fakePrice - product.price) / product.fakePrice) * 100)}% OFF
                </div>
                <Image src={product.imageUrl} alt={product.name}
                  className="w-full h-36 object-cover"
                  width={200}
                  height={200}/>
                <div className="text p-4 flex-1 text-center">
                  <p className='font-bold truncate text-base'>{product.name}</p>
                  <span className='font-bold text-gray-700 text-sm'>₦{product.price}</span>
                </div>
               
              </div>
            </Link>
          </div>
        ))}
      </CarouselComponent>
    </div>
  );
};

export default Suggestions;