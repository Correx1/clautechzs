"use client"

import React, { useState } from "react"
import { Search } from "lucide-react"

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "Search products..."
}) => {
  const [query, setQuery] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    onSearch(value) // live search on each keystroke
  }

  return (
    <div className="w-full px-4 py-3 bg-gray-100 shadow ">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600" size={20} />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full rounded-full border-2 border-gray-400  pl-12 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#f97e27] focus:border-transparent"
        />
      </div>
    </div>
  )
}

export default SearchBar
