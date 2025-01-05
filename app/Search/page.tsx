'use client'

import React, { useState } from 'react';
import SearchInput from '@/app/components/Search';
import { client } from "@/app/lib/sanity";
import Image from 'next/image';
import Link from 'next/link';
import CartIcon from '../components/CartIcon';
import Navbar from '@/app/components/Navbar'

export const dynamic = "force-dynamic";

const SearchPage: React.FC = () => {
    const [results, setResults] = useState([]);
    const [query, setQuery] = useState('');

    const fetchSearchResults = async (searchQuery: string) => {
        setQuery(searchQuery);
        const queryResult = await client.fetch(
            `*[_type == "product" && (name match "${searchQuery}*" || description match "${searchQuery}*")]
            {
        _id,
        price,
        fakePrice,
        discount,
        name,
        description,
        "slug":slug,
        "categoryName":category->name,
        "imageUrl":images[0].asset->url
    }`
        );
        setResults(queryResult);
    };

    return (
        <div className=" overflow-x-hidden pt-5 mt-10">
            <Navbar/>
          <CartIcon/>

                <SearchInput onSearch={fetchSearchResults} />

                {results.length === 0 && query !== "" ? (
                    <p className="text-center text-gray-500 text-lg font-semibold">No products found for {query} unavailable</p>
                ) : (
                    <div className=' md:px-12 lg:py-3 px-2  grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-6 gap-4 gap-y-8' >
                        {results.map((result: any, id: number) => (
                            <div key={id} className="flex flex-col bg-[#f5f5f5] p-2 py-2 shadow-[rgba(0,_0,_0,0.14)_0px_2px_4px] rounded-md relative">
                                <div className="absolute top-1 right-1 bg-[#f97e27] text-white py-1 px-2 rounded-e-md text-xs">
                                    {result.discount}% OFF
                                </div>

                                <Link href={`/product/${result.slug.current}`} className="flex flex-col h-full">
                                    <div className="flex items-center justify-center h-44 overflow-hidden">
                                        <Image className='object-contain '
                                            src={result.imageUrl} alt=""
                                            width={150}
                                            height={150} />
                                    </div>
                                    <div className="text p-2 text-center ">
                                        <p className='font-bold truncate md:text-lg sm:text-base capitalize'>{result.name}</p>
                                        <p className='truncate first-letter:uppercase lowercase text-md font-semibold text-gray-600'>{result.description}</p>
                                        <span className='font-bold text-gray-800 text-md'>₦{result.price}</span>
                                        <span className='block text-gray-600 line-through text-sm'>₦{result.fakePrice}</span>

                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
        </div>
    );
};

export default SearchPage;