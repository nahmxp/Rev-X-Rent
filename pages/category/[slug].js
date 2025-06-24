import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ProductCard from '../../components/ProductCard';
import FilterBar from '../../components/FilterBar';

export default function CategoryPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState(null);
  const [selectedBrands, setSelectedBrands] = useState(['all']);
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
        
        // Filter products by the category slug
        const categoryProducts = slug === 'all' 
          ? data 
          : data.filter(product => {
              // Make the comparison case-insensitive
              return product.category && product.category.toLowerCase() === slug.toLowerCase();
            });
        
        setProducts(categoryProducts);
        setCategory(slug === 'all' ? 'All Categories' : slug);
        
        // Reset brand filter when category changes
        setSelectedBrands(['all']);
        
        // Determine price range for this category
        if (categoryProducts.length > 0) {
          const prices = categoryProducts.map(product => product.price);
          const minCategoryPrice = Math.floor(Math.min(...prices.filter(price => !isNaN(price) && price !== null)));
          const maxCategoryPrice = Math.ceil(Math.max(...prices.filter(price => !isNaN(price) && price !== null)));
          
          setMinPrice(minCategoryPrice);
          setMaxPrice(maxCategoryPrice);
          setPriceRange({ min: minCategoryPrice, max: maxCategoryPrice });
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

  // Extract unique brands from category products
  const brands = useMemo(() => {
    const brandSet = new Set(products.map(product => product.brand).filter(Boolean));
    return Array.from(brandSet).sort();
  }, [products]);

  // Handle brand filter change
  const handleBrandChange = (brands) => {
    setSelectedBrands(brands);
  };

  // Handle sort option change
  const handleSortChange = (option) => {
    setSortOption(option);
  };
  
  // Handle price range change
  const handlePriceRangeChange = (newRange) => {
    setPriceRange(newRange);
  };

  // Get filtered products by selected brand and price range
  const getFilteredProducts = () => {
    let filtered = products.filter(product => {
      // Check brand filter
      const brandMatch = selectedBrands.includes('all') 
        ? true 
        : selectedBrands.includes(product.brand);
      
      // Check price range filter
      const priceMatch = (product.price >= priceRange.min && product.price <= priceRange.max);
      
      return brandMatch && priceMatch;
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
        <Link href="/catalog">Products</Link> &gt; <span>Category: {category}</span>
      </div>
      
      <div className="catalog-header">
        <h1>{category}</h1>
        <p className="product-count">{filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found</p>
      </div>
      
      {/* Filter by brands and price */}
      <FilterBar 
        categories={[]}
        brands={brands}
        selectedCategories={['all']}
        selectedBrands={selectedBrands}
        onCategoryChange={() => {}}
        onBrandChange={handleBrandChange}
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