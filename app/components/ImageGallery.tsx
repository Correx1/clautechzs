"use client";
import { useState } from "react";
import Image from "next/image";
import { urlFor } from "../lib/sanity";


interface iAppProps {
  images: any;
}

export default function ImageGallery({ images }: iAppProps) {
  const [bigImage, setBigImage] = useState(images[0]);

  const handleSmallImageClick = (image: any) => {
    setBigImage(image);
  };
  return (
      <div className="flex flex-col overflow-x-hidden">
         
          <div>
              <div className="relative overflow-x-hidden p-2 items-center justify-center  shadow-[rgba(0,_0,_0,0.24)_0px_3px_6px] rounded-lg bg-[#f5f5f5]">
                  <Image
                      src={urlFor(bigImage).url()}
                      alt="Big Photo"
                      width={300}
                      height={300}
                      className=" object-cover h-[300px]  object-center"
                  />

                  <span className="absolute right-0 top-0 bg-[#f97e27]  py-1 px-2 text-xs rounded-tr-md  tracking-wider text-white">
                      Sale
                  </span>
              </div>
        </div>
      

          <div className="  flex lg:gap-4 gap-2 pt-5 py-3">
              {images.map((image: any, idx: any) => (
                  <div key={idx} className=" p-2 bg-[#f5f5f5]  shadow-[rgba(0,_0,_0,0.16)_0px_3px_4px] lg:rounded-lg rounded-sm flex">
                      <Image
                          src={urlFor(image).url()}
                          width={100}
                          height={100}
                          alt="Small Photo"
                          className=" cursor-pointer h-[100px]"
                          onClick={() => handleSmallImageClick(image)}
                      />
                  </div>
              ))}
          </div>
      </div>
  );
}
