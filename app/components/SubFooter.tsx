import React from 'react'
import { ArrowDownCircleIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

function SubFooter() {
  return (
      <div className=' px-0 mt-12'>
          <div className=" rounded-lg  text-center items-center  
    bg-[#eceaea] h-fit gap-4 py-10 flex flex-col justify-center md:flex-row md:px-10 px-2 border-rounded">
              <div className="md:w-2/3 w-full">
                  <h2 className=" text-2xl text-gray-900 font-bold ">Make a Request for Specific Item or Services</h2>
                  < p className="text-gray-800 italic text-[14px] mt-1">Phone/Laptop repair, software and game installation and many others</p>

              </div>

              <div className="lg:w-1/3 w-full">
                  <Button className=''><Link href="/Services">Click Here </Link> <ArrowDownCircleIcon /></Button>
              </div>
          </div>
      </div>
  )
}

export default SubFooter
