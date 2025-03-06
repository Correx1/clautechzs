import React from 'react';
import { simplifiedProduct } from '@/app/Interface';
import { client } from '@/app/lib/sanity';
import CarouselComponent from './Carousel';
import Link from 'next/link';
import Image from 'next/image';

interface SuggestionsProps {
  categoryName: string;
  currentId?: string;
}

const transactionFeeRate = 0.0147; // 1.47%
const vatRate = 0.075; // 7.5%

// Helper function to update the product's price based on the revised VAT logic.
function applyVatLogic(product: any) {
  const originalPrice = product.price ?? 0;
  const transactionFee = originalPrice * transactionFeeRate;
  const vatOnFee = transactionFee * vatRate;
  const vatTotal = transactionFee + vatOnFee;
  const grandPrice = originalPrice + vatTotal;
  return { ...product, price: grandPrice };
}


const Suggestions = async ({ categoryName, currentId }: SuggestionsProps) => {
  const query = `*[_type == "product" && category->name == "${categoryName}" ${
    currentId ? `&& _id != "${currentId}"` : ''
  }]|order(_createdAt desc){
    _id, 
    price,
    fakePrice,
    name,
    "slug": slug.current,
    "categoryName": category->name,
    "imageUrl": images[0].asset->url
  }`;

  const data: simplifiedProduct[] = await client.fetch(query);
  // Update each product's price with VAT logic
  const updatedData = data.map(product => applyVatLogic(product));

  return (
    <div className="overflow-x-hidden pb-6">
      <h2 className="font-bold uppercase text-gray-700 text-base sm:text-lg py-5 px-6 pt-6">
        You may also like
      </h2>
      <CarouselComponent>
        {updatedData.map((product) => (
          <div
            className="embla__slide md:basis-1/2 lg:basis-1/6 flex flex-row"
            key={product._id}
          >
            <Link href={`/product/${product.slug}`}>
              <div className="mx-2 h-[220px] w-[210px] p-5 bg-white shadow-md rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-2 bg-[#f97e27] text-white py-1 px-2 text-xs rounded-md">
                  {Math.round(
                    ((product.fakePrice - product.price) / product.fakePrice) * 100
                  )}
                  % OFF
                </div>
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-32 object-cover rounded-xl"
                  width={220}
                  height={130}
                />
                <div className="p-3 text-center">
                  <p className="font-medium text-gray-800 text-sm sm:text-base truncate">
                    {product.name}
                  </p>
                  <span className="font-semibold text-gray-700 text-sm sm:text-base">
                    ₦{product.price.toFixed(2)}
                  </span>
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
