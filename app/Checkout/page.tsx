"use client";
import React, { useState, FormEvent, ChangeEvent } from 'react';
import Navbar from '@/app/components/Navbar'
import { SecFormData, FormErrors, DeliveryData } from '@/app/Interface';
import { Button } from '@/components/ui/button';
import { db } from "@/app/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useSearchParams, useRouter } from 'next/navigation';
import { useShoppingCart } from "use-shopping-cart";
import { useToast } from '@/components/ui/use-toast';
import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3";





function Page() {
  const { toast } = useToast()
  const { clearCart } = useShoppingCart();
  const searchParams = useSearchParams();
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false); // Track submission state

  const [formData, setSecFormData] = useState<SecFormData>({
    personName: '',
    email: '',
    phone: '',
    location: '',
    size: '',
    clothSize: '',
  });


  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  function generateOrderNumber(): string {
    // Generate a random 5-digit number
    let randomNum = Math.floor(10000 + Math.random() * 90000);
    return "CL." + randomNum;
  }
  const orderNumber = generateOrderNumber();
  const itemsString = searchParams.get("items") ?? "[]";
  const totalPriceString = searchParams.get("totalPrice") ?? "0";
  // Parse the items string into an array of items
  const items = JSON.parse(itemsString) as { name: string; quantity: number }[];
  const totalPrice = parseFloat(totalPriceString);

  const config: any = {
    public_key: process.env.NEXT_PUBLIC_FLUTTER,
    tx_ref: orderNumber,
    amount: totalPrice,
    currency: "NGN",
    payment_options: "card,mobilemoney,ussd",
    redirect_url: "/success",
    customer: {
      email: formData.email,
      phone_number: formData.phone,
      name: formData.personName,
    },
    customizations: {
      title: "Clautechzs",
      description: "Payment for items in cart",
    },
  };

  const handleFlutterPayment = useFlutterwave(config);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (submitting) {
      return; // Prevent multiple submissions
    }

    setSubmitting(true); // Set submission state to true


    // Validate all fields
    const newErrors: FormErrors = {};

    if (!formData.personName) {
      newErrors.personName = 'Please enter your full name';
    }

    if (!formData.email || !validateEmail(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.phone || !/^\d{11,}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }

    if (!formData.location) {
      newErrors.location = 'Provide a delivery location';
    }
    if (formData.size.trim() !== '' && (isNaN(Number(formData.size)) || Number(formData.size) < 32 || Number(formData.size) > 50)) {
      newErrors.size = 'Shoe size must be a number between 32 and 50';
    }

    if (formData.clothSize.trim() !== '' && !['s', 'm', 'l', 'xl', 'xxl'].includes(formData.clothSize.toLowerCase())) {
      newErrors.clothSize = 'Invalid size. Choose from s, m, l, xl, xxl.';
    }

   

    // Set errors or submit the form
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const DeliveryData: DeliveryData = {
          Name: formData.personName,
          Email: formData.email,
          Phone: formData.phone,
          location: formData.location,
          Shoe_Size: formData.size,
          Cloth_Size: formData.clothSize,
          createdAt: serverTimestamp(),
          items,
          totalPrice,
          orderNumber,
        
        };

        await addDoc(collection(db, "Orders"), { ...DeliveryData });

        const googleSheetData = {
          personName: formData.personName,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
          size: formData.size,
          clothSize: formData.clothSize,
          items: JSON.stringify(items),
          totalPrice,
          orderNumber,
         
        };

        const scriptURL =process.env.NEXT_PUBLIC_GOOGLE_SHEET_SCRIPT_URL || "";
        await fetch(scriptURL, {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(googleSheetData),
        });

        handleFlutterPayment({
          callback: (response) => {
            console.log(response);
            closePaymentModal();
          },
          onClose: () => {},
        });
  

      
      // Show success toast
      toast({
        title: "Order Submitted Successfully",
        description: `Your order has been submitted.✅`,
        duration: 3000,
 
      });

      // Clear form and reset cart
      setSecFormData({
        personName: '',
        email: '',
        phone: '',
        location: '',
        size: '',
        clothSize: '',
     
      });

     // clearCart(); // Clear the cart after submission



    } catch (error) {
      console.error("Error during submission:", error);

      // Show error toast
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your order. Please try again.",
        duration: 3000,
      });
    } finally {
      setSubmitting(false); // Reset submission state
    }
  } else {
    setSubmitting(false); // Reset submission state if validation fails
  }
};


  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    setSecFormData({
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

    <div className='overflow-x-hidden mt-10'>
      <Navbar />
      <div className="w-full lg:px-12 px-4 lg:py-10 py-5 bg-[#efeded]  rounded-lg">

        <div className=' text-center py-4'>
          <p className='text-lg text-gray-800 font-semibold'> Order No: {orderNumber} </p>
          <span className=' italic text-sm'> Required on delivery</span>
        </div>
        <div className=' px-6'>
          <h1 className=' text-lg text-gray-700 font-bold'>Items</h1>
          <ul>
            {items.map((item, index) => (
              <li key={index}
                className=' text-lg'
              >
                {item.quantity} {item.name}

              </li>
            ))}
          </ul>
          <p className='py-2 text-lg text-gray-800 font-bold'>Total price: ₦{totalPrice.toFixed(2)}</p>
        </div>

        <form className="" onSubmit={handleSubmit}>
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


          <div className="mb-4">
            <label className="block text-gray-700 text-base font-bold mb-2" htmlFor="location">
              Delivery Location
            </label>
            <input
              className={`border rounded w-full py-3 px-3 text-gray-800 text-base placeholder:text-gray-400 outline-[#f99b57] border-none bg-[#fff] shadow-[rgba(0,_0,_0,0.24)_0px_3px_4px] ${errors.location && 'border-red-500'}`}
              type="text"
              id="location"
              name="location"
              placeholder="Your preferred delivery location"
              value={formData.location}
              onChange={handleChange}
            />
            {errors.location && <p className="text-red-500  text-sm mt-1">Please enter your preferred delivery location</p>}
          </div>

          <div>
            <h1 className="italic mt-2 mb-1" >Only fill if its either shoes or clothes</h1>
            <div className="mb-4 flex flex-row w-full gap-3 sm:ga">
              <div>
                <label className="block text-gray-700 text-base font-bold mb-2" htmlFor="size">
                (32-48)
                </label>
                <input
                  className={`border rounded w-full py-3 px-3 text-gray-800 text-base placeholder:text-gray-400 outline-[#f99b57] border-none bg-[#fff] shadow-[rgba(0,_0,_0,0.24)_0px_3px_4px] ${errors.size && 'border-red-500'}`}
                  type="tel"
                  id="size"
                  name="size"
                  placeholder="For shoes "
                  value={formData.size}
                  onChange={handleChange}
                />
                {errors.size && <p className="text-red-500  text-sm mt-1">{errors.size}</p>}
              </div>


              <div>
                <label className="block text-gray-700 text-base font-bold mb-2" htmlFor="size">
                  (s, m, l, xl, xxl.)
                </label>
                <input
                  className={`border rounded w-full py-3 px-3 text-gray-800 text-base placeholder:text-gray-400 outline-[#f99b57] border-none bg-[#fff] shadow-[rgba(0,_0,_0,0.24)_0px_3px_4px] ${errors.size && 'border-red-500'}`}
                  type="text"
                  id="clothSize"
                  name="clothSize"
                  placeholder="For clothes"
                  value={formData.clothSize}
                  onChange={handleChange}
                />
                {errors.clothSize && <p className="text-red-500  text-sm mt-1">Select from the above listed sizes</p>}
              </div>

            </div>
          </div>


          <Button disabled={submitting} className="mb-4 items-center justify-center" type="submit">
            {submitting ? "Processing..." : "Proceed with Payment"}
          </Button>

          
        </form>
      </div>
    </div>


  );
}

export default Page;







