import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../lib/AuthContext';
import withAuth from '../lib/withAuth';

function Checkout() {
  const router = useRouter();
  const { productId, productName, price, image, fromSingle, isRental, rentalPrices } = router.query;
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    rentalDuration: '1', // Default rental duration
    rentalUnit: 'daily' // Default rental unit (daily/hourly)
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { user } = useAuth();

  // Track rental status and rental rates for each product
  const [productModes, setProductModes] = useState({});
  const [productRentalRates, setProductRentalRates] = useState({});

  // Calculate order total
  const [orderTotal, setOrderTotal] = useState(0);
  const shippingFee = 5.99;
  const tax = 0.08; // 8% tax
  const [isRentalOrder, setIsRentalOrder] = useState(false);
  const [rentalRates, setRentalRates] = useState({ hourly: 0, daily: 0 });

  useEffect(() => {
    if (user) {
      // Pre-fill form with user data if available
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email
      }));
    }
  }, [user]);

  useEffect(() => {
    // Check if this is a rental order
    setIsRentalOrder(isRental === 'true');
    
    const loadCheckoutItems = async () => {
      try {
        let itemsToProcess = [];
        let initialProductModes = {};
        let initialProductRentalRates = {};
        
        if (fromSingle === 'true' && productId && productName && price) {
          // Single product checkout case
          const item = {
            _id: productId,
            name: productName,
            price: parseFloat(price),
            image: image || 'https://via.placeholder.com/100',
            quantity: 1,
            isRental: isRental === 'true'
          };
          
          // If this is a rental, set rental rates
          if (isRental === 'true' && rentalPrices) {
            const rates = JSON.parse(rentalPrices);
            setRentalRates(rates);
            
            // Initialize with appropriate default rental unit based on available rates
            let defaultUnit = 'daily';
            if (rates.hourly > 0 && (!rates.daily || rates.daily <= 0)) {
              defaultUnit = 'hourly';
            }
            
            setFormData(prev => ({
              ...prev,
              rentalUnit: defaultUnit
            }));
            
            // Set up product mode and rates for this item
            initialProductModes[productId] = 'rent';
            initialProductRentalRates[productId] = rates;
            
            itemsToProcess = [item];
            calculateTotal([item], 1, rates, defaultUnit, initialProductModes);
          } else {
            initialProductModes[productId] = 'buy';
            itemsToProcess = [item];
            calculateTotal(itemsToProcess, 1, rentalRates, formData.rentalUnit, initialProductModes);
          }
        } else {
          // Rental cart checkout case
          const userKey = `cart_${user._id}`;
          const cartItems = JSON.parse(localStorage.getItem(userKey) || '[]');
          
          // Fetch rental rates for all products in cart
          itemsToProcess = [...cartItems];
          
          // For cart items, we need to fetch rental prices from API
          for (const item of itemsToProcess) {
            try {
              // Default to buy mode initially
              initialProductModes[item.productId || item._id] = 'buy';
              
              // Fetch product details to get rental rates
              const res = await fetch(`/api/product/${item.productId || item._id}`);
              if (res.ok) {
                const productData = await res.json();
                
                // Store rental rates if available
                if (productData.isRentable && productData.rentalPrice) {
                  initialProductRentalRates[item.productId || item._id] = {
                    hourly: productData.rentalPrice.hourly || 0,
                    daily: productData.rentalPrice.daily || 0
                  };
                  
                  // If the product is rentable and has valid rental prices,
                  // make sure it shows up in the productRentalRates object
                  // so the toggle is displayed
                  if (productData.rentalPrice.hourly > 0 || productData.rentalPrice.daily > 0) {
                    initialProductRentalRates[item.productId || item._id] = {
                      hourly: productData.rentalPrice.hourly || 0,
                      daily: productData.rentalPrice.daily || 0
                    };
                  }
                }
              }
            } catch (err) {
              console.error(`Failed to fetch rental rates for product ${item.productId || item._id}:`, err);
            }
          }
          
          calculateTotal(itemsToProcess, 1, rentalRates, formData.rentalUnit, initialProductModes);
        }
        
        setCart(itemsToProcess);
        setProductModes(initialProductModes);
        setProductRentalRates(initialProductRentalRates);
      } catch (error) {
        console.error('Error loading checkout items:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadCheckoutItems();
    }
  }, [productId, productName, price, image, fromSingle, isRental, rentalPrices, user]);

  const calculateTotal = (items, rentalDuration = 1, rates = rentalRates, rentalUnit = formData.rentalUnit, modes = productModes) => {
    let subtotal = 0;
    
    // Calculate for each item based on its mode (buy or rent)
    items.forEach(item => {
      const itemId = item.productId || item._id;
      const itemMode = modes[itemId] || 'buy';
      const quantity = item.quantity || 1;
      
      if (itemMode === 'rent') {
        // Get rates for this specific product
        const itemRates = productRentalRates[itemId] || rates;
        const rate = rentalUnit === 'hourly' ? itemRates.hourly : itemRates.daily;
        subtotal += rate * rentalDuration * quantity;
      } else {
        // Regular purchase
        subtotal += item.price * quantity;
      }
    });
    
    const taxAmount = subtotal * tax;
    const total = subtotal + taxAmount + shippingFee;
    setOrderTotal(total);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Check if this is a rental unit selection with dynamic name (rentalUnit-itemId)
    if (name.startsWith('rentalUnit-')) {
      // Update rentalUnit in formData
      setFormData(prev => ({
        ...prev,
        rentalUnit: value
      }));
      
      // Recalculate total with the new rental unit
      const duration = parseInt(formData.rentalDuration) || 1;
      calculateTotal(cart, duration, rentalRates, value, productModes);
      
      // Clear error if exists
      if (errors.rentalUnit) {
        setErrors(prev => ({
          ...prev,
          rentalUnit: ''
        }));
      }
    } else {
      // Standard form field update
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));

      // Clear error when user types
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
      
      // Recalculate total if rental details change
      if ((name === 'rentalDuration' || name === 'rentalUnit') && isRentalOrder) {
        const duration = name === 'rentalDuration' ? parseInt(value) || 1 : parseInt(formData.rentalDuration) || 1;
        const unit = name === 'rentalUnit' ? value : formData.rentalUnit;
        calculateTotal(cart, duration, rentalRates, unit, productModes);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10,15}$/.test(formData.phone.replace(/[^\d]/g, ''))) newErrors.phone = 'Phone number is invalid';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    
    if (isRentalOrder) {
      const duration = parseInt(formData.rentalDuration);
      if (!duration || duration < 1) {
        newErrors.rentalDuration = 'Please enter a valid rental duration';
      }
      
      // Validate that the selected rental unit has a rate
      const rate = formData.rentalUnit === 'hourly' ? rentalRates.hourly : rentalRates.daily;
      if (!rate || rate <= 0) {
        newErrors.rentalUnit = 'Selected rental unit is not available for this product';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare order items
      const orderItems = cart.map(item => {
        const itemId = item.productId || item._id;
        const itemMode = productModes[itemId] || 'buy';
        const isItemRental = itemMode === 'rent';
        
        const baseItem = {
          productId: itemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
          image: item.image
        };
        
        if (isItemRental) {
          const itemRates = productRentalRates[itemId];
          const rentalRate = formData.rentalUnit === 'hourly' ? itemRates.hourly : itemRates.daily;
          
          return {
            ...baseItem,
            isRental: true,
            rentalDetails: {
              duration: parseInt(formData.rentalDuration),
              unit: formData.rentalUnit,
              rate: rentalRate,
              returnDate: new Date(Date.now() + (parseInt(formData.rentalDuration) * 
                (formData.rentalUnit === 'hourly' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000)))
            }
          };
        } else {
          return {
            ...baseItem,
            isRental: false
          };
        }
      });
      
      // Check if this is a mixed order (both rental and purchase items)
      const hasRentalItems = orderItems.some(item => item.isRental);
      const hasPurchaseItems = orderItems.some(item => !item.isRental);
      const orderType = hasRentalItems && hasPurchaseItems ? 'combined' : 
                         hasRentalItems ? 'rental' : 'purchase';
      
      // Calculate subtotal
      let subtotal = 0;
      orderItems.forEach(item => {
        if (item.isRental) {
          subtotal += item.rentalDetails.rate * item.rentalDetails.duration * item.quantity;
        } else {
          subtotal += item.price * item.quantity;
        }
      });
      
      const taxAmount = subtotal * tax;
      const totalAmount = subtotal + taxAmount + shippingFee;
      
      // Create the order object
      const order = {
        userId: user._id,
        items: orderItems,
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: {
            street: formData.address,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode
          }
        },
        subtotal,
        tax: taxAmount,
        shippingFee,
        total: totalAmount,
        hasRentalItems,
        hasMixedItems: hasRentalItems && hasPurchaseItems
      };
      
      // Submit the order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create order');
      }
      
      const result = await response.json();
      
      // Clear the user's cart if this was a cart checkout
      if (fromSingle !== 'true') {
        try {
          await fetch('/api/user/cart', {
            method: 'DELETE',
          });
          
          // Also clear localStorage cart
          const userKey = `cart_${user._id}`;
          localStorage.removeItem(userKey);
          
          // Update cart badge
          window.dispatchEvent(new CustomEvent('cart-updated', { 
            detail: { userId: user._id }
          }));
        } catch (error) {
          console.error('Failed to clear cart', error);
        }
      }
      
      // Show success message and redirect to orders page
      setSuccessMessage(`Order ${result.orderNumber} created successfully! Redirecting to your orders...`);
      setTimeout(() => {
        router.push('/orders');
      }, 3000);
    } catch (error) {
      console.error('Order submission error:', error);
      setErrors({ submit: 'Failed to create order. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add this handler for quantity changes
  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cart.map(item => {
      // Check if this is the item we want to update
      if ((item.productId && item.productId === itemId) || (item._id && item._id === itemId)) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    
    setCart(updatedCart);
    
    // Recalculate total with updated quantities
    const duration = parseInt(formData.rentalDuration) || 1;
    calculateTotal(updatedCart, duration, rentalRates, formData.rentalUnit, productModes);
  };

  // Add this handler to toggle between buy and rent modes for a product
  const toggleProductMode = (itemId) => {
    // Can only toggle if rental rates are available
    if (!productRentalRates[itemId]) return;
    
    const currentMode = productModes[itemId] || 'buy';
    const newMode = currentMode === 'buy' ? 'rent' : 'buy';
    
    // Update the product modes
    const updatedModes = {
      ...productModes,
      [itemId]: newMode
    };
    
    setProductModes(updatedModes);
    
    // Recalculate totals with the updated modes
    const duration = parseInt(formData.rentalDuration) || 1;
    calculateTotal(cart, duration, rentalRates, formData.rentalUnit, updatedModes);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading checkout...</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="checkout-container">
        <h1>Checkout</h1>
        <div className="empty-state">
          <img 
            src="https://via.placeholder.com/150?text=Empty" 
            alt="Empty cart" 
            style={{ opacity: 0.5 }}
          />
          <h3>Your cart is empty</h3>
          <p>Add some products to your cart before checking out.</p>
          <Link href="/catalog">
            <button className="btn-primary">Browse Products</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h1>{isRentalOrder ? 'Rental Checkout' : 'Checkout'}</h1>
      
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
      
      <div className="checkout-content">
        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="product-list">
            {cart.map(item => (
              <div key={item.productId || item._id} className="product-row">
                <div className="product-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="product-details">
                  <div className="product-header">
                    <h3>{item.name}</h3>
                    {productRentalRates[item.productId || item._id] && (
                      <div className="mode-toggle">
                        <label className="toggle-label">
                          <span className={productModes[item.productId || item._id] === 'buy' ? 'active' : ''}>Buy</span>
                          <div className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={productModes[item.productId || item._id] === 'rent'}
                              onChange={() => toggleProductMode(item.productId || item._id)}
                            />
                            <span className="slider"></span>
                          </div>
                          <span className={productModes[item.productId || item._id] === 'rent' ? 'active' : ''}>Rent</span>
                        </label>
                      </div>
                    )}
                  </div>
                  
                  {(productModes[item.productId || item._id] === 'rent' && productRentalRates[item.productId || item._id]) ? (
                    <div className="rental-details">
                      <div className="rental-unit-selector">
                        <h4>Rental Options:</h4>
                        {productRentalRates[item.productId || item._id].hourly > 0 && (
                          <label>
                            <input
                              type="radio"
                              name={`rentalUnit-${item.productId || item._id}`}
                              value="hourly"
                              checked={formData.rentalUnit === 'hourly'}
                              onChange={handleInputChange}
                            />
                            <span className="rental-option">
                              <span className="rental-type">Hourly</span>
                              <span className="rental-price">${productRentalRates[item.productId || item._id].hourly}/hour</span>
                            </span>
                          </label>
                        )}
                        {productRentalRates[item.productId || item._id].daily > 0 && (
                          <label>
                            <input
                              type="radio"
                              name={`rentalUnit-${item.productId || item._id}`}
                              value="daily"
                              checked={formData.rentalUnit === 'daily'}
                              onChange={handleInputChange}
                            />
                            <span className="rental-option">
                              <span className="rental-type">Daily</span>
                              <span className="rental-price">${productRentalRates[item.productId || item._id].daily}/day</span>
                            </span>
                          </label>
                        )}
                        {(!productRentalRates[item.productId || item._id].hourly && !productRentalRates[item.productId || item._id].daily) && (
                          <p className="error">No rental options available for this product</p>
                        )}
                      </div>
                      
                      <div className="rental-controls-row">
                        {(productRentalRates[item.productId || item._id].hourly > 0 || productRentalRates[item.productId || item._id].daily > 0) && (
                          <div className="rental-duration">
                            <label htmlFor={`rentalDuration-${item.productId || item._id}`}>
                              Duration:
                            </label>
                            <div className="duration-input">
                              <input
                                type="number"
                                id={`rentalDuration-${item.productId || item._id}`}
                                name="rentalDuration"
                                min="1"
                                value={formData.rentalDuration}
                                onChange={handleInputChange}
                              />
                              <span className="duration-unit">
                                {formData.rentalUnit === 'hourly' ? 'hours' : 'days'}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        <div className="rental-quantity">
                          <label>Quantity:</label>
                          <div className="quantity-control">
                            <button 
                              type="button" 
                              className="qty-btn decrease"
                              onClick={() => handleQuantityChange(item.productId || item._id, (item.quantity || 1) - 1)}
                              disabled={(item.quantity || 1) <= 1}
                            >
                              -
                            </button>
                            <span className="quantity">{item.quantity || 1}</span>
                            <button 
                              type="button" 
                              className="qty-btn increase"
                              onClick={() => handleQuantityChange(item.productId || item._id, (item.quantity || 1) + 1)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="rental-summary">
                        <p>
                          <strong>Rate:</strong> ${formData.rentalUnit === 'hourly' ? 
                            productRentalRates[item.productId || item._id].hourly : 
                            productRentalRates[item.productId || item._id].daily}
                          /{formData.rentalUnit === 'hourly' ? 'hour' : 'day'}
                        </p>
                        <p>
                          <strong>Duration:</strong> {formData.rentalDuration} {formData.rentalUnit === 'hourly' ? 'hours' : 'days'}
                        </p>
                        <p>
                          <strong>Quantity:</strong> {item.quantity || 1} {(item.quantity || 1) > 1 ? 'items' : 'item'}
                        </p>
                        <p className="rental-item-total">
                          <strong>Subtotal:</strong> ${((formData.rentalUnit === 'hourly' ? 
                            productRentalRates[item.productId || item._id].hourly : 
                            productRentalRates[item.productId || item._id].daily) * 
                            parseInt(formData.rentalDuration) * 
                            (item.quantity || 1)).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="purchase-details">
                      <p className="price">${item.price}</p>
                      <div className="quantity-control">
                        <button 
                          type="button" 
                          className="qty-btn decrease"
                          onClick={() => handleQuantityChange(item.productId || item._id, (item.quantity || 1) - 1)}
                          disabled={(item.quantity || 1) <= 1}
                        >
                          -
                        </button>
                        <span className="quantity">{item.quantity || 1}</span>
                        <button 
                          type="button" 
                          className="qty-btn increase"
                          onClick={() => handleQuantityChange(item.productId || item._id, (item.quantity || 1) + 1)}
                        >
                          +
                        </button>
                      </div>
                      <p className="item-total">
                        <span>Subtotal:</span> 
                        <span>${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="order-totals">
            <div className="subtotal">
              <span>Subtotal:</span>
              <span>${(orderTotal - shippingFee - (orderTotal * tax / (1 + tax))).toFixed(2)}</span>
            </div>
            <div className="tax">
              <span>Tax (8%):</span>
              <span>${(orderTotal * tax / (1 + tax)).toFixed(2)}</span>
            </div>
            <div className="shipping">
              <span>Shipping:</span>
              <span>${shippingFee.toFixed(2)}</span>
            </div>
            <div className="total">
              <span>Total:</span>
              <span>${orderTotal.toFixed(2)}</span>
            </div>
            <div className="order-disclaimer">
              <p>! Tax and Shipping charge may change after order for product quantity and delivery location !</p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="checkout-form">
          <h2>Shipping Information</h2>
          
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            {errors.name && <p className="error">{errors.name}</p>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            {errors.email && <p className="error">{errors.email}</p>}
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
            {errors.phone && <p className="error">{errors.phone}</p>}
          </div>
          
          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
            />
            {errors.address && <p className="error">{errors.address}</p>}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
              {errors.city && <p className="error">{errors.city}</p>}
            </div>
            
            <div className="form-group">
              <label htmlFor="state">State</label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
              />
              {errors.state && <p className="error">{errors.state}</p>}
            </div>
            
            <div className="form-group">
              <label htmlFor="postalCode">Postal Code</label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                required
              />
              {errors.postalCode && <p className="error">{errors.postalCode}</p>}
            </div>
          </div>
          
          <div className="form-actions">
            <Link href="/catalog">
              <button type="button" className="btn-outline">Continue Browsing Cars</button>
            </Link>
          </div>
          
          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : (isRentalOrder ? 'Complete Rental' : 'Place Order')}
          </button>
        </form>
      </div>

      <style jsx>{`
        .checkout-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .checkout-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-top: 20px;
        }
        
        .order-summary {
          background: var(--card-bg);
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px var(--shadow-color);
        }
        
        .product-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .order-disclaimer {
          margin-top: 15px;
          padding: 10px;
          background-color: rgba(255, 152, 0, 0.1);
          border-left: 3px solid var(--warning-color);
          text-align: center;
        }
        
        .order-disclaimer p {
          margin: 0;
          color: var(--warning-dark);
          font-size: 14px;
          font-weight: 500;
        }
        
        .product-row {
          display: flex;
          gap: 15px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border-color);
        }
        
        .product-image {
          width: 100px;
          height: 100px;
          flex-shrink: 0;
        }
        
        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 4px;
        }
        
        .product-details {
          flex: 1;
        }
        
        .product-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .product-header h3 {
          margin: 0;
          color: var(--text-color);
        }
        
        .mode-toggle {
          margin-left: 10px;
        }
        
        .toggle-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          cursor: pointer;
        }
        
        .toggle-label span {
          color: var(--text-color);
          opacity: 0.6;
          transition: opacity 0.2s, color 0.2s;
        }
        
        .toggle-label span.active {
          opacity: 1;
          font-weight: 600;
        }
        
        .toggle-label span:first-child.active {
          color: var(--buy-color);
        }
        
        .toggle-label span:last-child.active {
          color: var(--rent-color);
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
        
        .purchase-details {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .price {
          font-size: 1.2em;
          font-weight: 600;
          color: var(--buy-color);
        }
        
        .quantity-control {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 8px 0;
        }
        
        .qty-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 4px;
          background-color: var(--light-gray);
          color: var(--text-color);
          font-size: 16px;
          font-weight: bold;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .qty-btn:hover {
          background-color: var(--border-color);
        }
        
        .qty-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .quantity {
          font-weight: 600;
          padding: 0 5px;
          min-width: 30px;
          text-align: center;
        }
        
        .item-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 500;
          margin-top: 5px;
          padding-top: 5px;
          border-top: 1px dashed var(--border-color);
        }
        
        .rental-details {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px dashed var(--border-color);
        }
        
        .rental-unit-selector {
          margin-bottom: 15px;
        }
        
        .rental-unit-selector h4 {
          margin-top: 0;
          margin-bottom: 10px;
          font-size: 14px;
          color: var(--secondary-color);
        }
        
        .rental-unit-selector label {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          padding: 8px;
          border-radius: 4px;
          transition: background-color 0.2s;
          cursor: pointer;
        }
        
        .rental-unit-selector label:hover {
          background-color: rgba(var(--accent-rgb), 0.05);
        }
        
        .rental-unit-selector input {
          margin-right: 10px;
          width: auto;
        }
        
        .rental-option {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex: 1;
        }
        
        .rental-type {
          font-weight: 500;
          color: var(--rent-color);
        }
        
        .rental-price {
          font-weight: 600;
        }
        
        .rental-controls-row {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          margin-bottom: 15px;
        }
        
        .rental-quantity {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        
        .rental-quantity label {
          font-weight: 500;
          color: var(--text-color);
        }
        
        .rental-duration {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        
        .rental-duration label {
          font-weight: 500;
          color: var(--text-color);
        }
        
        .duration-input {
          display: flex;
          align-items: center;
          gap: 10px;
          max-width: 150px;
        }
        
        .duration-input input {
          width: 80px;
          padding: 8px 10px;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          background-color: var(--bg-color);
          color: var(--text-color);
          text-align: center;
        }
        
        .duration-unit {
          font-size: 0.9em;
          color: var(--text-color);
        }
        
        .rental-summary {
          margin-top: 15px;
          padding: 12px;
          background-color: rgba(var(--accent-rgb), 0.08);
          border-radius: 6px;
          border-left: 3px solid var(--rent-color);
        }
        
        .rental-summary p {
          margin: 6px 0;
          font-size: 0.95em;
        }
        
        .rental-summary strong {
          color: var(--rent-color);
          display: inline-block;
          width: 80px;
        }
        
        .rental-item-total {
          margin-top: 8px !important;
          padding-top: 8px;
          border-top: 1px dashed var(--border-color);
          font-weight: 500;
        }
        
        .rental-item-total strong {
          color: var(--rent-color-dark) !important;
          font-weight: 600;
        }
        
        .order-totals {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid var(--border-color);
        }
        
        .order-totals > div {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        
        .total {
          font-weight: bold;
          font-size: 1.2em;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 2px solid var(--border-color);
        }
        
        .checkout-form {
          background: var(--card-bg);
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px var(--shadow-color);
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: var(--text-color);
        }
        
        input {
          width: 100%;
          padding: 10px;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          background-color: var(--bg-color);
          color: var(--text-color);
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        
        input:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(var(--accent-rgb), 0.2);
          outline: none;
        }
        
        .error {
          color: var(--danger-color);
          font-size: 0.9em;
          margin-top: 5px;
        }
        
        .submit-button {
          width: 100%;
          padding: 12px;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1.1em;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .submit-button:hover {
          background: var(--primary-dark);
        }
        
        .submit-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        
        .success-message {
          background: var(--success-color);
          color: white;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 200px;
        }
        
        .loading-spinner {
          border: 4px solid var(--border-color);
          border-top: 4px solid var(--primary-color);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 10px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .checkout-content {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          
          .order-summary {
            position: relative;
            top: 0;
            margin-bottom: 20px;
          }
          
          .product-row {
            flex-direction: column;
          }
          
          .product-image {
            width: 100%;
            height: auto;
            margin-bottom: 10px;
          }
          
          .product-image img {
            max-height: 200px;
            width: 100%;
            object-fit: contain;
          }
          
          .product-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          
          .mode-toggle {
            margin-left: 0;
            width: 100%;
          }
          
          .toggle-label {
            justify-content: space-between;
            width: 100%;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .checkout-form {
            margin-top: 20px;
          }
        }
      `}</style>
    </div>
  );
}

export default withAuth(Checkout);