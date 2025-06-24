import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/AuthContext';

export default function ProductDetail() {
  const router = useRouter();
  const { id, action } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [transaction, setTransaction] = useState(null);
  const { isAuthenticated, isAdmin, user } = useAuth();
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          const res = await fetch(`/api/product/${id}`);
          
          if (!res.ok) {
            throw new Error('Product not found');
          }
          
          const data = await res.json();
          setProduct(data);

          // Check if delete action is requested and user is admin
          if (action === 'delete' && isAdmin) {
            setTimeout(() => {
              deleteProduct();
            }, 100);
          }
        } catch (error) {
          console.error('Failed to fetch product', error);
          setError('Failed to load product');
        } finally {
          setLoading(false);
        }
      };
      
      fetchProduct();
    }
  }, [id, action, isAdmin]);

  const deleteProduct = async () => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const res = await fetch(`/api/product/${id}`, {
          method: 'DELETE',
        });
        
        if (res.ok) {
          router.push('/');
        } else {
          throw new Error('Failed to delete product');
        }
      } catch (error) {
        console.error('Failed to delete product', error);
        alert('Failed to delete product');
      }
    }
  };

  const handleBuy = async () => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push(`/login?redirect=/product/${id}`);
      return;
    }
    
    // Redirect to checkout page with product info
    router.push({
      pathname: '/checkout',
      query: {
        productId: product._id,
        productName: product.name,
        price: product.price,
        image: product.image,
        fromSingle: 'true'
      }
    });
  };

  const handleRent = async () => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push(`/login?redirect=/product/${id}`);
      return;
    }
    
    // Redirect to checkout page with rental info
    router.push({
      pathname: '/checkout',
      query: {
        productId: product._id,
        productName: product.name,
        price: product.price,
        image: product.image,
        fromSingle: 'true',
        isRental: 'true',
        rentalPrices: JSON.stringify({
          hourly: product.rentalPrice?.hourly || 0,
          daily: product.rentalPrice?.daily || 0
        })
      }
    });
  };

  const handleAddToCart = async () => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push(`/login?redirect=/product/${id}`);
      return;
    }
    
    // Set loading state
    setAddingToCart(true);
    
    try {
      // Get current cart from database
      const cartResponse = await fetch('/api/user/cart');
      let cart = [];
      
      if (cartResponse.ok) {
        const cartData = await cartResponse.json();
        cart = cartData.items || [];
      }
      
      // Check if product already in cart
      const existingProductIndex = cart.findIndex(item => item.productId === product._id);
      
      if (existingProductIndex !== -1) {
        // Update existing product quantity
        cart[existingProductIndex].quantity = (cart[existingProductIndex].quantity || 1) + 1;
      } else {
        // Add new product to cart
        cart.push({
          productId: product._id,
          name: product.name,
          price: product.price,
          brand: product.brand,
          category: product.category,
          image: product.image,
          description: product.description,
          isRentable: product.isRentable,
          rentalPrice: product.rentalPrice,
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
    } catch (error) {
      console.error('Failed to add to cart', error);
      alert('Failed to add product to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push(`/login?redirect=/product/${id}`);
      return;
    }
    
    // Set loading state
    setAddingToWishlist(true);
    
    try {
      // Get current wishlist from database
      const wishlistResponse = await fetch('/api/user/wishlist');
      let wishlist = [];
      
      if (wishlistResponse.ok) {
        const wishlistData = await wishlistResponse.json();
        wishlist = wishlistData.items || [];
      }
      
      // Check if product already in wishlist
      const productExists = wishlist.some(item => item.productId === product._id);
      
      // Only add if it doesn't already exist
      if (!productExists) {
        wishlist.push({
          productId: product._id,
          name: product.name,
          price: product.price,
          brand: product.brand,
          category: product.category,
          image: product.image,
          description: product.description,
          isRentable: product.isRentable,
          rentalPrice: product.rentalPrice
        });
        
        // Update wishlist in database
        await fetch('/api/user/wishlist', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ items: wishlist }),
        });
        
        // Also update localStorage as fallback
        const userKey = `wishlist_${user._id}`;
        localStorage.setItem(userKey, JSON.stringify(wishlist));
        
        setSuccessMessage(`${product.name} added to wishlist!`);
        
        // Dispatch custom event to update wishlist count in header
        window.dispatchEvent(new CustomEvent('wishlist-updated', { 
          detail: { userId: user._id }
        }));
      } else {
        setSuccessMessage(`${product.name} is already in your wishlist!`);
      }
    } catch (error) {
      console.error('Failed to add to wishlist', error);
      alert('Failed to add product to wishlist');
    } finally {
      setAddingToWishlist(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }
  
  if (error) return <div className="error-message">{error}</div>;
  if (!product) return <div className="error-message">Product not found</div>;

  return (
    <div className="product-detail-page">
      <div className="breadcrumbs">
        <Link href="/catalog">Products</Link> / {product.name}
      </div>
      
      {successMessage && (
        <div className="success-message">
          <p>{successMessage}</p>
          <button onClick={() => setSuccessMessage('')} className="close-btn">
            ×
          </button>
        </div>
      )}
      
      <div className="product-detail">
        <div className="product-detail-header">
          <h1>{product.name}</h1>
          {isAdmin && (
            <div className="button-group">
              <Link href={`/update-product/${product._id}`}>
                <button className="update">Edit</button>
              </Link>
              <button className="delete" onClick={deleteProduct}>Delete</button>
            </div>
          )}
        </div>
        
        <div className="product-detail-content">
          <div className="product-image-container">
            <img 
              src={product.image || 'https://via.placeholder.com/400'} 
              alt={product.name} 
              className="product-image"
            />
          </div>
          
          <div className="product-info">
            <div className="product-meta">
              <div className="product-brand">
                <span className="label">Brand:</span>
                <span className="value">{product.brand}</span>
              </div>
              
              {product.category && (
                <div className="product-category">
                  <span className="label">Category:</span>
                  <span className="value">{product.category}</span>
                </div>
              )}
              
              <div className="product-price">
                <span className="label">Price:</span>
                <span className="value price">${product.price}</span>
              </div>
              
              <div className="product-id">
                <span className="label">Product ID:</span>
                <span className="value">{product._id}</span>
              </div>
            </div>
            
            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>
            
            <div className="product-actions">
              <button 
                className="buy-button" 
                onClick={handleBuy} 
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Buy Now'}
              </button>
              
              {/* Only show rent button if product is rentable and has rental prices */}
              {product.isRentable && product.rentalPrice && 
               (product.rentalPrice.hourly > 0 || product.rentalPrice.daily > 0) && (
                <button 
                  className="rent-button" 
                  onClick={handleRent} 
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Rent'}
                </button>
              )}
              
              <button 
                className="cart-button" 
                onClick={handleAddToCart} 
                disabled={addingToCart}
              >
                {addingToCart ? 'Adding...' : '+ Cart'}
              </button>
              <button 
                className="wishlist-button" 
                onClick={handleAddToWishlist} 
                disabled={addingToWishlist}
              >
                {addingToWishlist ? 'Adding...' : '+ Wishlist'}
              </button>
            </div>
            
            {transaction && (
              <div className="transaction-details">
                <h3>Last Transaction</h3>
                <p>Type: {transaction.transactionType === 'purchase' ? 'Purchase' : 'Rental'}</p>
                <p>Transaction ID: {transaction.transactionId}</p>
                <p>Date: {new Date(transaction.date || transaction.startDate).toLocaleString()}</p>
                {transaction.transactionType === 'rental' && (
                  <>
                    <p>Duration: {transaction.days} days</p>
                    <p>Return By: {new Date(transaction.returnDate).toLocaleDateString()}</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
