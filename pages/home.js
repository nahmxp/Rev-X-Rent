import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductSlider from '../components/ProductSlider';
import ImageCarousel from '../components/ImageCarousel';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productImages, setProductImages] = useState([]);
  const [rentalProductImages, setRentalProductImages] = useState([]);

  // Fallback images for carousel
  const fallbackImages = [
    '/images/jute-bags.png',
    '/images/jute-handbags.png',
    '/images/jute-mattresses.png',
    '/images/jute-home-decor.png'
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) {
          throw new Error('Failed to fetch products');
        }
        const allProducts = await res.json();
        
        // Get 6 random products for featured section
        const randomProducts = [...allProducts].sort(() => 0.5 - Math.random()).slice(0, 6);
        setFeaturedProducts(randomProducts);
        
        // Get newest products for new arrivals
        const sorted = [...allProducts].sort((a, b) => 
          new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        setNewArrivals(sorted.slice(0, 8));
        
        // Extract product images for carousel
        const validProductImages = allProducts
          .filter(product => product.image && !product.image.includes('placeholder'))
          .map(product => product.image);
        
        // Get random product images for the hero section
        const randomImages = validProductImages.length > 0 
          ? [...validProductImages].sort(() => 0.5 - Math.random()).slice(0, 6)
          : fallbackImages;
        
        // Get images from rental products for the rental section
        const validRentalImages = allProducts
          .filter(product => 
            product.isRentable && 
            product.image && 
            !product.image.includes('placeholder')
          )
          .map(product => product.image);
        
        const randomRentalImages = validRentalImages.length > 0
          ? [...validRentalImages].sort(() => 0.5 - Math.random()).slice(0, 4)
          : fallbackImages;
          
        setProductImages(randomImages);
        setRentalProductImages(randomRentalImages);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProductImages(fallbackImages);
        setRentalProductImages(fallbackImages);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="container">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-text">
              <h1>Welcome to ShopHub</h1>
              <p>Your one-stop destination for quality products and exceptional shopping experience.</p>
              <div className="hero-buttons">
                <Link href="/catalog">
                  <button className="btn-primary">Shop Now</button>
                </Link>
                <Link href="/about">
                  <button className="btn-outline">Learn More</button>
                </Link>
              </div>
            </div>
            <div className="hero-image">
              <ImageCarousel images={productImages} interval={4000} />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚚</div>
              <h3>Fast Delivery</h3>
              <p>Quick and reliable shipping to your doorstep</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Secure Shopping</h3>
              <p>Safe and protected payment processing</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3>Quality Products</h3>
              <p>Carefully curated selection of premium items</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>24/7 Support</h3>
              <p>Round-the-clock customer service assistance</p>
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="featured-products-section">
          <div className="section-header">
            <h2>Featured Products</h2>
            <Link href="/catalog">View All</Link>
          </div>
          {featuredProducts.length > 0 ? (
            <ProductSlider products={featuredProducts} />
          ) : (
            <div className="product-slider-empty">No featured products available</div>
          )}
        </section>

        {/* Categories Section */}
        <section className="categories-section">
          <div className="section-header">
            <h2>Shop by Category</h2>
            <Link href="/catalog">Browse All</Link>
          </div>
          <div className="categories-grid">
            <Link href="/category/electronics">
              <div className="category-card">
                <div className="category-image">
                  <img src="/images/electronics.png" alt="Electronics" />
                </div>
                <h3>Electronics</h3>
              </div>
            </Link>
            <Link href="/category/fashion">
              <div className="category-card">
                <div className="category-image">
                  <img src="/images/fashion.png" alt="Fashion" />
                </div>
                <h3>Fashion</h3>
              </div>
            </Link>
            <Link href="/category/home">
              <div className="category-card">
                <div className="category-image">
                  <img src="/images/home.png" alt="Home & Living" />
                </div>
                <h3>Home & Living</h3>
              </div>
            </Link>
            <Link href="/category/beauty">
              <div className="category-card">
                <div className="category-image">
                  <img src="/images/beauty.png" alt="Beauty" />
                </div>
                <h3>Beauty</h3>
              </div>
            </Link>
          </div>
        </section>

        {/* New Arrivals Section */}
        <section className="new-arrivals-section">
          <div className="section-header">
            <h2>Our viral products</h2>
            <Link href="/catalog">View All</Link>
          </div>
          {newArrivals.length > 0 ? (
            <ProductSlider products={newArrivals} />
          ) : (
            <div className="product-slider-empty">No new arrivals available</div>
          )}
        </section>

        {/* Rental Promotion Section */}
        <section className="rental-promo-section">
          <div className="promo-content">
            <div className="promo-text">
              <h2>How It Works</h2>
              <p>Our innovative system makes sustainable packaging easy and efficient for everyone.</p>
              <ul className="promo-features">
                <li>Lease ReFili bags directly from us</li>
                <li>Select ReFili bags during checkout</li>
                <li>Deliver products in ReFili packaging</li>
                <li>Customers return empty bags to hub</li>
                <li>Bags are restored and reused</li>
                <li>Complete recycling process managed by us</li>
              </ul>
              <Link href="/catalog">
                <button className="btn-primary">Get Started</button>
              </Link>
            </div>
            <div className="promo-image">
              <ImageCarousel images={rentalProductImages} interval={3500} />
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="testimonials-section">
          <h2>Why Choose ReFili?</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-rating">★★★★★</div>
              <p className="testimonial-text">
                "The Jute Difference: Biodegradable, incredibly durable, and made from natural & renewable materials."
              </p>
              <p className="testimonial-author">- Eco-Friendly Choice</p>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-rating">★★★★★</div>
              <p className="testimonial-text">
                "Eco-Ingenuity: By substituting single-use plastics with innovative jute packaging, we're reducing carbon emissions."
              </p>
              <p className="testimonial-author">- Sustainable Impact</p>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-rating">★★★★★</div>
              <p className="testimonial-text">
                "Swiss-Made: Each ReFili bag undergoes rigorous quality checks, reflecting Swiss precision and quality."
              </p>
              <p className="testimonial-author">- Quality Assurance</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
} 