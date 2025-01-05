'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { client } from '@/app/lib/sanity';
import { simplifiedProduct } from '../Interface';
import Image from 'next/image';
import Navbar from '@/app/components/Navbar';
import AddToCart from '@/app/components/AddToCart';
import InfiniteScroll from 'react-infinite-scroll-component';
import Footer from '@/app/components/Footer';
import SubFooter from '@/app/components/SubFooter';
import CartIcon from '@/app/components/CartIcon';

const categories = [
  { label: 'All', value: undefined },
  { label: 'Devices and Accessories', value: 'Devices and Accessories' },
  { label: 'Wears', value: 'Wears' },
  { label: 'Academic and Hostel Support Items', value: 'Academic and Hostel Support Items' },
  { label: 'Electronic Gadgets', value: 'Electronic Gadgets' },
];

async function getData(skip: number, category?: string) {
  const filterCategory = category ? `&& category->name == "${category}"` : '';
  const query = `*[_type == "product" ${filterCategory}]|order(_createdAt asc){
        _id,
        price,
        fakePrice,
        name,
        description,
        "slug":slug.current,
        "categoryName":category->name,
        "imageUrl":images[0].asset->url
    }[${skip}...${skip + 10}]`;

  const data = await client.fetch(query);
  return data;
}

export const dynamic = 'force-dynamic';

function Page() {
  const [data, setData] = useState<simplifiedProduct[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [skip, setSkip] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const closeDropdown = () => setIsDropdownOpen(false);

  const handleCategoryClick = (category: string | undefined) => {
    setSelectedCategory(category);
    setData([]); // Clear current data when switching category
    setSkip(0); // Reset skip count for new category
    setHasMore(true); // Reset "hasMore" for new category
    closeDropdown();
  };

  useEffect(() => {
    const fetchData = async () => {
      const newData: simplifiedProduct[] = await getData(skip, selectedCategory);
      if (newData.length === 0) {
        setHasMore(false);
        return;
      }
      setData((prevData) => [...prevData, ...newData]);
    };

    fetchData();
  }, [skip, selectedCategory]);

  const fetchMoreData = () => {
    setSkip((prevSkip) => prevSkip + 10); // Trigger loading the next batch of products
  };

  return (
    <div
      className="bg-[#f8f8f8] overflow-x-hidden"
      onClick={closeDropdown}
    >
      <Navbar />
      <CartIcon />
      <InfiniteScroll
        dataLength={data.length}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={<h4 className="text-primary italic ml-3">Loading...</h4>}
        endMessage={
          <p style={{ textAlign: 'center' }}>
            <b className="text-primary italic">No more items</b>
          </p>
        }
      >
        <div className="overflow-x-hidden pt-5 " onClick={(e) => e.stopPropagation()}>
          {/* Dropdown Section */}
          <div className="flex flex-row md:py-7 p-4 fixe mt-9 ">
            <div className="relative ">
              {/* Dropdown Trigger */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDropdown();
                }}
                className=" capitalize lg:text-l text-sm bg-[#f97e27] text-[#E3e3e3] px-4 py-2 rounded-md cursor-pointer  "
              >
                Categories
              </button>

              {/* Dropdown Content */}
              {isDropdownOpen && (
                <div
                  className="absolute bg-[#f97e27] text-[#E3e3e3] mt-2 shadow-lg rounded-md w-64 z-[1000] "
                  onClick={(e) => e.stopPropagation()}
                >
                  {categories.map((category) => (
                    <button
                      key={category.label}
                      onClick={() => handleCategoryClick(category.value)}
                      className={` capitalize lg:text-l text-sm block px-2 text-left hover:w-full py-2 hover:bg-[#E3e3e3] hover:text-[#f97e27] transition duration-600 z-[1000] ${
                        selectedCategory === category.value ? 'bg-[#E3e3e3] text-[#f97e27] w-full text-left z-[1000]' : ''
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="md:px-12 md:py-3 px-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-6 gap-4 gap-y-8">
            {data.map((product, id) => (
              <div
                key={id}
                className="flex flex-col bg-[#f5f5f5] p-2 py-2 shadow-[rgba(0,_0,_0,0.14)_0px_2px_4px] rounded-md relative"
              >
                <div className="absolute top-1 right-1 bg-[#f97e27] text-white py-1 px-2 rounded-e-md text-xs">
                  {Math.round(((product.fakePrice - product.price) / product.fakePrice) * 100)}% OFF
                </div>
                <Link href={`/product/${product.slug}`} className="flex flex-col h-full">
                  <div className="flex items-center justify-center h-44 overflow-hidden">
                    <Image
                      className="object-contain"
                      src={product.imageUrl}
                      alt=""
                      width={150}
                      height={150}
                    />
                  </div>
                  <div className="text p-2 text-center">
                    <p className="font-bold truncate md:text-lg sm:text-base capitalize">
                      {product.name}
                    </p>
                    <p className="truncate first-letter:uppercase lowercase text-md font-semibold text-gray-600">
                      {product.description}
                    </p>
                    <span className="font-bold text-gray-800 text-md">₦{product.price}</span>
                    <span className="block text-gray-600 line-through text-sm">
                      ₦{product.fakePrice}
                    </span>
                  </div>
                </Link>
                <AddToCart
                  currency="USD"
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
      <SubFooter />
      <Footer />
    </div>
  );
}

export default Page;
