'use client'

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface LoaderLayoutProps {
  children: React.ReactNode;
}

const LoaderLayout: React.FC<LoaderLayoutProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set a shorter delay; adjust as needed.
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); 
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {loading && (
        <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-[#f8f8f8] overflow-x-hidden z-50">
          <div className="relative">
            <Image src="/assets/fav.png" alt="logo" width={80} height={80} className="mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute w-[200px] h-[200px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-[140px] w-[140px] border-t-4 border-b-4 border-[#f97e27]"></div>
              </div>
            </div>
          </div>
        </div>
      )}
      {!loading && children}
    </>
  );
};

export default LoaderLayout;
