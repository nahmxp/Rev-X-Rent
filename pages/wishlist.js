import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../lib/AuthContext';
import withAuth from '../lib/withAuth';

function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [addingToCart, setAddingToCart] = useState({});
  const [addingAllToCart, setAddingAllToCart] = useState(false);
  const [rentableProducts, setRentableProducts] = useState({});
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    // Verify authentication
    if (!isAuthenticated || !user) {
      return;
    }

    // Load wishlist and fetch product details
    const fetchWishlistDetails = async () => {
      try {
        // Load wishlist from database API
        const response = await fetch('/api/user/wishlist');
        if (!response.ok) {
          throw new Error('Failed to fetch wishlist from API');
        }
        
        const wishlistData = await response.json();
        const savedWishlist = wishlistData.items || [];
        
        // Fetch details for each product to check if it's rentable
        const rentabilityMap = {};
        
        // Fetch product details in parallel
        await Promise.all(savedWishlist.map(async (item) => {
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
        setWishlistItems(savedWishlist);
      } catch (error) {
        console.error('Failed to load wishlist', error);
        
        // Fallback to localStorage if API fails
        try {
          console.log('Falling back to localStorage for wishlist');
          const userKey = `wishlist_${user._id}`;
          const savedWishlist = JSON.parse(localStorage.getItem(userKey) || '[]');
          setWishlistItems(savedWishlist);
          
          // Also try to sync localStorage data to server
          syncLocalStorageToServer(savedWishlist);
        } catch (localError) {
          console.error('Failed to load wishlist from localStorage', localError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistDetails();
  }, [isAuthenticated, user]);
  
  // Function to sync localStorage wishlist to server
  const syncLocalStorageToServer = async (items) => {
    try {
      await fetch('/api/user/wishlist', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });
      console.log('Successfully synced localStorage wishlist to server');
    } catch (error) {
      console.error('Failed to sync localStorage wishlist to server', error);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const updatedWishlist = wishlistItems.filter(item => item.productId !== productId);
      setWishlistItems(updatedWishlist);
      
      // Update wishlist in database
      await fetch('/api/user/wishlist', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: updatedWishlist }),
      });
      
      // Also update localStorage as fallback
      const userKey = `wishlist_${user._id}`;
      localStorage.setItem(userKey, JSON.stringify(updatedWishlist));
      
      setSuccessMessage('Product removed from wishlist');
      
      // Dispatch custom event to update wishlist count in header
      window.dispatchEvent(new CustomEvent('wishlist-updated', { 
        detail: { userId: user._id }
      }));
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Failed to remove from wishlist', error);
    }
  };

  const handleBuy = (product) => {
    router.push(`/product/${product.productId}?action=buy`);
  };

  const handleRent = (product) => {
    router.push(`/product/${product.productId}?action=rent`);
  };

  const addToCart = async (product) => {
    // Set loading state for this specific product
    setAddingToCart({...addingToCart, [product.productId]: true});
    
    try {
      // Get current cart from database
      const cartResponse = await fetch('/api/user/cart');
      let cart = [];
      
      if (cartResponse.ok) {
        const cartData = await cartResponse.json();
        cart = cartData.items || [];
      }
      
      // Check if product already in cart
      const existingProductIndex = cart.findIndex(item => item.productId === product.productId);
      
      if (existingProductIndex !== -1) {
        // Update existing product quantity
        cart[existingProductIndex].quantity = (cart[existingProductIndex].quantity || 1) + 1;
      } else {
        // Add new product to cart
        cart.push({
          ...product,
          quantity: 1
        });
      }
      
      // Update cart in database
      await fetch('/api/user/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: cart }),
      });
      
      // Also update localStorage as fallback
      const userKey = `cart_${user._id}`;
      localStorage.setItem(userKey, JSON.stringify(cart));
      
      setSuccessMessage(`${product.name} added to cart!`);
      
      // Dispatch custom event to update cart count in header
      window.dispatchEvent(new CustomEvent('cart-updated', { 
        detail: { userId: user._id }
      }));
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Failed to add to cart', error);
      alert('Failed to add product to cart');
    } finally {
      // Clear loading state for this product
      setAddingToCart({...addingToCart, [product.productId]: false});
    }
  };

  const addAllToCart = async () => {
    if (wishlistItems.length === 0) return;
    
    setAddingAllToCart(true);
    
    try {
      // Get current cart from database
      const cartResponse = await fetch('/api/user/cart');
      let cart = [];
      
      if (cartResponse.ok) {
        const cartData = await cartResponse.json();
        cart = cartData.items || [];
      }
      
      let addedCount = 0;
      
      // Add each wishlist item to cart if not already there
      wishlistItems.forEach(product => {
        const existingProductIndex = cart.findIndex(item => item.productId === product.productId);
        
        if (existingProductIndex !== -1) {
          // Update existing product quantity
          cart[existingProductIndex].quantity = (cart[existingProductIndex].quantity || 1) + 1;
        } else {
          // Add new product to cart
          cart.push({
            ...product,
            quantity: 1
          });
          addedCount++;
        }
      });
      
      // Update cart in database
      await fetch('/api/user/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: cart }),
      });
      
      // Also update localStorage as fallback
      const userKey = `cart_${user._id}`;
      localStorage.setItem(userKey, JSON.stringify(cart));
      
      // Dispatch custom event to update cart count in header
      window.dispatchEvent(new CustomEvent('cart-updated', { 
        detail: { userId: user._id }
      }));
      
      setSuccessMessage(`${addedCount} ${addedCount === 1 ? 'item' : 'items'} added to cart!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Failed to add items to cart', error);
      alert('Failed to add items to cart');
    } finally {
      setAddingAllToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading wishlist...</p>
      </div>
    );
  }
  
  if (wishlistItems.length === 0) {
    return (
      <div className="wishlist-container">
        <h1>My Wishlist</h1>
        
        <div className="empty-state">
          <img 
            src="https://via.placeholder.com/150?text=Empty" 
            alt="Empty wishlist" 
            style={{ opacity: 0.5 }}
          />
          <h3>Your wishlist is empty</h3>
          <p>Add products to your wishlist to keep track of items you're interested in.</p>
          <Link href="/catalog">
            <button className="btn-primary">Browse Products</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-container">
      <h1>My Wishlist</h1>
      
      {successMessage && (
        <div className="success-message">
          <p>{successMessage}</p>
          <button onClick={() => setSuccessMessage('')} className="close-btn">
            ×
          </button>
        </div>
      )}

      <div className="wishlist-header">
        <div className="wishlist-count">
          {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
        </div>
        <button 
          className="add-all-to-cart-button" 
          onClick={addAllToCart}
          disabled={addingAllToCart}
        >
          {addingAllToCart ? 'Adding...' : 'Add All to Cart'}
        </button>
      </div>
      
      <div className="wishlist-items">
        {wishlistItems.map(product => (
          <div key={product.productId} className="wishlist-item">
            <div className="wishlist-item-image">
              <Link href={`/product/${product.productId}`}>
                <img 
                  src={product.image || 'https://via.placeholder.com/100'} 
                  alt={product.name} 
                />
              </Link>
            </div>
            
            <div className="wishlist-item-details">
              <Link href={`/product/${product.productId}`}>
                <h2 className="wishlist-item-name">{product.name}</h2>
              </Link>
              <p className="wishlist-item-brand">{product.brand}</p>
              <p className="wishlist-item-price">${product.price}</p>
            </div>
            
            <div className="wishlist-item-actions">
              <button 
                className="buy-button" 
                onClick={() => handleBuy(product)}
              >
                Buy Now
              </button>
              
              {rentableProducts[product.productId] && (
                <button 
                  className="rent-button" 
                  onClick={() => handleRent(product)}
                >
                  Rent
                </button>
              )}
              
              <button 
                className="cart-button" 
                onClick={() => addToCart(product)}
                disabled={addingToCart[product.productId]}
              >
                {addingToCart[product.productId] ? 'Adding...' : '+ Cart'}
              </button>
              <button 
                className="remove-button" 
                onClick={() => removeFromWishlist(product.productId)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default withAuth(Wishlist); 