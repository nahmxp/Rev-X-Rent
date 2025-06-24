import { useState, useEffect } from 'react';

export default function ImageCarousel({ images = [], interval = 5000 }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeState, setFadeState] = useState('fade-in');

  // Default images if none are provided
  const defaultImages = [
    'https://via.placeholder.com/800x500?text=Premium+Electronics',
    'https://via.placeholder.com/800x500?text=Latest+Gadgets',
    'https://via.placeholder.com/800x500?text=Tech+Innovations'
  ];

  // Use provided images or defaults
  const carouselImages = images.length > 0 ? images : defaultImages;

  useEffect(() => {
    // Don't run the effect if there's only one image
    if (carouselImages.length <= 1) return;

    // Setup the fade-out/fade-in transition
    const fadeOutTimer = setTimeout(() => {
      setFadeState('fade-out');
    }, interval - 1000); // Start fade-out 1 second before changing slide

    // Setup the automatic slider
    const sliderTimer = setTimeout(() => {
      setFadeState('fade-in');
      setCurrentIndex((prevIndex) => 
        prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
      );
    }, interval);

    // Cleanup timers
    return () => {
      clearTimeout(sliderTimer);
      clearTimeout(fadeOutTimer);
    };
  }, [currentIndex, interval, carouselImages.length]);

  // Handle manual navigation
  const goToSlide = (index) => {
    setFadeState('fade-in');
    setCurrentIndex(index);
  };

  // If no images, don't render
  if (carouselImages.length === 0) return null;

  return (
    <div className="carousel-container">
      <div className={`carousel-slide ${fadeState}`}>
        <img 
          src={carouselImages[currentIndex]} 
          alt={`Slide ${currentIndex + 1}`}
          className="carousel-image"
        />
      </div>

      {/* Dots navigation */}
      {carouselImages.length > 1 && (
        <div className="carousel-dots">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        .carousel-container {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          background-color: #f9f9f9;
        }

        .carousel-slide {
          width: 100%;
          height: 100%;
          transition: opacity 1s ease-in-out;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .fade-in {
          opacity: 1;
        }

        .fade-out {
          opacity: 0;
        }

        .carousel-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 10px;
          padding: 10px;
        }

        .carousel-dots {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
        }

        .carousel-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.5);
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .carousel-dot.active {
          background-color: var(--primary-color, #fff);
          transform: scale(1.2);
        }

        @media (max-width: 768px) {
          .carousel-dot {
            width: 10px;
            height: 10px;
          }
        }
      `}</style>
    </div>
  );
} 