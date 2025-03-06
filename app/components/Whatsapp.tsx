"use client";

import React from "react";
import Link from "next/link";
import {LucidePhoneCall } from "lucide-react";

interface FloatingWhatsappButtonProps {
  phoneNumber: string; // e.g. "2348012345678"
  message?: string;
}

const FloatingWhatsappButton: React.FC<FloatingWhatsappButtonProps> = ({
  phoneNumber,
  message = "Hello, I'm contacting Clautechzs regarding ....... Could you please assist me?",
}) => {
  // Construct the WhatsApp URL with encoded message
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message
  )}`;

  return (
    <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer">
      <button className=" cursor-pointer fixed bottom-20 right-2 z-50 bg-green-500 hover:bg-green-600 text-white p-2 rounded-full shadow-lg flex items-center justify-center">
        <LucidePhoneCall size={22} />
      </button>
    </Link>
  );
};

export default FloatingWhatsappButton;
