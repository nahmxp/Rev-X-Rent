import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

// List of common product categories
const CATEGORIES = [
  "Economy",
  "SUV",
  "Luxury",
  "Van",
  "Other"
];

export default function UpdateProduct() {
  const router = useRouter();
  const { id } = router.query;
  const [form, setForm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          const res = await fetch(`/api/product/${id}`);
          
          if (!res.ok) {
            alert('Product not found');
            router.push('/');
            return;
          }
          
          const product = await res.json();
          // Ensure rental fields are properly initialized
          setForm({
            ...product,
            rentalPrice: {
              hourly: product.rentalPrice?.hourly || '',
              daily: product.rentalPrice?.daily || ''
            }
          });
        } catch (error) {
          console.error('Failed to fetch product', error);
          alert('Failed to load product data');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchProduct();
    }
  }, [id, router]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.name) newErrors.name = 'Product name is required';
    if (!form.brand) newErrors.brand = 'Brand is required';
    if (!form.price) newErrors.price = 'Price is required';
    else if (isNaN(form.price) || parseFloat(form.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    if (!form.description) newErrors.description = 'Description is required';
    if (!form.category) newErrors.category = 'Product category is required';
    
    // Validate rental prices if product is rentable
    if (form.isRentable) {
      if (!form.rentalPrice.hourly && !form.rentalPrice.daily) {
        newErrors.rentalPrice = 'At least one rental price (hourly or daily) is required';
      } else {
        if (form.rentalPrice.hourly && (isNaN(form.rentalPrice.hourly) || parseFloat(form.rentalPrice.hourly) <= 0)) {
          newErrors.rentalPriceHourly = 'Hourly rental price must be a positive number';
        }
        if (form.rentalPrice.daily && (isNaN(form.rentalPrice.daily) || parseFloat(form.rentalPrice.daily) <= 0)) {
          newErrors.rentalPriceDaily = 'Daily rental price must be a positive number';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setForm({
        ...form,
        [name]: checked,
      });
    } else if (name.startsWith('rentalPrice.')) {
      const [_, field] = name.split('.');
      setForm({
        ...form,
        rentalPrice: {
          ...form.rentalPrice,
          [field]: value
        }
      });
    } else {
      setForm({
        ...form,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`/api/product/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          rentalPrice: {
            hourly: form.rentalPrice.hourly ? parseFloat(form.rentalPrice.hourly) : 0,
            daily: form.rentalPrice.daily ? parseFloat(form.rentalPrice.daily) : 0
          },
          image: form.image || 'https://via.placeholder.com/400?text=No+Image',
        }),
      });
      
      if (res.ok) {
        router.push(`/product/${id}`);
      } else {
        throw new Error('Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading product data...</p>
    </div>
  );
  
  if (!form) return (
    <div className="empty-state">
      <h3>Product not found</h3>
      <p>The product you are looking for does not exist or has been removed.</p>
      <button onClick={() => router.push('/')} className="btn-primary">
        Return to Dashboard
      </button>
    </div>
  );

  return (
    <div className="form-container">
      <h1>Update Product</h1>
      
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group">
          <label htmlFor="name">Product Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <p className="error">{errors.name}</p>}
        </div>
        
        <div className="form-group">
          <label htmlFor="brand">Brand</label>
          <input
            id="brand"
            name="brand"
            type="text"
            value={form.brand}
            onChange={handleChange}
            className={errors.brand ? 'error' : ''}
          />
          {errors.brand && <p className="error">{errors.brand}</p>}
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Product Category</label>
          <select
            id="category"
            name="category"
            value={form.category || ''}
            onChange={handleChange}
            className={`category-select ${errors.category ? 'error' : ''}`}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {errors.category && <p className="error">{errors.category}</p>}
        </div>
        
        <div className="form-group">
          <label htmlFor="price">Price ($)</label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            className={errors.price ? 'error' : ''}
          />
          {errors.price && <p className="error">{errors.price}</p>}
        </div>

        <div className="rental-section form-group">
          <div className="rental-toggle">
            <label htmlFor="isRentable" className="checkbox-label">
              <input
                id="isRentable"
                name="isRentable"
                type="checkbox"
                checked={form.isRentable}
                onChange={handleChange}
              />
              <span>Available for Rent</span>
            </label>
          </div>

          {form.isRentable && (
            <div className="rental-prices">
              <h3>Rental Options</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="rentalPrice.hourly">Hourly Rate ($)</label>
                  <input
                    id="rentalPrice.hourly"
                    name="rentalPrice.hourly"
                    type="number"
                    step="0.01"
                    placeholder="Enter hourly rate"
                    value={form.rentalPrice.hourly}
                    onChange={handleChange}
                    className={errors.rentalPriceHourly ? 'error' : ''}
                  />
                  {errors.rentalPriceHourly && <p className="error">{errors.rentalPriceHourly}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="rentalPrice.daily">Daily Rate ($)</label>
                  <input
                    id="rentalPrice.daily"
                    name="rentalPrice.daily"
                    type="number"
                    step="0.01"
                    placeholder="Enter daily rate"
                    value={form.rentalPrice.daily}
                    onChange={handleChange}
                    className={errors.rentalPriceDaily ? 'error' : ''}
                  />
                  {errors.rentalPriceDaily && <p className="error">{errors.rentalPriceDaily}</p>}
                </div>
              </div>
              {errors.rentalPrice && <p className="error">{errors.rentalPrice}</p>}
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="image">Image URL</label>
          <input
            id="image"
            name="image"
            type="text"
            placeholder="Enter image URL (optional)"
            value={form.image}
            onChange={handleChange}
          />
          <small>Leave blank to use a placeholder image</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            placeholder="Enter product description"
            value={form.description}
            onChange={handleChange}
            rows="5"
            className={errors.description ? 'error' : ''}
          ></textarea>
          {errors.description && <p className="error">{errors.description}</p>}
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn-outline"
            onClick={() => router.back()}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update Product'}
          </button>
        </div>
      </form>

      <style jsx>{`
        .product-form {
          background-color: var(--card-bg);
          border-radius: 8px;
          padding: 24px;
          box-shadow: 0 2px 8px var(--shadow-color);
          max-width: 800px;
          margin: 0 auto;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: var(--text-color);
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          background-color: var(--bg-color);
          color: var(--text-color);
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(var(--accent-rgb), 0.2);
          outline: none;
        }

        .form-group input.error,
        .form-group select.error,
        .form-group textarea.error {
          border-color: var(--danger-color);
        }

        .form-group small {
          display: block;
          margin-top: 5px;
          font-size: 0.85em;
          color: #666;
        }

        .error {
          color: var(--danger-color);
          font-size: 0.85em;
          margin-top: 5px;
        }

        .form-actions {
          margin-top: 30px;
          display: flex;
          gap: 15px;
          justify-content: flex-end;
        }

        .form-actions .btn-primary,
        .form-actions .btn-outline {
          font-size: 16px;
          padding: 10px 24px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          cursor: pointer;
          user-select: none;
        }

        .checkbox-label input {
          margin-right: 8px;
          width: auto;
        }

        .rental-section {
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 20px;
          background-color: rgba(var(--accent-rgb), 0.05);
        }

        .rental-prices {
          margin-top: 20px;
        }

        .rental-prices h3 {
          font-size: 16px;
          margin-bottom: 15px;
          color: var(--secondary-color);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        @media (max-width: 576px) {
          .form-row {
            grid-template-columns: 1fr;
            gap: 15px;
          }
          
          .product-form {
            padding: 16px;
          }
          
          .form-actions {
            flex-direction: column;
            gap: 10px;
          }
          
          .form-actions button {
            width: 100%;
          }
        }
        
        .empty-state {
          text-align: center;
          padding: 50px 20px;
          max-width: 600px;
          margin: 40px auto;
          background-color: var(--card-bg);
          border-radius: 8px;
          box-shadow: 0 2px 8px var(--shadow-color);
        }
      `}</style>
    </div>
  );
}
