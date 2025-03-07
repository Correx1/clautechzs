'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import InfiniteScroll from 'react-infinite-scroll-component';
import { client } from '@/app/lib/sanity';
import { simplifiedProduct } from '../Interface';
import Navbar from '@/app/components/Navbar';
import AddToCart from '@/app/components/AddToCart';
import SearchBar from '@/app/components/Search';
import { CheckCircle } from 'lucide-react';
import FloatingWhatsappButton from "@/app/components/Whatsapp";

// Category filters
const categories = [
  { label: 'All', value: undefined },
  { label: 'Devices and Accessories', value: 'Devices and Accessories' },
  { label: 'Wears', value: 'Wears' },
  { label: 'Academic and Hostel Support Items', value: 'Academic and Hostel Support Items' },
  { label: 'Electronic Gadgets', value: 'Electronic Gadgets' },
];

// Shuffle logic
function stratifiedShuffle<T extends { _id: string; categoryName: string }>(array: T[]): T[] {
  const groups: { [category: string]: T[] } = {};
  for (const item of array) {
    if (!groups[item.categoryName]) {
      groups[item.categoryName] = [];
    }
    groups[item.categoryName].push(item);
  }

  for (const category in groups) {
    let currentIndex = groups[category].length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [groups[category][currentIndex], groups[category][randomIndex]] = [
        groups[category][randomIndex],
        groups[category][currentIndex],
      ];
    }
  }

  const result: T[] = [];
  let itemsLeft = true;
  while (itemsLeft) {
    itemsLeft = false;
    for (const category in groups) {
      if (groups[category].length > 0) {
        result.push(groups[category].shift()!);
        itemsLeft = true;
      }
    }
  }
  return result;
}

// VAT logic
const transactionFeeRate = 0.0147; // 1.47%
const vatRate = 0.075; // 7.5%
function applyVatLogic(product: any) {
  const originalPrice = product.price ?? 0;
  const transactionFee = originalPrice * transactionFeeRate;
  const vatOnFee = transactionFee * vatRate;
  const vatTotal = transactionFee + vatOnFee;
  const grandPrice = originalPrice + vatTotal;
  return { ...product, price: grandPrice };
}

