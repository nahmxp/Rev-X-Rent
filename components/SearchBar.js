import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const router = useRouter();

  // Handle search input change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length > 1) {
        performSearch();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset search when route changes
  useEffect(() => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  }, [router.asPath]);

  // Search products from the API
  const performSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      setResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle key press for search
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      performSearch();
    }
  };

  return (
    <div className="search-container" ref={searchRef}>
      <div className="search-input-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim().length > 1 && setShowResults(true)}
        />
        <button
          className="search-button"
          onClick={performSearch}
          disabled={isSearching}
        >
          {isSearching ? (
            <span className="search-loading"></span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          )}
        </button>
      </div>

      {showResults && results.length > 0 && (
        <div className="search-results">
          {results.map((product) => (
            <Link 
              href={`/product/${product._id}`} 
              key={product._id}
              onClick={() => setShowResults(false)}
            >
              <div className="search-result-item">
                <div className="search-result-image">
                  <img src={product.image || 'https://via.placeholder.com/50'} alt={product.name} />
                </div>
                <div className="search-result-info">
                  <h4>{product.name}</h4>
                  <p className="search-result-brand">{product.brand}</p>
                  <p className="search-result-price">${product.price}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showResults && query.trim().length > 1 && results.length === 0 && !isSearching && (
        <div className="search-results">
          <div className="search-no-results">
            No products found matching "{query}"
          </div>
        </div>
      )}
    </div>
  );
} 