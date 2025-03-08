/* eslint-disable react-hooks/rules-of-hooks */
// /app/checkout/page.tsx
"use client";
import React, { useState, FormEvent, ChangeEvent } from 'react';
import CheckoutNav from '@/app/components/CheckoutNav';
import { SecFormData, FormErrors } from '@/app/Interface';
import { useSearchParams, useRouter } from 'next/navigation';
import { useShoppingCart } from "use-shopping-cart";
import { useToast } from '@/components/ui/use-toast';
import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3";
import Image from 'next/image';
import { Button } from '@/components/ui/button';

function Page() {
  const { toast } = useToast();
  const router = useRouter();
  const { clearCart } = useShoppingCart();
  const searchParams = useSearchParams();
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

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

  // Generate a random order number
  function generateOrderNumber(): string {
    let randomNum = Math.floor(100000 + Math.random() * 900000);
    return "CL." + randomNum;
  }
  
  const orderNumber = generateOrderNumber();
  const itemsString = searchParams.get("items") ?? "[]";
  const totalPriceString = searchParams.get("totalPrice") ?? "0";
  const items = JSON.parse(itemsString) as { name: string; quantity: number }[];
  const totalPrice = parseFloat(totalPriceString);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    // Validate form fields
    const newErrors: FormErrors = {};
    if (!formData.personName) newErrors.personName = 'Please enter your full name';
    if (!formData.email || !validateEmail(formData.email)) newErrors.email = 'Invalid email address';
    if (!formData.phone || !/^\d{11,}$/.test(formData.phone)) newErrors.phone = 'Invalid phone number';
    if (!formData.location) newErrors.location = 'Provide a delivery location';
    if (
      formData.size.trim() !== '' &&
      (isNaN(Number(formData.size)) || Number(formData.size) < 32 || Number(formData.size) > 50)
    ) newErrors.size = 'Shoe size must be a number between 32 and 50';
    if (
      formData.clothSize.trim() !== '' &&
      !['s', 'm', 'l', 'xl', 'xxl'].includes(formData.clothSize.toLowerCase())
    ) newErrors.clothSize = 'Invalid size. Choose from s, m, l, xl, xxl.';

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      try {
        // Build the customer/order data to pass in meta
        const customerData = {
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

        // Configure Flutterwave payment with meta data carrying order details.
        const config: any = {
          public_key: process.env.NEXT_PUBLIC_FLUTTER || process.env.FLUTTER , // defined in your .env.local
          tx_ref: orderNumber,
          amount: totalPrice,
          currency: "NGN",
          payment_options: "card,mobilemoney,ussd",
          redirect_url: "/success", // User will be redirected here after payment
          customer: {
            email: formData.email,
            phone_number: formData.phone,
            name: formData.personName,
          },
          meta: {
            ...customerData,
          },
          customizations: {
            title: "Clautechzs",
            description: "Payment for items in cart",
          },
        };

        const handleFlutterPayment = useFlutterwave(config);
        handleFlutterPayment({
          callback: (response) => {
            console.log(response);
            closePaymentModal();
          },
          onClose: () => {
            setSubmitting(false);
          },
        });
      } catch (error) {
        console.error("Error during submission:", error);
        toast({
          title: "Submission Failed",
          description: "There was an error submitting your order. Please try again.",
          duration: 3000,
        });
        setSubmitting(false);
      }
    } else {
      setSubmitting(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    setSecFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      });
    }
  };

  return (
    <div className='overflow-x-hidden mb-20'>
      <CheckoutNav />
      <div className="w-full md:px-8 px-2 md:py-6 py-3 bg-gray-100 rounded-lg">
        <div className="flex items-center justify-center">
          <Image src="/assets/fav.png" alt="logo" width={100} height={100} priority className="w-auto" />
        </div>
        <div className="text-center py-4">
          <p className="text-lg text-gray-800 font-semibold">Order No: {orderNumber}</p>
          <span className="italic text-sm">Required on delivery</span>
        </div>
        <div className="px-6">
          <h1 className="text-lg text-gray-700 font-bold">Items</h1>
          <ul>
            {items.map((item, index) => (
              <li key={index} className="text-lg">
                {item.quantity} {item.name}
              </li>
            ))}
          </ul>
          <p className="py-2 text-lg text-gray-800 font-bold">
            Total price: ₦{totalPrice.toFixed(2)}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="mb-4">
            <label htmlFor="personName" className="block text-gray-700 text-base font-bold mb-2">
              Name
            </label>
            <input
              type="text"
              id="personName"
              name="personName"
              placeholder="Your name"
              value={formData.personName}
              onChange={handleChange}
              className="border rounded w-full py-3 px-3 text-gray-800 placeholder:text-gray-400 bg-white shadow"
            />
            {errors.personName && (
              <p className="text-red-500 text-sm mt-1">{errors.personName}</p>
            )}
          </div>
          {/* Email */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-base font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Your email"
              value={formData.email}
              onChange={handleChange}
              className="border rounded w-full py-3 px-3 text-gray-800 placeholder:text-gray-400 bg-white shadow"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          {/* Phone */}
          <div className="mb-4">
            <label htmlFor="phone" className="block text-gray-700 text-base font-bold mb-2">
              Contact
            </label>
            <input
              type="number"
              id="phone"
              name="phone"
              placeholder="Phone number"
              value={formData.phone}
              onChange={handleChange}
              className="border rounded w-full py-3 px-3 text-gray-800 placeholder:text-gray-400 bg-white shadow"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>
          {/* Location */}
          <div className="mb-4">
            <label htmlFor="location" className="block text-gray-700 text-base font-bold mb-2">
              Delivery Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              placeholder="Your preferred delivery location"
              value={formData.location}
              onChange={handleChange}
              className="border rounded w-full py-3 px-3 text-gray-800 placeholder:text-gray-400 bg-white shadow"
            />
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">{errors.location}</p>
            )}
          </div>
          {/* Optional: Shoe Size / Cloth Size */}
          <div>
            <h1 className="italic mt-2 mb-1">Only fill if it’s either shoes or clothes</h1>
            <div className="mb-4 flex flex-row w-full gap-3">
              <div>
                <label htmlFor="size" className="block text-gray-700 text-base font-bold mb-2">
                  (32-48)
                </label>
                <input
                  type="tel"
                  id="size"
                  name="size"
                  placeholder="For shoes"
                  value={formData.size}
                  onChange={handleChange}
                  className="border rounded w-full py-3 px-3 text-gray-800 placeholder:text-gray-400 bg-white shadow"
                />
                {errors.size && (
                  <p className="text-red-500 text-sm mt-1">{errors.size}</p>
                )}
              </div>
              <div>
                <label htmlFor="clothSize" className="block text-gray-700 text-base font-bold mb-2">
                  (s, m, l, xl, xxl)
                </label>
                <input
                  type="text"
                  id="clothSize"
                  name="clothSize"
                  placeholder="For clothes"
                  value={formData.clothSize}
                  onChange={handleChange}
                  className="border rounded w-full py-3 px-3 text-gray-800 placeholder:text-gray-400 bg-white shadow"
                />
                {errors.clothSize && (
                  <p className="text-red-500 text-sm mt-1">{errors.clothSize}</p>
                )}
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
