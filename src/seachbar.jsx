import { useState } from "react";
import { Search, X, Filter, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { getCollegeSuggestions } from "./utils/collegeUtils";

export default function SearchBar({ onSearch, onCollegeFilter, showFilters = false }) {
  const [query, setQuery] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("");
  const [showCollegeSuggestions, setShowCollegeSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const handleSearch = (e) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };

  const handleCollegeFilter = (e) => {
    const value = e.target.value;
    setCollegeFilter(value);
    
    if (value.length >= 2) {
      const collegeSuggestions = getCollegeSuggestions(value, 8);
      setSuggestions(collegeSuggestions);
      setShowCollegeSuggestions(true);
    } else {
      setShowCollegeSuggestions(false);
      setSuggestions([]);
    }
    
    if (onCollegeFilter) {
      onCollegeFilter(value);
    }
  };

  const selectCollege = (college) => {
    setCollegeFilter(college);
    setShowCollegeSuggestions(false);
    if (onCollegeFilter) {
      onCollegeFilter(college);
    }
  };

  return (
    <motion.div 
      className="relative w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="space-y-3">
        {/* Search Input */}
        <div className="flex items-center bg-white shadow-lg rounded-2xl p-3">
          <Search className="text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Search for products..."
            value={query}
            onChange={handleSearch}
            className="w-full px-3 py-2 text-gray-700 outline-none bg-transparent"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          )}
        </div>

        {/* College Filter */}
        {showFilters && (
          <div className="relative">
            <div className="flex items-center bg-white shadow-lg rounded-2xl p-3">
              <MapPin className="text-gray-500" size={20} />
              <input
                type="text"
                placeholder="Filter by college..."
                value={collegeFilter}
                onChange={handleCollegeFilter}
                className="w-full px-3 py-2 text-gray-700 outline-none bg-transparent"
              />
              {collegeFilter && (
                <button 
                  onClick={() => {
                    setCollegeFilter("");
                    if (onCollegeFilter) onCollegeFilter("");
                  }} 
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* College Suggestions Dropdown */}
            {showCollegeSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => selectCollege(suggestion)}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
