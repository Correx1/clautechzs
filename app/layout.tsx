import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Cart from "./components/Cart";
import CartProvider from "./components/Provider";
import { Toaster } from "@/components/ui/toaster"
import LoaderLayout from "./components/Loader";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Clautechzs",
  description: "Clautechzs is an online one stop shop for all type of items, devices, accessories. Clautechs delivers orders and service to schools",
};  

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        
        <CartProvider>
          <Toaster />
            <Cart />         
          <LoaderLayout> {children}</LoaderLayout>
        </CartProvider>  
      </body>
    </html>
  );
}
