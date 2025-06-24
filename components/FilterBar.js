import { useState, useRef, useEffect } from 'react';
import PriceRangeFilter from './PriceRangeFilter';

export default function FilterBar({ 
  categories = [], 
  brands = [], 
  selectedCategories, 
  selectedBrands, 
  onCategoryChange, 
  onBrandChange,
  sortOption = 'default',
  onSortChange,
  showRentalOnly = false,
  onRentalToggle,
  priceRange = null,
  minPrice = 0,
  maxPrice = 1000,
  onPriceRangeChange = null
}) {
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  const categoryDropdownRef = useRef(null);
  const brandDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);
  
  // Determine if dropdowns should be displayed
  const showCategoryDropdown = categories && categories.length > 0;
  const showBrandDropdown = brands && brands.length > 0;
  const showPriceFilter = priceRange !== null && onPriceRangeChange !== null;

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // Filter brands based on search
  const filteredBrands = brands.filter(brand =>
    brand.toLowerCase().includes(brandSearch.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setCategoryDropdownOpen(false);
        setCategorySearch(''); // Clear search when closing
      }
      if (brandDropdownRef.current && !brandDropdownRef.current.contains(event.target)) {
        setBrandDropdownOpen(false);
        setBrandSearch(''); // Clear search when closing
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setSortDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle category dropdown
  const toggleCategoryDropdown = () => {
    setCategoryDropdownOpen(!categoryDropdownOpen);
    if (!categoryDropdownOpen) {
      setCategorySearch('');
    }
    setBrandDropdownOpen(false);
    setSortDropdownOpen(false);
  };

  // Toggle brand dropdown
  const toggleBrandDropdown = () => {
    setBrandDropdownOpen(!brandDropdownOpen);
    if (!brandDropdownOpen) {
      setBrandSearch('');
    }
    setCategoryDropdownOpen(false);
    setSortDropdownOpen(false);
  };

  // Toggle sort dropdown
  const toggleSortDropdown = () => {
    setSortDropdownOpen(!sortDropdownOpen);
    setCategoryDropdownOpen(false);
    setBrandDropdownOpen(false);
  };

  // Handle category selection with multi-select capability
  const handleCategoryChange = (category) => {
    let newSelection;
    
    if (category === 'all') {
      // If "All" is clicked, deselect everything else
      newSelection = ['all'];
    } else if (selectedCategories.includes(category)) {
      // If already selected, remove it (unless it's the last one)
      if (selectedCategories.length > 1) {
        newSelection = selectedCategories.filter(item => item !== category);
        // If we're removing all non-"all" items, select "all"
        if (newSelection.length === 0) {
          newSelection = ['all'];
        }
        // If "all" is in the selection along with other items, remove "all"
        if (newSelection.includes('all') && newSelection.length > 1) {
          newSelection = newSelection.filter(item => item !== 'all');
        }
      } else {
        // Can't deselect the last item
        newSelection = selectedCategories;
      }
    } else {
      // If not selected, add it and remove "all" if it's there
      if (selectedCategories.includes('all')) {
        newSelection = [category];
      } else {
        newSelection = [...selectedCategories, category];
      }
    }
    
    onCategoryChange(newSelection);
  };

  // Handle brand selection with multi-select capability
  const handleBrandChange = (brand) => {
    let newSelection;
    
    if (brand === 'all') {
      // If "All" is clicked, deselect everything else
      newSelection = ['all'];
    } else if (selectedBrands.includes(brand)) {
      // If already selected, remove it (unless it's the last one)
      if (selectedBrands.length > 1) {
        newSelection = selectedBrands.filter(item => item !== brand);
        // If we're removing all non-"all" items, select "all"
        if (newSelection.length === 0) {
          newSelection = ['all'];
        }
        // If "all" is in the selection along with other items, remove "all"
        if (newSelection.includes('all') && newSelection.length > 1) {
          newSelection = newSelection.filter(item => item !== 'all');
        }
      } else {
        // Can't deselect the last item
        newSelection = selectedBrands;
      }
    } else {
      // If not selected, add it and remove "all" if it's there
      if (selectedBrands.includes('all')) {
        newSelection = [brand];
      } else {
        newSelection = [...selectedBrands, brand];
      }
    }
    
    onBrandChange(newSelection);
  };

  // Handle sort option selection
  const handleSortChange = (option) => {
    onSortChange(option);
    setSortDropdownOpen(false);
  };

  // Format the filter button text
  const formatCategoryButtonText = () => {
    if (selectedCategories.includes('all')) {
      return 'All Categories';
    }
    if (selectedCategories.length === 1) {
      return selectedCategories[0];
    }
    return `${selectedCategories.length} Categories Selected`;
  };

  const formatBrandButtonText = () => {
    if (selectedBrands.includes('all')) {
      return 'All Brands';
    }
    if (selectedBrands.length === 1) {
      return selectedBrands[0];
    }
    return `${selectedBrands.length} Brands Selected`;
  };

  // Format sort option text
  const formatSortButtonText = () => {
    switch (sortOption) {
      case 'price-low-high':
        return 'Price: Low to High';
      case 'price-high-low':
        return 'Price: High to Low';
      case 'date-newest':
        return 'Date: Newest First';
      case 'date-oldest':
        return 'Date: Oldest First';
      default:
        return 'Sort By';
    }
  };

  return (
    <div className="filter-bar-container">
      <div className="filter-bar">
        <div className="filter-label">Filter by:</div>
        
        {/* Rental toggle filter */}
        {onRentalToggle && (
          <div className="filter-switch">
            <label className="rental-toggle">
              <span className="toggle-label">Rentable Only</span>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  checked={showRentalOnly}
                  onChange={() => onRentalToggle(!showRentalOnly)}
                />
                <span className="slider"></span>
              </div>
            </label>
          </div>
        )}
        
        {/* Category filter dropdown */}
        {showCategoryDropdown && (
          <div className="filter-dropdown" ref={categoryDropdownRef}>
            <button 
              className="filter-dropdown-button" 
              onClick={toggleCategoryDropdown}
              aria-haspopup="true"
              aria-expanded={categoryDropdownOpen}
            >
              <span>{formatCategoryButtonText()}</span>
              <span className="dropdown-arrow">▼</span>
            </button>
            
            {categoryDropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-header">Select Categories</div>
                
                <div className="dropdown-search">
                  <input 
                    type="text" 
                    placeholder="Search categories..." 
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                  />
                </div>
                
                <div className="dropdown-options">
                  <div 
                    className={`dropdown-option ${selectedCategories.includes('all') ? 'active' : ''}`}
                    onClick={() => handleCategoryChange('all')}
                  >
                    <div className="option-checkbox">
                      {selectedCategories.includes('all') && <span>✓</span>}
                    </div>
                    <span>All Categories</span>
                  </div>
                  
                  {filteredCategories.length === 0 ? (
                    <div className="dropdown-no-results">No matching categories</div>
                  ) : (
                    filteredCategories.map(category => (
                      <div 
                        key={category} 
                        className={`dropdown-option ${selectedCategories.includes(category) ? 'active' : ''}`}
                        onClick={() => handleCategoryChange(category)}
                      >
                        <div className="option-checkbox">
                          {selectedCategories.includes(category) && <span>✓</span>}
                        </div>
                        <span>{category}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Brand filter dropdown */}
        {showBrandDropdown && (
          <div className="filter-dropdown" ref={brandDropdownRef}>
            <button 
              className="filter-dropdown-button" 
              onClick={toggleBrandDropdown}
              aria-haspopup="true"
              aria-expanded={brandDropdownOpen}
            >
              <span>{formatBrandButtonText()}</span>
              <span className="dropdown-arrow">▼</span>
            </button>
            
            {brandDropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-header">Select Brands</div>
                
                <div className="dropdown-search">
                  <input 
                    type="text" 
                    placeholder="Search brands..." 
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                  />
                </div>
                
                <div className="dropdown-options">
                  <div 
                    className={`dropdown-option ${selectedBrands.includes('all') ? 'active' : ''}`}
                    onClick={() => handleBrandChange('all')}
                  >
                    <div className="option-checkbox">
                      {selectedBrands.includes('all') && <span>✓</span>}
                    </div>
                    <span>All Brands</span>
                  </div>
                  
                  {filteredBrands.length === 0 ? (
                    <div className="dropdown-no-results">No matching brands</div>
                  ) : (
                    filteredBrands.map(brand => (
                      <div 
                        key={brand} 
                        className={`dropdown-option ${selectedBrands.includes(brand) ? 'active' : ''}`}
                        onClick={() => handleBrandChange(brand)}
                      >
                        <div className="option-checkbox">
                          {selectedBrands.includes(brand) && <span>✓</span>}
                        </div>
                        <span>{brand}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Sort dropdown */}
        {onSortChange && (
          <div className="filter-dropdown sort-dropdown" ref={sortDropdownRef}>
            <button 
              className="filter-dropdown-button" 
              onClick={toggleSortDropdown}
              aria-haspopup="true"
              aria-expanded={sortDropdownOpen}
            >
              <span>{formatSortButtonText()}</span>
              <span className="dropdown-arrow">▼</span>
            </button>
            
            {sortDropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-header">Sort By</div>
                <div className="dropdown-options">
                  <div 
                    className={`dropdown-option ${sortOption === 'default' ? 'active' : ''}`}
                    onClick={() => handleSortChange('default')}
                  >
                    <span>Default</span>
                  </div>
                  <div 
                    className={`dropdown-option ${sortOption === 'price-low-high' ? 'active' : ''}`}
                    onClick={() => handleSortChange('price-low-high')}
                  >
                    <span>Price: Low to High</span>
                  </div>
                  <div 
                    className={`dropdown-option ${sortOption === 'price-high-low' ? 'active' : ''}`}
                    onClick={() => handleSortChange('price-high-low')}
                  >
                    <span>Price: High to Low</span>
                  </div>
                  <div 
                    className={`dropdown-option ${sortOption === 'date-newest' ? 'active' : ''}`}
                    onClick={() => handleSortChange('date-newest')}
                  >
                    <span>Date: Newest First</span>
                  </div>
                  <div 
                    className={`dropdown-option ${sortOption === 'date-oldest' ? 'active' : ''}`}
                    onClick={() => handleSortChange('date-oldest')}
                  >
                    <span>Date: Oldest First</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {!showCategoryDropdown && !showBrandDropdown && !onSortChange && !onRentalToggle && !showPriceFilter && (
          <div className="no-filters-message">No filter options available</div>
        )}
      </div>
      
      {/* Price Range Filter */}
      {showPriceFilter && (
        <PriceRangeFilter
          minPrice={minPrice}
          maxPrice={maxPrice}
          currentRange={priceRange}
          onRangeChange={onPriceRangeChange}
        />
      )}
      
      {/* Active filters display */}
      {(
        (selectedCategories.length > 0 && !selectedCategories.includes('all')) || 
        (selectedBrands.length > 0 && !selectedBrands.includes('all')) ||
        (showPriceFilter && (priceRange.min > minPrice || priceRange.max < maxPrice)) ||
        showRentalOnly
      ) && (
        <div className="active-filters">
          <p>
            Active Filters: 
            {!selectedCategories.includes('all') && (
              <span className="filter-tag">
                Categories: {selectedCategories.join(', ')}
              </span>
            )}
            {!selectedBrands.includes('all') && (
              <span className="filter-tag">
                Brands: {selectedBrands.join(', ')}
              </span>
            )}
            {showPriceFilter && (priceRange.min > minPrice || priceRange.max < maxPrice) && (
              <span className="filter-tag">
                Price: ${priceRange.min} - ${priceRange.max}
              </span>
            )}
            {showRentalOnly && (
              <span className="filter-tag">
                Rentable Only
              </span>
            )}
          </p>
        </div>
      )}
      
      <style jsx>{`
        .filter-bar-container {
          margin-bottom: 25px;
        }
        
        .filter-switch {
          margin-right: 15px;
        }
        
        .rental-toggle {
          display: flex;
          align-items: center;
          cursor: pointer;
        }
        
        .toggle-label {
          margin-right: 8px;
          font-size: 14px;
          color: var(--text-color);
        }
        
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 40px;
          height: 20px;
        }
        
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--border-color);
          transition: .3s;
          border-radius: 20px;
        }
        
        .slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 2px;
          bottom: 2px;
          background-color: white;
          transition: .3s;
          border-radius: 50%;
        }
        
        input:checked + .slider {
          background-color: var(--rent-color);
        }
        
        input:checked + .slider:before {
          transform: translateX(20px);
        }
        
        .active-filters {
          margin-top: 15px;
          padding: 10px 15px;
          background-color: var(--card-bg);
          border-radius: 8px;
          box-shadow: 0 2px 5px var(--shadow-color);
        }
        
        .active-filters p {
          font-size: 0.85rem;
          color: var(--text-color);
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
          margin: 0;
        }
        
        .filter-tag {
          display: inline-block;
          padding: 4px 8px;
          background-color: rgba(var(--accent-rgb), 0.1);
          border-radius: 20px;
          font-size: 0.75rem;
          color: var(--secondary-color);
        }
      `}</style>
    </div>
  );
} 