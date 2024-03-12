import { Button } from '@/components/ui/button'
import { client, urlFor } from "@/app/lib/sanity";
import Image from 'next/image';



async function getData() {
  const query = `*[_type =='Banner'][0]{
    _id,
    smallText2,
    largeText2,
    image2,
    smallText3,
    largeText3,
    image3,
  }`

  const data = await client.fetch(query)
  return data;
}
//export const dynamic = "force-dynamic";

async function HotDeals() {
  const data = await getData()

  return (
    <div>
      <div className="flex lg:flex-row flex-col px-3 gap-8 md:px-16 mt-8">
        <div className=" lg:w-1/2 w-full  md:px-10 md:py-5 p-4  rounded-xl
  bg-[#eceaea]  md:h-[250px] h-full flex flex-row  items-center">
          <div className="w-full text-left ">
            <p className=' text-gray-700 font-semibold text-base md:text-xl capitalize'>{data.smallText2}</p>
            <h3 className='md:text-2xl text-lg font-bold text-gray-900 capitalize'>{data.largeText2}</h3>
            <Button className='mt-2 md:mt-5 text-sm'>
              Shop Now
            </Button>
          </div>
          <div className="w-full ">
            <Image src={urlFor(data.image2).url()} alt="" width={350} height={350}  />
          </div>
        </div>

        <div className=" lg:w-1/2 w-full  md:px-10 md:py-5 p-4  rounded-xl
   bg-[#eceaea] md:h-[250px] h-full flex flex-row  items-center ">
          <div className="w-full text-left ">
            <p className=' text-gray-700 font-semibold text-base md:text-xl capitalize'>{data.smallText3}</p>
            <h3 className='md:text-2xl text-lg font-bold text-gray-900 capitalize'>{data.largeText3}</h3>
            <Button className='mt-2 md:mt-5 text-sm'>
              Shop Now
            </Button>
          </div>
          <div className="w-full ">
            <Image src={urlFor(data.image3).url()} alt="" width={350} height={350} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default HotDeals
