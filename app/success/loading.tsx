
'use client'


import React from 'react';
import Image from 'next/image';
interface LoaderLayoutProps {
    children: React.ReactNode;
}

const LoaderLayout: React.FC<LoaderLayoutProps> = ({ children }) => {
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 4000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div>
            {loading ? (
                <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-[#f8f8f8] overflow-x-hidden z-50">
                    <div className="relative">
                        <Image src="/assets/fav.png" alt="logo" width={80} height={80} className="mx-auto" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="absolute  w-[200] h-[200] flex items-center justify-center">
                                <div className="animate-spin rounded-full h-[140px] w-[140px] border-t-4 border-b-4 border-[#f97e27]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div>{children}</div>
            )}
        </div>
    );
};

export default LoaderLayout;
