"use client";

import React, { useState, FormEvent, ChangeEvent } from 'react';
import Image from 'next/image';
import { FormData, FormErrors, RequestData } from '@/app/Interface';
import { Button } from '@/components/ui/button';
import Footer from '@/app/components/Footer';
import { db, storage } from "@/app/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 } from 'uuid'
import { useToast } from "@/components/ui/use-toast"
import CartIcon from '../components/CartIcon';
import Navbar from '@/app/components/Navbar'




function Page() {
  const { toast } = useToast()
  const [formData, setFormData] = useState<FormData>({
    description: '',
    image: '',
    personName: '',
    email: '',
    phone: '',
    size: '',
    clothSize: '',

  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateFileSize = (fileSize: number): boolean => {
    const maxSize = 6 * 1024 * 1024; // 6MB
    return fileSize <= maxSize;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
  
    // Validate all fields
    const newErrors: FormErrors = {};
    if (!formData.description) {
      newErrors.description = 'Provide a description';
    }
    if (!formData.personName) {
      newErrors.personName = 'Please enter your full name';
    }
    if (!formData.email || !validateEmail(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.phone || !/^\d{11,}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }
    if (!formData.image || !formData.image.size) {
      newErrors.image = 'Please upload an image';
    } else if (!validateFileSize(formData.image.size)) {
      newErrors.image = 'Image size must be less than 6MB';
    }
    if (formData.size.trim() !== '' && (isNaN(Number(formData.size)) || Number(formData.size) < 32 || Number(formData.size) > 48)) {
      newErrors.size = 'Shoe size must be a number between 32 and 48';
    }
    if (formData.clothSize.trim() !== '' && !['sm', 'md', 'lg', 'xl', 'xxl'].includes(formData.clothSize.toLowerCase())) {
      newErrors.clothSize = 'Invalid size. Choose from sm, md, lg, xl, xxl.';
    }

    // Set errors or submit the form
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
    
      try {
        let imageURL = '';
        if (formData.image) {
          const imageRef = ref(storage, `images/${formData.image.name + v4()}`);
          await uploadBytes(imageRef, formData.image);
          imageURL = await getDownloadURL(imageRef);
        }

        // Declare requestData before using it
        const requestData: RequestData = {
          Description: formData.description,
          Image: imageURL,
          Name: formData.personName,
          Email: formData.email,
          Phone: formData.phone,
          Shoe_Size: formData.size,
          Cloth_Size: formData.clothSize,
          createdAt: serverTimestamp()
        };

        // Use the Name field as the document ID
        await addDoc(collection(db, "Requests"), {
          ...requestData,
          createdAt: serverTimestamp(),
        });

        toast({
          description: "Request Submitted Succesfully ",
        })

      } catch (error) {
        console.error("Error adding document: ", error);
        toast({
          description: "An unknown error occurred. Please try again later"
        });
      }

      // Clear the form after successful submission
      setFormData({
        description: '',
        image: '',
        personName: '',
        email: '',
        phone: '',
        size: '',
        clothSize: '',
      });
    }
  }
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Clear error message when the user starts typing
    if (errors[e.target.name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      });
    }
  };


  return (
    <div className='bg-[#f8f8f8] overflow-x-hidden'>
      <Navbar/>
  <CartIcon/>
      <div className=' lg:px-10 px-2'>
        <div className="w-full lg:px-12 px-4 lg:py-10 py-5 bg-[#efeded]  rounded-lg">
          <div className="items-center justify-center flex  w-auto ">
            <Image src="/assets/fav.png" alt='logo' width={100} height={100} priority={true} className=' w-auto' />
          </div>
          <h2 className="text-base lg:text-xl uppercase text-gray-700 font-bold text-center pb-4">Make a request for a specific item or service</h2>

          <form className="" onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-base font-bold mb-2" htmlFor="description">
                Description
              </label>
              <textarea
                className={`border resize-none rounded w-full py-3 px-3 text-gray-800 text-base placeholder:text-gray-400 outline-[#f99b57] border-none bg-[#fff] shadow-[rgba(0,_0,_0,0.24)_0px_3px_4px] ${errors.description && 'border-red-500'}`}
                id="description"
                name="description"
                placeholder="Describe what you need"
                value={formData.description}
                onChange={handleChange}
              ></textarea>
              {errors.description && <p className="text-red-500  text-sm mt-1">Provide a description</p>}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-base font-bold mb-2" htmlFor="image">
                Image Upload
              </label>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                className={`border resize-none rounded w-full py-3 px-3 text-gray-800 text-base placeholder:text-gray-400 outline-[#f99b57]
                 border-none bg-[#fff] shadow-[rgba(0,_0,_0,0.24)_0px_3px_4px] ${errors.image && 'border-red-500'}`}
                onChange={(e) => {
                  const files = (e.target as HTMLInputElement).files;
                  if (files && files.length > 0) {
                    const file = files[0];
                    setFormData({
                      ...formData,
                      image: file,
                    });
                    if (file && !validateFileSize(file.size)) {
                      setErrors({
                        ...errors,
                        image: 'Image size should be less than 6MB',
                      });
                    } else {
                      setErrors({
                        ...errors,
                        image: '',
                      });
                    }
                  }
                }}
              />
              {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-base font-bold mb-2" htmlFor="personName">
                Name
              </label>
              <input
                className={`border rounded w-full py-3 px-3 text-gray-800 text-base placeholder:text-gray-400 outline-[#f99b57] border-none bg-[#fff] shadow-[rgba(0,_0,_0,0.24)_0px_3px_4px] ${errors.personName && 'border-red-500'}`}
                type="text"
                id="personName"
                name="personName"
                placeholder="Your name"
                value={formData.personName}
                onChange={handleChange}
              />
              {errors.personName && <p className="text-red-500  text-sm mt-1">Please enter your full name</p>}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-base font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                className={`border rounded w-full py-3 px-3 text-gray-800 text-base placeholder:text-gray-400 outline-[#f99b57] border-none bg-[#fff] shadow-[rgba(0,_0,_0,0.24)_0px_3px_4px] ${errors.email && 'border-red-500'}`}
                type="email"
                id="email"
                name="email"
                placeholder="Your email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <p className="text-red-500  text-sm mt-1">Invalid email address</p>}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-base font-bold mb-2" htmlFor="phone">
                Contact
              </label>
              <input
                className={`border rounded w-full py-3 px-3 text-gray-800 text-base placeholder:text-gray-400 outline-[#f99b57] border-none bg-[#fff] shadow-[rgba(0,_0,_0,0.24)_0px_3px_4px] ${errors.phone && 'border-red-500'}`}
                type="number"
                id="phone"
                name="phone"
                placeholder="Phone number"
                value={formData.phone}
                onChange={handleChange}
              />
              {errors.phone && <p className="text-red-500  text-sm mt-1">Invalid phone no.</p>}
            </div>

            <div>
              <h1 className="italic mt-3 mb-1" >Only fill if its either shoes or clothes</h1>
              <div className="mb-4 flex flex-row w-full gap-4 ">
                <div>
                  <label className="block text-gray-700 text-base font-bold mb-2" htmlFor="size">
                    shoes (32-48)
                  </label>
                  <input
                    className={`border rounded w-full py-3 px-3 text-gray-800 text-base placeholder:text-gray-400 outline-[#f99b57] border-none bg-[#fff] shadow-[rgba(0,_0,_0,0.24)_0px_3px_4px] ${errors.size && 'border-red-500'}`}
                    type="tel"
                    id="size"
                    name="size"
                    placeholder="Shoes only"
                    value={formData.size}
                    onChange={handleChange}
                  />
                  {errors.size && <p className="text-red-500  text-sm mt-1">{errors.size}</p>}
                </div>


                <div>
                  <label className="block text-gray-700 text-base font-bold mb-2" htmlFor="size">
                    clothes(sm,md,lg,xl,xxl)
                  </label>
                  <input
                    className={`border rounded w-full py-3 px-3 text-gray-800 text-base placeholder:text-gray-400 outline-[#f99b57] border-none bg-[#fff] shadow-[rgba(0,_0,_0,0.24)_0px_3px_4px] ${errors.size && 'border-red-500'}`}
                    type="text"
                    id="clothSize"
                    name="clothSize"
                    placeholder="Clothes only"
                    value={formData.clothSize}
                    onChange={handleChange}
                  />
                  {errors.clothSize && <p className="text-red-500  text-sm mt-1">Select from the above listed sizes</p>}
                </div>

              </div>
            </div>

            <Button className="mb-4 items-center justify-center" type="submit">Submit</Button>

          </form>
        </div>
      </div>
        <Footer />
    </div>
  );
}

export default Page;
