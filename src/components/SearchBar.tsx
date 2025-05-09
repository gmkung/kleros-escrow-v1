
import { useState, useEffect, useRef } from 'react';
import { debounce } from '../lib/utils';

interface SearchBarProps {
  onSearch: (term: string) => void;
  className?: string;
}

// Define a type for the debounced function that includes cancel method
interface DebouncedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): ReturnType<T>;
  cancel: () => void;
}

const SearchBar = ({ onSearch, className = '' }: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Create a debounced search function with the appropriate type
  const debouncedSearch = useRef<DebouncedFunction<typeof onSearch>>(
    debounce((term: string) => {
      onSearch(term);
    }, 300)
  ).current;
  
  useEffect(() => {
    debouncedSearch(searchTerm);
    
    // Cleanup
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, debouncedSearch]);
  
  return (
    <div className={`relative ${className}`}>
      <div 
        className={`relative transition-all duration-300 ${
          isFocused 
            ? 'shadow-[0_0_15px_rgba(139,92,246,0.5)]' 
            : ''
        }`}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Search by title, description or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full py-3 pl-12 pr-4 rounded-xl border outline-none transition-all duration-300 ${
            isFocused 
              ? 'bg-slate-800/90 border-violet-500/50 text-violet-100' 
              : 'bg-slate-900/70 backdrop-blur-sm border-violet-500/30 text-violet-200 hover:bg-slate-800/80'
          } placeholder:text-violet-300/60`}
        />
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={`transition-colors duration-300 ${
              isFocused 
                ? 'text-violet-400' 
                : 'text-violet-400/70'
            }`}
          >
            <path 
              d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              inputRef.current?.focus();
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-violet-400/70 hover:text-violet-300"
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M18 6L6 18M6 6L18 18" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
