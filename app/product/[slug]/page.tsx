import React from 'react';
import { client } from '@/app/lib/sanity';
import { simplifiedProduct } from '@/app/Interface';
import ImageGallery from '@/app/components/ImageGallery';
import { Star, Truck } from 'lucide-react';
import Suggestions from '@/app/components/Suggestions';
import AddToCart from '@/app/components/AddToCart';
import Footer from '@/app/components/Footer';
import Navbar from '@/app/components/Navbar';

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

  try {
    const data = await client.fetch(query);
    // Apply VAT logic before returning data.
    return data ? applyVatLogic(data) : {};
  } catch (error) {
    console.error('Error fetching product data:', error);
    return {};
  }
}

export const dynamic = 'force-dynamic';

async function Page({ params }: { params: { slug: string } }) {
  const data: Partial<simplifiedProduct> = await getData(params.slug);

  return (
    <div className="bg-[#f8f8f8] overflow-x-hidden px-2">
      <Navbar />
      <div className="bg-[#f8f8f8] overflow-x-hidden mt-2">
        <div className="flex md:flex-row flex-col md:gap-8 gap-5 md:mx-20 px-6 md:py-10 py-3">
          <div className="flex pt-2 md:pt-1">
            {data.images ? <ImageGallery images={data.images} /> : null}
          </div>

          <div className="flex md:w-3/3">
            <div className="md:py-4">
              <div className="mb-2">
                {data.categoryName && (
                  <span className="mb-1 inline-block text-gray-500 italic text-sm md:text-base">
                    {data.categoryName}
                  </span>
                )}
                {data.name && (
                  <h2 className="text-sm font-bold text-gray-800 md:text-base capitalize">
                    {data.name}
                  </h2>
                )}
              </div>

              <div className="mb-3 flex items-center">
                <div className="rounded-xl flex gap-x-1 px-2 bg-[#f97e27] py-1 text-gray-100">
                  <span className="text-sm">4.2</span>
                  <Star className="h-5 w-4" />
                </div>
              </div>

              <div className="mb-3">
                {data.price && (
                  <div className="flex items-end gap-2">
                    <span className="font-bold text-gray-700 text-sm md:text-base">
                      ₦{data.price.toFixed(2)}
                    </span>
                    {data.fakePrice && (
                      <span className="text-sm md:text-base text-gray-500 line-through">
                        ₦{data.fakePrice}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <p className="text-lg md:text-xl font-bold md:pb- pt-1 text-gray-700">
                  Details
                </p>
                {data.description && (
                  <p className="text-sm md:text-base text-gray-700">
                    {data.description}
                  </p>
                )}
              </div>

              <div className="mb-3 flex flex-col text-gray-700 md:text-base text-sm font-semibold">
                <p>Free Delivery</p>
                <p className="flex gap-2">
                  <Truck /> 1-4 Days
                </p>
              </div>

              <div className="ml-5">
                {data._id &&
                  data.price &&
                  data.images &&
                  data.images[0] &&
                  data.name && (
                    <AddToCart
                      currency="USD"
                      price={data.price}
                      image={data.images[0]}
                      name={data.name}
                      key={data._id}
                      id={data._id}
                    />
                  )}
              </div>
            </div>
          </div>
        </div>
        <div>{data.categoryName && <Suggestions categoryName={data.categoryName} />}</div>
        <div>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default Page;
