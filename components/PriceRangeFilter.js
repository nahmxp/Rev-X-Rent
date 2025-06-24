import { useState, useEffect } from 'react';

export default function PriceRangeFilter({ 
  minPrice, 
  maxPrice, 
  currentRange, 
  onRangeChange,
  className = '' 
}) {
  const [localRange, setLocalRange] = useState(currentRange);
  
  // Update local state when props change
  useEffect(() => {
    setLocalRange(currentRange);
  }, [currentRange]);
  
  const handleMinPriceChange = (e) => {
    const value = Number(e.target.value);
    const newRange = { ...localRange, min: value };
    setLocalRange(newRange);
    
    // Only update parent if min is less than or equal to max
    if (value <= localRange.max) {
      onRangeChange(newRange);
    }
  };
  
  const handleMaxPriceChange = (e) => {
    const value = Number(e.target.value);
    const newRange = { ...localRange, max: value };
    setLocalRange(newRange);
    
    // Only update parent if max is greater than or equal to min
    if (value >= localRange.min) {
      onRangeChange(newRange);
    }
  };
  
  const handleRangeReset = () => {
    const resetRange = { min: minPrice, max: maxPrice };
    setLocalRange(resetRange);
    onRangeChange(resetRange);
  };
  
  return (
    <div className={`price-range-filter ${className}`}>
      <h3>Price Range</h3>
      <div className="price-inputs">
        <div className="price-input-group">
          <label htmlFor="min-price">Min Price:</label>
          <div className="price-input-wrapper">
            <span className="currency-symbol">$</span>
            <input
              type="number"
              id="min-price"
              value={localRange.min}
              onChange={handleMinPriceChange}
              min={minPrice}
              max={localRange.max}
              step="1"
            />
          </div>
        </div>
        <div className="price-input-group">
          <label htmlFor="max-price">Max Price:</label>
          <div className="price-input-wrapper">
            <span className="currency-symbol">$</span>
            <input
              type="number"
              id="max-price"
              value={localRange.max}
              onChange={handleMaxPriceChange}
              min={localRange.min}
              max={maxPrice}
              step="1"
            />
          </div>
        </div>
        <button className="reset-price-btn" onClick={handleRangeReset}>
          Reset
        </button>
      </div>
      <div className="price-slider-container">
        <input
          type="range"
          className="price-slider min-slider"
          min={minPrice}
          max={maxPrice}
          value={localRange.min}
          onChange={handleMinPriceChange}
        />
        <input
          type="range"
          className="price-slider max-slider"
          min={minPrice}
          max={maxPrice}
          value={localRange.max}
          onChange={handleMaxPriceChange}
        />
        <div className="price-range-values">
          <span>${localRange.min}</span>
          <span>${localRange.max}</span>
        </div>
      </div>
      
      <style jsx>{`
        .price-range-filter {
          margin: 25px 0;
          padding: 15px;
          background-color: var(--card-bg);
          border-radius: 8px;
          box-shadow: 0 2px 5px var(--shadow-color);
        }
        
        .price-range-filter h3 {
          margin-top: 0;
          margin-bottom: 15px;
          font-size: 1rem;
          color: var(--primary-color);
        }
        
        .price-inputs {
          display: flex;
          gap: 15px;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .price-input-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        
        .price-input-group label {
          font-size: 0.85rem;
          color: var(--text-color);
        }
        
        .price-input-wrapper {
          position: relative;
        }
        
        .currency-symbol {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-color);
          opacity: 0.6;
        }
        
        .price-input-wrapper input {
          padding: 8px 8px 8px 25px;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          width: 100px;
        }
        
        .reset-price-btn {
          padding: 8px 15px;
          background-color: var(--light-gray);
          color: var(--text-color);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          cursor: pointer;
          margin-left: auto;
          align-self: flex-end;
          transition: all 0.2s;
        }
        
        .reset-price-btn:hover {
          background-color: var(--border-color);
        }
        
        .price-slider-container {
          position: relative;
          height: 40px;
          margin-bottom: 20px;
        }
        
        .price-slider {
          position: absolute;
          width: 100%;
          height: 5px;
          pointer-events: none;
          opacity: 0.5;
          z-index: 1;
          -webkit-appearance: none;
          appearance: none;
          background: none;
        }
        
        .price-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--primary-color);
          cursor: pointer;
          pointer-events: auto;
        }
        
        .price-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--primary-color);
          cursor: pointer;
          pointer-events: auto;
        }
        
        .price-range-values {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
          font-size: 0.85rem;
          color: var(--text-color);
        }
        
        @media (max-width: 768px) {
          .price-inputs {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .price-input-wrapper input {
            width: 100%;
          }
          
          .reset-price-btn {
            margin-left: 0;
            margin-top: 10px;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
} 