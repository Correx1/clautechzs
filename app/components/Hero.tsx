import { Button } from '@/components/ui/button'
import { client, urlFor } from "@/app/lib/sanity";
import Image from 'next/image';



async function getData() {
  const query = `*[_type =='Banner'][0]{
_id,
smallText1,
largeText1,
image1,
  }`

  const data = await client.fetch(query)
  return data;
}

async function Hero() {
const data = await getData()

  return (
    <div>
      <div className="md:px-6 px-2 py-4 mt-16">
        <div className="w-full   md:py-5 lg:p-12 md:p-6 py-3  rounded-xl
    bg-[#eceaea]  md:h-[350px] h-full flex flex-row  items-center justify-around lg:gap-x-36 ">
          <div className="w-full text-left lg:ml-16 ml-4 ">
            <p className=' text-gray-600 font-bold text-sm md:text-xl lg:uppercase capitalize'>{data.smallText1}</p>
            <h3 className='md:text-3xl text-base font-bold text-gray-800 lg:uppercase capitalize'>{data.largeText1}</h3>
            <Button className='mt-2 md:mt-5 text-sm sm:hidden md:block'>
              Shop Now
            </Button>
  
          </div>
          <div className="w-full justify-end lg:-mr-20 -mr">
            <Image src={urlFor(data.image1).url()} alt="" width={350} height={350} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
