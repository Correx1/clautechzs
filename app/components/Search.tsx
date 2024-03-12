import { Search } from 'lucide-react';
import React from 'react';

const SearchInput: React.FC<{ onSearch: (query: string) => void }> = ({ onSearch }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSearch(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // You can add search logic here if needed
    };

    return (
        <form onSubmit={handleSubmit} className=" flex flex-row items-center justify-center my-6 ">
            <input
                type="text"
                placeholder="Search..."
                onChange={handleChange}
                className="bg-gray-100 border border-[#f97e27] rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#f97e27] focus:border-transparent"
            />
            <button
                type="submit"
                className="  px-3 py-2 bg-[#f97e27] text-white font-bold rounded-r-md"
            >
                <Search/>
            </button>
        </form>
    );
};

export default SearchInput;