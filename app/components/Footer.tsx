import { Button } from '@/components/ui/button'
import { Mail, Phone} from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import Image from "next/image";

function Footer() {
  return (
    <div>

      <div className=' w-full text-center p-16 pt-8 my-10 gap-12 bg-[#edebeb] flex flex-col md:flex-row 
       justify-between items-center'>
        <div className=" flex flex-col text-center items-center pb-5 pt-2">
          <Image src="/assets/fav.png" width={150} height={150} alt='logo' />
          <p className=' text-sm font-bold text-gray-700'>Get the best at your comfort</p>
        </div>

        <div className=" ">
          <h2 className=' text-xl font-bold'>Contact Us</h2>
          <div className=" text-primary flex flex-row gap-x-2 pt-2">
            <Mail  />
            <p className='  font-semibold   text-xl'>info@clautechzs.com</p>

          </div>
        </div>

        <div className="mt-5">
          <h2 className=' text-xl font-bold'>Customer Care</h2>
          <p className=' italic text-base text-gray-700 pt-2'> <span className=' font-bold text-black normal-case'>Note:</span> This is only for failed or interupted checkout</p>
          <Link href="https://wa.link/d2brhe"><Button className=' mt-3'><Phone size={15} />Chat </Button></Link> 
       
        </div>
      </div>
      <p className=' text-center text-lg'>copywrite <span className=' text-primary font-semibold'> Clautechs</span> 2024</p>

    </div>
  )
}

export default Footer
