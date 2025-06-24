import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ProductCard from '../../components/ProductCard';
import FilterBar from '../../components/FilterBar';

export default function BrandPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [brand, setBrand] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState(['all']);
  const [sortOption, setSortOption] = useState('default');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);

  useEffect(() => {
    // Only fetch data when slug is available (after hydration)
    if (!slug) return;
    
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/products');
        if (!res.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await res.json();
        setAllProducts(data);
        
        // Filter products by the brand slug
        const brandProducts = slug === 'all' 
          ? data 
          : data.filter(product => product.brand === slug);
        
        setProducts(brandProducts);
        setBrand(slug === 'all' ? 'All Brands' : slug);
        
        // Reset category filter when brand changes
        setSelectedCategories(['all']);
        
        // Determine price range for this brand
        if (brandProducts.length > 0) {
          const prices = brandProducts.map(product => product.price);
          const minBrandPrice = Math.floor(Math.min(...prices.filter(price => !isNaN(price) && price !== null)));
          const maxBrandPrice = Math.ceil(Math.max(...prices.filter(price => !isNaN(price) && price !== null)));
          
          setMinPrice(minBrandPrice);
          setMaxPrice(maxBrandPrice);
          setPriceRange({ min: minBrandPrice, max: maxBrandPrice });
        }
      } catch (error) {
        console.error("Failed to fetch products", error);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [slug]);

  // Extract unique categories from brand products
  const categories = useMemo(() => {
    const categorySet = new Set(products.map(product => product.category).filter(Boolean));
    return Array.from(categorySet).sort();
  }, [products]);

  // Handle category filter change
  const handleCategoryChange = (categories) => {
    setSelectedCategories(categories);
  };

  // Handle sort option change
  const handleSortChange = (option) => {
    setSortOption(option);
  };
  
  // Handle price range change
  const handlePriceRangeChange = (newRange) => {
    setPriceRange(newRange);
  };

  // Get filtered products by selected category and price range
  const getFilteredProducts = () => {
    let filtered = products.filter(product => {
      // Check category filter
      const categoryMatch = selectedCategories.includes('all') 
        ? true 
        : selectedCategories.includes(product.category);
      
      // Check price range filter
      const priceMatch = (product.price >= priceRange.min && product.price <= priceRange.max);
      
      return categoryMatch && priceMatch;
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

  const filteredProducts = getFilteredProducts();

  return (
    <div className="catalog-page">
      <div className="breadcrumbs">
        <Link href="/catalog">Products</Link> &gt; <span>Brand: {brand}</span>
      </div>
      
      <div className="catalog-header">
        <h1>{brand}</h1>
        <p className="product-count">{filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found</p>
      </div>
      
      {/* Filter by categories and price */}
      <FilterBar 
        categories={categories}
        brands={[]}
        selectedCategories={selectedCategories}
        selectedBrands={['all']}
        onCategoryChange={handleCategoryChange}
        onBrandChange={() => {}}
        sortOption={sortOption}
        onSortChange={handleSortChange}
        priceRange={priceRange}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onPriceRangeChange={handlePriceRangeChange}
      />
      
      {filteredProducts.length === 0 ? (
        <div className="empty-state">
          <img 
            src="https://via.placeholder.com/150?text=Empty" 
            alt="No products" 
            style={{ opacity: 0.5 }}
          />
          <h3>No products found with the selected filters</h3>
          <p>Try changing your filters or add some products!</p>
          <Link href="/add-product">
            <button className="btn-primary">Add Product</button>
          </Link>
        </div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
} 