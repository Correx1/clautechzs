'use client'


import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { client } from '@/app/lib/sanity';
import { simplifiedProduct } from '../Interface';
import Image from 'next/image';
import Navbar from '@/app/components/Navbar'
import AddToCart from '@/app/components/AddToCart';
import InfiniteScroll from 'react-infinite-scroll-component';
import Footer from '@/app/components/Footer'
import SubFooter from '@/app/components/SubFooter'
import CartIcon from '@/app/components/CartIcon'

async function getData(skip: number) {
  const query = `*[_type =="product"]|order(_createdAt asc){
        _id,
        price,
        fakePrice,
        discount,
        name,
        description,
        "slug":slug.current,
        "categoryName":category->name,
        "imageUrl":images[0].asset->url
    }[${skip}...${skip + 10}]`

  const data = await client.fetch(query)

  return data;
}

export const dynamic = "force-dynamic";

function Page() {
  const [data, setData] = useState<simplifiedProduct[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [skip, setSkip] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      const newData: simplifiedProduct[] = await getData(skip);
      if (newData.length === 0) {
        setHasMore(false);
        return;
      }
      setData([...data, ...newData]);
      setSkip(skip + 10);
    };

    fetchData();
  }, []);

  const fetchMoreData = async () => {
    const newData: simplifiedProduct[] = await getData(skip);
    if (newData.length === 0) {
      setHasMore(false);
      return;
    }
    setData([...data, ...newData]);
    setSkip(skip + 10);
  };

  return (
    <div className="bg-[#f8f8f8] overflow-x-hidden">
      <Navbar/>
          <CartIcon />
          <InfiniteScroll
              dataLength={data.length}
              next={fetchMoreData}
              hasMore={hasMore}
              loader={<h4 className=' text-primary italic ml-3'>Please wait...</h4>}
              endMessage={
                  <p style={{ textAlign: 'center' }}>
                      <b className=' text-primary italic'>Loading more...</b>
                  </p>
              }
          >
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
                                          height={150} />
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
              </div>

          </InfiniteScroll>
          <SubFooter/>
          <Footer/>
    </div>
  )
}

export default Page;