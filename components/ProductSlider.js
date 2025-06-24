import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from './ProductCard';

export default function ProductSlider({ products, category, type = 'category', isAdmin = false }) {
  const [isScrollable, setIsScrollable] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const sliderRef = useRef(null);
  
  // Check if slider is scrollable
  useEffect(() => {
    const checkScrollable = () => {
      if (sliderRef.current) {
        const { scrollWidth, clientWidth } = sliderRef.current;
        setIsScrollable(scrollWidth > clientWidth);
      }
    };
    
    checkScrollable();
    window.addEventListener('resize', checkScrollable);
    
    return () => {
      window.removeEventListener('resize', checkScrollable);
    };
  }, [products]);
  
  // Handle manual scroll
  const handleScroll = () => {
    if (sliderRef.current) {
      setScrollPosition(sliderRef.current.scrollLeft);
    }
  };
  
  // Scroll slider left
  const scrollLeft = () => {
    if (sliderRef.current) {
      const cardWidth = sliderRef.current.querySelector('.product-card')?.offsetWidth || 250;
      const scrollAmount = Math.max(cardWidth * 2, 200); // Scroll by at least 2 cards
      const newPosition = Math.max(0, scrollPosition - scrollAmount);
      sliderRef.current.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
  };
  
  // Scroll slider right
  const scrollRight = () => {
    if (sliderRef.current) {
      const { scrollWidth, clientWidth } = sliderRef.current;
      const cardWidth = sliderRef.current.querySelector('.product-card')?.offsetWidth || 250;
      const scrollAmount = Math.max(cardWidth * 2, 200); // Scroll by at least 2 cards
      const maxScrollPosition = scrollWidth - clientWidth;
      const newPosition = Math.min(maxScrollPosition, scrollPosition + scrollAmount);
      sliderRef.current.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
  };

  // Determine category display name and link
  const getCategoryDisplayName = () => {
    if (category === 'all') {
      return type === 'category' ? 'All Categories' : 'All Brands';
    }
    return category;
  };

  const getLinkHref = () => {
    const slug = category === 'All Brands' ? 'all' : category;
    return `/${type === 'category' ? 'category' : 'brand'}/${slug}`;
  };
  
  // If no products, show empty message
  if (!products || products.length === 0) {
    return (
      <div className="product-slider-empty">
        <p>No products found in this category.</p>
      </div>
    );
  }
  
  return (
    <div className="product-slider-container">
      <div className="product-slider-header">
        <Link href={getLinkHref()}>
          <h3 className="slider-title">{getCategoryDisplayName()}</h3>
        </Link>
        
        {isScrollable && (
          <div className="slider-controls">
            <button 
              className="slider-control left"
              onClick={scrollLeft}
              disabled={scrollPosition === 0}
              aria-label="Scroll products left"
            >
              &lt;
            </button>
            <button 
              className="slider-control right"
              onClick={scrollRight}
              disabled={sliderRef.current && scrollPosition >= sliderRef.current.scrollWidth - sliderRef.current.clientWidth}
              aria-label="Scroll products right"
            >
              &gt;
            </button>
          </div>
        )}
      </div>
      
      <div 
        className="product-slider" 
        ref={sliderRef}
        onScroll={handleScroll}
      >
        {products.map(product => (
          <div className="product-slider-item" key={product._id}>
            <ProductCard product={product} isAdmin={isAdmin} />
          </div>
        ))}
      </div>
    </div>
  );
} 