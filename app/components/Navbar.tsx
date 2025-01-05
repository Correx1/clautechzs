"use client"

import {  MenuIcon,  X, Search } from 'lucide-react'
import Link from "next/link"
import { usePathname } from 'next/navigation'
import React, { useState } from 'react'
import Image from "next/image";


function Navbar() {
const [menuBar, setMenuBar]=useState(false)

  const handleChange=() => {
    setMenuBar(!menuBar)
  }
const closeMenu=() =>{
setMenuBar(false)
}

  const menu = [
    { name: "Home", href: "/", id:1},
    { name: "Products", href: "/Products", id:2},
    { name: "Services", href: "/Services", id:3 },
  ]

  const pathname = usePathname();

  return (
    <div className="w-full">
    {/* Main Navbar */}
    <div
      className="flex flex-row font-semibold justify-between text-lg 
      md:px-24 px-10 bg-[#f97e27] shadow-[0_3px_10px_rgba(0,0,0,0.2)] z-[1000] fixed w-full top-0"
    >
      {/* Logo */}
      <div className="flex flex-row items-start cursor-pointer py-2 bg-[#f97e27] w-auto">
        <Image src="/assets/logo.png" alt="logo" width={80} height={40} />
      </div>
  
      {/* Desktop Navigation */}
      <nav className="hidden md:flex gap-5 flex-row items-center justify-center md:gap-x-10">
        {menu.map((menuItem) => (
          <div
            key={menuItem.id}
            className={
              pathname === menuItem.href
                ? "cursor-pointer bg-[#E3e3e3] h-full flex flex-row items-center justify-center px-5 text-primary"
                : "text-[#E3e3e3] bg-transparent h-full flex flex-row items-center justify-center px-5 cursor-pointer"
            }
          >
            <Link href={menuItem.href}>{menuItem.name}</Link>
          </div>
        ))}
      </nav>
  
      {/* Desktop Search */}
      <div className="hidden md:flex flex-row text-[#E3e3e3] text-center items-center justify-center">
        <Link href={"/Search"} className="flex flex-row gap-x-2">
          <Search /> Search
        </Link>
      </div>
  
      {/* Mobile Menu Toggle */}
      <div className="md:hidden flex items-center text-[#E3e3e3]">
        {menuBar ? (
          <X size={32} onClick={handleChange} className="cursor-pointer" />
        ) : (
          <MenuIcon size={32} onClick={handleChange} className="cursor-pointer" />
        )}
      </div>
    </div>
  
    {/* Mobile Dropdown */}
    <div
      className={`${
        menuBar ? "translate-y-0" : "-translate-y-full"
      } lg:hidden flex flex-col fixed top-[60px] left-0 bg-[#f97e27] text-[#E3e3e3] text-center w-full gap-4 pt-4 pb-4 transition-all duration-300 z-[999]`}
    >
      {menu.map((menuItem) => (
        <div
          key={menuItem.id}
          className={
            pathname === menuItem.href
              ? "py-2 cursor-pointer bg-[#E3e3e3] items-center justify-center px-2 text-primary"
              : "py-2 text-[#E3e3e3] bg-transparent items-center justify-center px-2 cursor-pointer"
          }
          onClick={closeMenu}
        >
          <Link href={menuItem.href}>{menuItem.name}</Link>
        </div>
      ))}
      <div className="flex flex-row text-[#E3e3e3] text-center items-center justify-center pt-2">
        <Link href={"/Search"} className="flex flex-row gap-x-2">
          <Search /> Search
        </Link>
      </div>
    </div>
  </div>
  
  )
}


export default Navbar
 