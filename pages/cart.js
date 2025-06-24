import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../lib/AuthContext';
import withAuth from '../lib/withAuth';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [processingItem, setProcessingItem] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [rentableProducts, setRentableProducts] = useState({});
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    // Verify authentication
    if (!isAuthenticated || !user) {
      return;
    }
    
    const fetchCartDetails = async () => {
      try {
        // Load cart from database API
        const response = await fetch('/api/user/cart');
        if (!response.ok) {
          throw new Error('Failed to fetch cart from API');
        }
        
        const cartData = await response.json();
        const savedCart = cartData.items || [];
        
        // Fetch details for each product to check if it's rentable
        const rentabilityMap = {};
        
        // Fetch product details in parallel
        await Promise.all(savedCart.map(async (item) => {
          try {
            const response = await fetch(`/api/product/${item.productId}`);
            if (response.ok) {
              const productData = await response.json();
              // Mark as rentable if the product has rental prices available
              rentabilityMap[item.productId] = productData.isRentable && 
                productData.rentalPrice &&
                (productData.rentalPrice.hourly > 0 || productData.rentalPrice.daily > 0);
            }
          } catch (err) {
            console.error(`Failed to fetch details for product ${item.productId}:`, err);
            rentabilityMap[item.productId] = false;
          }
        }));
        
        setRentableProducts(rentabilityMap);
        setCartItems(savedCart);
        
        // Calculate total price
        const total = savedCart.reduce((sum, item) => 
          sum + (item.price * (item.quantity || 1)), 0);
        setTotalPrice(total);
      } catch (error) {
        console.error('Failed to load cart from API', error);
        
        // Fallback to localStorage if API fails
        try {
          console.log('Falling back to localStorage for cart');
          const userKey = `cart_${user._id}`;
          const savedCart = JSON.parse(localStorage.getItem(userKey) || '[]');
          setCartItems(savedCart);
          
          // Calculate total price from localStorage
          const total = savedCart.reduce((sum, item) => 
            sum + (item.price * (item.quantity || 1)), 0);
          setTotalPrice(total);
          
          // Also try to sync localStorage data to server
          syncLocalStorageToServer(savedCart);
        } catch (localError) {
          console.error('Failed to load cart from localStorage', localError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCartDetails();
  }, [isAuthenticated, user]);
  
  // Function to sync localStorage cart to server
  const syncLocalStorageToServer = async (items) => {
    try {
      await fetch('/api/user/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });
      console.log('Successfully synced localStorage cart to server');
    } catch (error) {
      console.error('Failed to sync localStorage cart to server', error);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const updatedCart = cartItems.filter(item => item.productId !== productId);
      setCartItems(updatedCart);
      
      // Update cart in database
      await fetch('/api/user/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: updatedCart }),
      });
      
      // Also update localStorage as fallback
      const userKey = `cart_${user._id}`;
      localStorage.setItem(userKey, JSON.stringify(updatedCart));
      
      // Recalculate total
      const total = updatedCart.reduce((sum, item) => 
        sum + (item.price * (item.quantity || 1)), 0);
      setTotalPrice(total);
      
      setSuccessMessage('Product removed from cart');
      
      // Dispatch custom event to update cart count in header
      window.dispatchEvent(new CustomEvent('cart-updated', { 
        detail: { userId: user._id }
      }));
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Failed to remove from cart', error);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      const updatedCart = cartItems.map(item => {
        if (item.productId === productId) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
      
      setCartItems(updatedCart);
      
      // Update cart in database
      await fetch('/api/user/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: updatedCart }),
      });
      
      // Also update localStorage as fallback
      const userKey = `cart_${user._id}`;
      localStorage.setItem(userKey, JSON.stringify(updatedCart));
      
      // Recalculate total
      const total = updatedCart.reduce((sum, item) => 
        sum + (item.price * (item.quantity || 1)), 0);
      setTotalPrice(total);
      
      // Dispatch custom event to update cart count in header
      window.dispatchEvent(new CustomEvent('cart-updated', { 
        detail: { userId: user._id }
      }));
    } catch (error) {
      console.error('Failed to update quantity', error);
    }
  };

  const handleBuy = (product) => {
    setProcessingItem({ ...processingItem, [product.productId]: 'buying' });
    
    // Navigate to product detail page with buy action
    router.push(`/product/${product.productId}?action=buy`);
  };

  const handleRent = (product) => {
    setProcessingItem({ ...processingItem, [product.productId]: 'renting' });
    
    // Navigate to product detail page with rent action
    router.push(`/product/${product.productId}?action=rent`);
  };

  const proceedToCheckout = () => {
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading cart...</p>
      </div>
    );
  }
  
  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <h1>My Cart</h1>
        
        <div className="empty-state">
          <img 
            src="https://via.placeholder.com/150?text=Empty" 
            alt="Empty cart" 
            style={{ opacity: 0.5 }}
          />
          <h3>Your cart is empty</h3>
          <p>Add products to your cart to purchase or rent them.</p>
          <Link href="/catalog">
            <button className="btn-primary">Browse Products</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1>My Cart</h1>
      
      {successMessage && (
        <div className="success-message">
          <p>{successMessage}</p>
          <button onClick={() => setSuccessMessage('')} className="close-btn">
            ×
          </button>
        </div>
      )}

      <div className="cart-summary">
        <div className="cart-count">
          {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
        </div>
        <div className="cart-total">
          Total: <span className="price">${totalPrice.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="cart-items">
        {cartItems.map(product => (
          <div key={product.productId} className="cart-item">
            <div className="cart-item-image">
              <Link href={`/product/${product.productId}`}>
                <img 
                  src={product.image || 'https://via.placeholder.com/100'} 
                  alt={product.name} 
                />
              </Link>
            </div>
            
            <div className="cart-item-details">
              <Link href={`/product/${product.productId}`}>
                <h2 className="cart-item-name">{product.name}</h2>
              </Link>
              <p className="cart-item-brand">{product.brand}</p>
              <p className="cart-item-price">${product.price}</p>
              
              <div className="quantity-control">
                <button 
                  className="qty-btn" 
                  onClick={() => updateQuantity(product.productId, (product.quantity || 1) - 1)}
                  disabled={(product.quantity || 1) <= 1}
                >
                  -
                </button>
                <span className="quantity">{product.quantity || 1}</span>
                <button 
                  className="qty-btn" 
                  onClick={() => updateQuantity(product.productId, (product.quantity || 1) + 1)}
                >
                  +
                </button>
              </div>
              
              <p className="item-total">
                Item total: ${((product.price || 0) * (product.quantity || 1)).toFixed(2)}
              </p>
            </div>
            
            <div className="cart-item-actions">
              <button 
                className="buy-button" 
                onClick={() => handleBuy(product)}
                disabled={processingItem[product.productId] === 'buying'}
              >
                {processingItem[product.productId] === 'buying' ? 'Processing...' : 'Buy Now'}
              </button>
              
              {rentableProducts[product.productId] && (
                <button 
                  className="rent-button" 
                  onClick={() => handleRent(product)}
                  disabled={processingItem[product.productId] === 'renting'}
                >
                  {processingItem[product.productId] === 'renting' ? 'Processing...' : 'Rent'}
                </button>
              )}
              
              <button 
                className="remove-button" 
                onClick={() => removeFromCart(product.productId)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="cart-checkout">
        <div className="checkout-summary">
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping:</span>
            <span>$10.00</span>
          </div>
          <div className="summary-row">
            <span>Tax (10%):</span>
            <span>${(totalPrice * 0.1).toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>${(totalPrice + 10 + (totalPrice * 0.1)).toFixed(2)}</span>
          </div>
        </div>
        
        <button 
          className="checkout-button" 
          onClick={proceedToCheckout}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}

export default withAuth(Cart);