// Fetch data from Sanity
async function getData(skip: number, category?: string): Promise<simplifiedProduct[]> {
  const filterCategory = category ? `&& category->name == "${category}"` : '';
  const query = `*[_type == "product" ${filterCategory}]|order(_createdAt asc){
    _id,
    price,
    fakePrice,
    name,
    description,
    "slug": slug.current,
    "categoryName": category->name,
    "imageUrl": images[0].asset->url
  }[${skip}...${skip + 10}]`;

  try {
    const data = await client.fetch(query);
    if (!data || !Array.isArray(data)) return [];
    const validData = data.filter((item: any) => item._id);
    const updatedData = validData.map(applyVatLogic);
    return stratifiedShuffle(updatedData);
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}

// Search logic
async function searchData(searchQuery: string): Promise<simplifiedProduct[]> {
  const query = `*[_type == "product" && name match "*${searchQuery}*"]|order(_createdAt asc){
    _id,
    price,
    fakePrice,
    name,
    description,
    "slug": slug.current,
    "categoryName": category->name,
    "imageUrl": images[0].asset->url
  }`;

  try {
    const data = await client.fetch(query);
    if (!data || !Array.isArray(data)) return [];
    const validData = data.filter((item: any) => item._id);
    const updatedData = validData.map(applyVatLogic);
    return stratifiedShuffle(updatedData);
  } catch (error) {
    console.error('Error fetching search data:', error);
    return [];
  }
}

export const dynamic = 'force-dynamic';

function Page() {
  const [data, setData] = useState<simplifiedProduct[]>([]);
  const [searchResults, setSearchResults] = useState<simplifiedProduct[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [skip, setSkip] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState<string>("");

  // 1) Load initial data (only if not searching).
  useEffect(() => {
    if (searchQuery.trim()) return;
    const fetchData = async () => {
      const newData: simplifiedProduct[] = await getData(skip, selectedCategory);
      if (newData.length === 0) {
        setHasMore(false);
        return;
      }
      setData((prevData) => {
        const existingIds = new Set(prevData.map(item => item._id));
        const uniqueNewData = newData.filter(item => !existingIds.has(item._id));
        return [...prevData, ...uniqueNewData];
      });
    };
    fetchData();
  }, [skip, selectedCategory, searchQuery]);

  // 2) Auto-fetch more if the page content is too short to scroll.
  useEffect(() => {
    const checkHeightAndFetch = () => {
      // Compare total page height to the viewport height
      const bodyHeight = document.body.scrollHeight;
      const windowHeight = window.innerHeight;

      // If there's no scrolling and we still have more items, fetch more
      if (bodyHeight <= windowHeight && hasMore) {
        fetchMoreData();
      }
    };

    checkHeightAndFetch(); // run once when data updates
    window.addEventListener('resize', checkHeightAndFetch);
    return () => {
      window.removeEventListener('resize', checkHeightAndFetch);
    };
  }, [data, hasMore]);

  // 3) Infinite Scroll callback
  const fetchMoreData = () => {
    setSkip((prev) => prev + 10);
  };

  // 4) Handle search queries
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results: simplifiedProduct[] = await searchData(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  // 5) Determine displayed data
  const displayedData = searchQuery.trim() ? searchResults : data;

  // 6) Handle category selection
  const handleCategoryClick = (category: string | undefined) => {
    setSelectedCategory(category);
    setData([]);
    setSkip(0);
    setHasMore(true);
  };

  // 7) Render product card
  const renderProductCard = (product: simplifiedProduct, index: number) => {
    const discount =
      product.fakePrice && product.price
        ? Math.round(((product.fakePrice - product.price) / product.fakePrice) * 100)
        : null;

    const uniqueKey = `${product._id}-${index}`;

    return (
      <div key={uniqueKey} className="relative bg-gray-100 p-2 shadow rounded-md">
        {discount !== null && (
          <div className="absolute top-1 right-1 bg-[#f97e27] text-white py-0.5 px-1 rounded text-xs">
            {discount}% OFF
          </div>
        )}
        <Link href={`/product/${product.slug || ''}`}>
          <div className="flex items-center justify-center h-28 overflow-hidden rounded-md bg-white">
            {product.imageUrl ? (
              <Image
                className="object-contain rounded-md"
                src={product.imageUrl}
                alt={product.name || 'Product Image'}
                width={130}
                height={130}
              />
            ) : (
              <div className="w-32 h-32 bg-gray-300 flex items-center justify-center">No Image</div>
            )}
          </div>
          <div className="mt-1 text-left">
            <p className="font-normal text-gray-900 text-sm truncate capitalize">
              {product.name || ''}
            </p>
            <p className="text-gray-700 text-xs truncate">
              {product.description || ''}
            </p>
            <div className="flex items-center mt-1">
              {product.price !== undefined && (
                <span className="font-normal text-gray-900 text-sm">
                  ₦{product.price.toFixed(2)}
                </span>
              )}
              {product.fakePrice !== undefined && (
                <span className="ml-2 text-gray-600 line-through text-xs">
                  ₦{product.fakePrice}
                </span>
              )}
            </div>
          </div>
        </Link>
        <div className="mt-1 flex justify-center">
          {product.price !== undefined && product.imageUrl && product.name && (
            <AddToCart
              currency="USD"
              price={product.price}
              image={product.imageUrl}
              name={product.name}
              key={`cart-${uniqueKey}`}
              id={product._id}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-100 overflow-x-hidden mb-20">
      <Navbar />
      {/* Fixed header */}
      <div className="fixed top-0 left-0 w-full z-50">
        <SearchBar onSearch={handleSearch} placeholder="Search products..." />
        <div className="px-4 py-2 bg-gray-100 border-none"></div>
        <div className="px-4 py-2 bg-gray-100 border-b border-gray-200 overflow-x-auto no-scrollbar">
          <div className="flex space-x-4">
            {categories.map((category) => (
              <button
                key={category.label}
                onClick={() => handleCategoryClick(category.value)}
                className={`px-3 py-1 rounded-full text-sm font-normal whitespace-nowrap outline-none ${
                  selectedCategory === category.value
                    ? 'bg-[#f97e27] text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
        <div className="px-4 py-1 bg-gray-100 border-b border-gray-200">
          <p className="text-left text-sm text-green-600">
            <CheckCircle size={16} className="inline mr-1" />
            Free Delivery
          </p>
        </div>
      </div>

      {/* Offset content so it doesn't hide behind the fixed header */}
      <div className="pt-[180px] px-4">
        {searchQuery.trim() ? (
          // If searching, show search results
          <div onClick={(e) => e.stopPropagation()}>
            {displayedData.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {displayedData.map((product, index) => renderProductCard(product, index))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-600 text-lg">Items not available</p>
              </div>
            )}
          </div>
        ) : (
          // Otherwise, use InfiniteScroll
          <InfiniteScroll
            dataLength={data.length}
            next={fetchMoreData}
            hasMore={hasMore}
            scrollThreshold="0.8"
            loader={<div className="text-center py-4"></div>}
            endMessage={<div className="text-center py-4"></div>}
          >
            <div onClick={(e) => e.stopPropagation()}>
              {displayedData.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 sm:gap-7 sm:mx-3 mx-1">
                  {displayedData.map((product, index) => renderProductCard(product, index))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-600 text-lg">Items not available</p>
                </div>
              )}
            </div>
          </InfiniteScroll>
        )}
      </div>
      <FloatingWhatsappButton phoneNumber="2349161348026" />
    </div>
  );
}

export default Page;
