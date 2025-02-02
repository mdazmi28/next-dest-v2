'use client'

import React, { useState, useRef, useEffect } from 'react';
import { FaSearch } from "react-icons/fa";

const SearchBoxWithSuggestions = ({ data, onFilter }) => {
    const [query, setQuery] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);

    const handleChange = (event) => {
        const searchQuery = event.target.value;
        setQuery(searchQuery);
        setIsSuggestionsOpen(searchQuery.length > 0); // Open suggestions if query is not empty

        const results = data.filter((item) => {
            const searchString = `${item.name} ${item.designation} ${item.email} ${item.phone}`;
            // ${item.organization.name} ${item.organization.address} ${item.organization.email} ${item.organization.web} ${item.organization.phone}
            return searchString.toLowerCase().includes(searchQuery.toLowerCase());
        });

        setFilteredData(results);

        // Passing the filtered data to the parent component (e.g., App or parent container)
        onFilter(results);
    };

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
                inputRef.current && !inputRef.current.contains(event.target)
            ) {
                setIsSuggestionsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative">

            <label className="input input-bordered input-info w-full max-w-xs flex items-center gap-2">
            <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleChange}
                placeholder="Search..."
                className='p-2 rounded z-50'
            />
                <FaSearch/>
            </label>
            {/* <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleChange}
                placeholder="Search..."
                className={`border p-2 rounded z-50`}
            /> */}
            {isSuggestionsOpen && filteredData.length > 0 && (
                <ul
                    ref={suggestionsRef}
                    className="absolute z-50 mt-1 w-full bg-white border rounded shadow-md max-h-60 overflow-y-auto"
                >
                    {filteredData.map((item) => (
                        <li key={item.contact_id} className="p-2 cursor-pointer hover:bg-gray-200">
                            {item.name} - {item.email} 
                            {/* ({item.organization.name}) */}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchBoxWithSuggestions;
