import { useState } from "react";
import { Search, X } from "lucide-react";
import { motion } from "framer-motion";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <motion.div 
      className="relative w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
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
    </motion.div>
  );
}
