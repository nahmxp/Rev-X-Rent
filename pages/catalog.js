import { useEffect, useState, useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import Link from 'next/link';
import CategoryTabs from '../components/CategoryTabs';
import ProductSlider from '../components/ProductSlider';
import FilterBar from '../components/FilterBar';
import { useAuth } from '../lib/AuthContext';

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeBrand, setActiveBrand] = useState('all');
  const [selectedCategories, setSelectedCategories] = useState(['all']);
  const [selectedBrands, setSelectedBrands] = useState(['all']);
  const [viewMode, setViewMode] = useState('grid'); // Changed from 'categories' to 'grid'
  const [sortOption, setSortOption] = useState('default');
  const [showRentalOnly, setShowRentalOnly] = useState(false); // New state for rental filter
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const { isAuthenticated, isAdmin } = useAuth();

  // Fetch all products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products", error);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Extract unique categories from products
  const categories = useMemo(() => {
    const categorySet = new Set(products.map(product => product.category).filter(Boolean));
    return Array.from(categorySet).sort();
  }, [products]);

  // Extract unique brands from products
  const brands = useMemo(() => {
    const brandSet = new Set(products.map(product => product.brand).filter(Boolean));
    return Array.from(brandSet).sort();
  }, [products]);

  // Determine price range based on products
  useEffect(() => {
    if (products.length > 0) {
      const prices = products.map(product => product.price);
      const minProductPrice = Math.floor(Math.min(...prices.filter(price => !isNaN(price) && price !== null)));
      const maxProductPrice = Math.ceil(Math.max(...prices.filter(price => !isNaN(price) && price !== null)));
      
      setMinPrice(minProductPrice);
      setMaxPrice(maxProductPrice);
      setPriceRange({ min: minProductPrice, max: maxProductPrice });
    }
  }, [products]);

  // Get products by category (single selection mode)
  const getProductsByCategory = (category) => {
    if (category === 'all') {
      return products;
    }
    return products.filter(product => product.category === category);
  };

  // Get products by brand (single selection mode)
  const getProductsByBrand = (brand) => {
    if (brand === 'all') {
      return products;
    }
    return products.filter(product => product.brand === brand);
  };

  // Get products filtered by multiple categories and brands
  const getFilteredProducts = () => {
    let filtered = products.filter(product => {
      // Check if product matches selected categories
      const categoryMatch = 
        selectedCategories.includes('all') || 
        selectedCategories.includes(product.category);
      
      // Check if product matches selected brands
      const brandMatch = 
        selectedBrands.includes('all') || 
        selectedBrands.includes(product.brand);
      
      // Check if product matches rental filter
      const rentalMatch = 
        !showRentalOnly || 
        (product.isRentable && 
         product.rentalPrice && 
         (product.rentalPrice.hourly > 0 || product.rentalPrice.daily > 0));
      
      // Check if product is within price range
      const priceMatch = 
        (product.price >= priceRange.min && product.price <= priceRange.max);
      
      // Product must match all criteria
      return categoryMatch && brandMatch && rentalMatch && priceMatch;
    });

    // Apply sorting
    if (sortOption !== 'default') {
      filtered = [...filtered].sort((a, b) => {
        switch (sortOption) {
          case 'price-low-high':
            return (a.price || 0) - (b.price || 0);
          case 'price-high-low':
            return (b.price || 0) - (a.price || 0);
          case 'date-newest':
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          case 'date-oldest':
            return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
          default:
            return 0;
        }
      });
    }
    
    return filtered;
  };

  // Handle category selection (single select mode)
  const handleCategorySelect = (category) => {
    setActiveCategory(category);
  };

  // Handle brand selection (single select mode)
  const handleBrandSelect = (brand) => {
    setActiveBrand(brand);
  };

  // Handle multi-select for categories
  const handleMultiCategorySelect = (categories) => {
    setSelectedCategories(categories);
  };

  // Handle multi-select for brands
  const handleMultiBrandSelect = (brands) => {
    setSelectedBrands(brands);
  };

  // Handle view mode change
  const changeViewMode = (mode) => {
    setViewMode(mode);
  };

  // Handle sort option change
  const handleSortChange = (option) => {
    setSortOption(option);
  };

  // Handle rental toggle
  const handleRentalToggle = (value) => {
    setShowRentalOnly(value);
  };

  // Handle price range change
  const handlePriceRangeChange = (newRange) => {
    setPriceRange(newRange);
  };

  // Get rentable products
  const getRentableProducts = () => {
    return products.filter(product => 
      product.isRentable && 
      product.rentalPrice && 
      (product.rentalPrice.hourly > 0 || product.rentalPrice.daily > 0)
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  // Get filtered products for grid view
  const filteredProducts = getFilteredProducts();

  return (
    <div className="catalog-page">
      <div className="catalog-header">
        <h1>Product Catalog</h1>
        <p className="product-count">
          Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
        </p>
      </div>

      <FilterBar
        categories={categories}
        brands={brands}
        selectedCategories={selectedCategories}
        selectedBrands={selectedBrands}
        sortOption={sortOption}
        showRentalOnly={showRentalOnly}
        onCategoryChange={handleMultiCategorySelect}
        onBrandChange={handleMultiBrandSelect}
        onSortChange={handleSortChange}
        onRentalToggle={handleRentalToggle}
        priceRange={priceRange}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onPriceRangeChange={handlePriceRangeChange}
      />
      
      <div className="dashboard-header-main">
        <h2>Products</h2>
        <div className="view-toggle">
          <button
            className={`view-mode-button ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => changeViewMode('grid')}
          >
            Grid View
          </button>
          <button
            className={`view-mode-button ${viewMode === 'categories' ? 'active' : ''}`}
            onClick={() => changeViewMode('categories')}
          >
            Categories
          </button>
          <button
            className={`view-mode-button ${viewMode === 'brands' ? 'active' : ''}`}
            onClick={() => changeViewMode('brands')}
          >
            Brands
          </button>
        </div>
      </div>

      {viewMode === 'grid' && (
        <div className="grid-view">
          <div className="product-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                  isAdmin={isAdmin}
                  isAuthenticated={isAuthenticated}
                />
              ))
            ) : (
              <div className="empty-state">
                <h3>No products found</h3>
                <p>Try adjusting your filters or search criteria.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {viewMode === 'categories' && (
        <div className="categories-view">
          {categories.length > 0 ? (
            categories.map(category => (
              <div key={category} className="product-slider-container">
                <div className="product-slider-header">
                  <Link href={`/category/${encodeURIComponent(category.toLowerCase())}`} className="slider-title">
                    <h3>{category}</h3>
                  </Link>
                </div>
                <ProductSlider products={getProductsByCategory(category)} isAdmin={isAdmin} isAuthenticated={isAuthenticated} />
              </div>
            ))
          ) : (
            <div className="no-categories">No categories found</div>
          )}
        </div>
      )}

      {viewMode === 'brands' && (
        <div className="brands-view">
          {brands.length > 0 ? (
            brands.map(brand => (
              <div key={brand} className="product-slider-container">
                <div className="product-slider-header">
                  <Link href={`/brand/${encodeURIComponent(brand.toLowerCase())}`} className="slider-title">
                    <h3>{brand}</h3>
                  </Link>
                </div>
                <ProductSlider products={getProductsByBrand(brand)} isAdmin={isAdmin} isAuthenticated={isAuthenticated} />
              </div>
            ))
          ) : (
            <div className="no-brands">No brands found</div>
          )}
        </div>
      )}
    </div>
  );
} 