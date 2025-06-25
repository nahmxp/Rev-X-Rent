import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductSlider from '../components/ProductSlider';
import ImageCarousel from '../components/ImageCarousel';

export default function Home() {
  const [featuredCars, setFeaturedCars] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [carImages, setCarImages] = useState([]);

  // Fallback images for carousel
  const fallbackImages = [
    '/images/Icon.png',
    '/images/image.png'
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) {
          throw new Error('Failed to fetch cars');
        }
        const allProducts = await res.json();

        // Get 6 random cars for featured section
        const randomCars = [...allProducts].sort(() => 0.5 - Math.random()).slice(0, 6);
        setFeaturedCars(randomCars);

        // Get newest cars for new arrivals
        const sorted = [...allProducts].sort((a, b) =>
          new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        setNewArrivals(sorted.slice(0, 8));

        // Extract car images for carousel
        const validCarImages = allProducts
          .filter(product => product.image && !product.image.includes('placeholder'))
          .map(product => product.image);

        const randomImages = validCarImages.length > 0
          ? [...validCarImages].sort(() => 0.5 - Math.random()).slice(0, 6)
          : fallbackImages;

        setCarImages(randomImages);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cars:', error);
        setCarImages(fallbackImages);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading cars...</p>
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
              <img src="/images/Icon.png" alt="Car Rental Logo" style={{ width: 120, marginBottom: 24 }} />
              <h1>Welcome to Rev X Rent</h1>
              <p>Your premium destination for car rentals. Find the perfect ride for your next adventure, business trip, or daily commute.</p>
              <div className="hero-buttons">
                <Link href="/catalog">
                  <button className="btn-primary">Browse Cars</button>
                </Link>
                <Link href="/about">
                  <button className="btn-outline">How It Works</button>
                </Link>
              </div>
            </div>
            <div className="hero-image">
              <img src="/images/image.png" alt="Car Rental Hero" style={{ width: 400, borderRadius: 16 }} />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚗</div>
              <h3>Wide Selection</h3>
              <p>Choose from economy, luxury, SUVs, and more</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🕒</div>
              <h3>Flexible Rentals</h3>
              <p>Hourly, daily, weekly, or monthly options</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>Easy Booking</h3>
              <p>Simple online reservation and payment</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Insurance Included</h3>
              <p>Drive with peace of mind</p>
            </div>
          </div>
        </section>

        {/* Featured Cars Section */}
        <section className="featured-products-section">
          <div className="section-header">
            <h2>Featured Cars</h2>
            <Link href="/catalog">View All</Link>
          </div>
          {featuredCars.length > 0 ? (
            <ProductSlider products={featuredCars} />
          ) : (
            <div className="product-slider-empty">No featured cars available</div>
          )}
        </section>

        {/* Categories Section */}
        <section className="categories-section">
          <div className="section-header">
            <h2>Browse by Type</h2>
            <Link href="/catalog">Browse All</Link>
          </div>
          <div className="categories-grid">
            <Link href="/category/economy">
              <div className="category-card">
                <div className="category-image">
                  <img src="/images/Icon.png" alt="Economy Cars" />
                </div>
                <h3>Economy</h3>
              </div>
            </Link>
            <Link href="/category/suv">
              <div className="category-card">
                <div className="category-image">
                  <img src="/images/image.png" alt="SUVs" />
                </div>
                <h3>SUVs</h3>
              </div>
            </Link>
            <Link href="/category/luxury">
              <div className="category-card">
                <div className="category-image">
                  <img src="/images/Icon.png" alt="Luxury Cars" />
                </div>
                <h3>Luxury</h3>
              </div>
            </Link>
            <Link href="/category/van">
              <div className="category-card">
                <div className="category-image">
                  <img src="/images/image.png" alt="Vans" />
                </div>
                <h3>Vans</h3>
              </div>
            </Link>
          </div>
        </section>

        {/* New Arrivals Section */}
        <section className="new-arrivals-section">
          <div className="section-header">
            <h2>New Arrivals</h2>
            <Link href="/catalog">View All</Link>
          </div>
          {newArrivals.length > 0 ? (
            <ProductSlider products={newArrivals} />
          ) : (
            <div className="product-slider-empty">No new arrivals available</div>
          )}
        </section>

        {/* How It Works Section */}
        <section className="rental-promo-section">
          <div className="promo-content">
            <div className="promo-text">
              <h2>How It Works</h2>
              <ul className="promo-features">
                <li>Search and compare cars</li>
                <li>Book instantly online</li>
                <li>Pick up or get delivery</li>
                <li>Enjoy your ride</li>
                <li>Return easily at end of rental</li>
              </ul>
              <Link href="/catalog">
                <button className="btn-primary">Get Started</button>
              </Link>
            </div>
            <div className="promo-image">
              <img src="/images/Icon.png" alt="How Car Rental Works" style={{ width: 300, borderRadius: 12 }} />
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="testimonials-section">
          <h2>Why Rent With Us?</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-rating">★★★★★</div>
              <p className="testimonial-text">
                "The best car rental experience I've ever had. Fast, easy, and affordable!"
              </p>
              <p className="testimonial-author">- Happy Customer</p>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-rating">★★★★★</div>
              <p className="testimonial-text">
                "A great selection of cars and top-notch customer service. Highly recommend."
              </p>
              <p className="testimonial-author">- Satisfied Renter</p>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-rating">★★★★★</div>
              <p className="testimonial-text">
                "Booking was a breeze and the car was spotless. Will rent again!"
              </p>
              <p className="testimonial-author">- Frequent Traveler</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
} 