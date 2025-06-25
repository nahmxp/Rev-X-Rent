import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../lib/AuthContext';
import withAuth from '../lib/withAuth';
import { loadStripe } from '@stripe/stripe-js';

// Load the Stripe.js library with your publishable key
// Make sure to replace with your actual public key from environment variables
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        // Use the user-specific endpoint instead of the general orders endpoint
        const response = await fetch('/api/user/orders');
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        
        const ordersData = await response.json();
        
        console.log(`Loaded ${ordersData.length} orders for the current user`);
        
        // Sort orders by date, newest first
        const sortedOrders = ordersData.sort((a, b) => 
          new Date(b.orderedAt) - new Date(a.orderedAt)
        );
        
        setOrders(sortedOrders);
      } catch (error) {
        console.error('Failed to load orders:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  // Update handlePayment function
  const handlePayment = async (order) => {
    setLoading(true); // Assuming you have a loading state for the button or page
    try {
      const stripe = await stripePromise;

      // Call your backend to create the Checkout Session
      const response = await fetch('/api/payment/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId: order._id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const session = await response.json();

      // When the customer clicks, redirect them to Checkout.
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        // If `redirectToCheckout` fails due to a browser or network error, display the localized error message to your customer.
        alert(result.error.message);
      }
    } catch (error) {
      console.error('Error during payment process:', error);
      alert('Payment failed. Please try again.' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusClass = (status) => {
    switch(status.toLowerCase()) {
      case 'processing': return 'status-processing';
      case 'paid': return 'status-paid';
      case 'confirmed': return 'status-confirmed';
      case 'sent': return 'status-sent';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  const toggleOrderDetails = (orderId) => {
    if (selectedOrder === orderId) {
      setSelectedOrder(null);
    } else {
      setSelectedOrder(orderId);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-container">
        <h1>My Orders</h1>
        <div className="empty-state">
          <img 
            src="https://via.placeholder.com/150?text=No+Orders" 
            alt="No orders" 
            style={{ opacity: 0.5 }}
          />
          <h3>No orders yet</h3>
          <p>You haven't placed any orders yet.</p>
          <Link href="/catalog">
            <button className="btn-primary">Start Renting</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <h1>My Orders</h1>
      <p className="order-count">
        Showing {orders.length} {orders.length === 1 ? 'order' : 'orders'}
      </p>

      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Date</th>
              <th>Type</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <>
                <tr key={order._id} className="order-row">
                  <td className="order-number">{order.orderNumber}</td>
                  <td className="order-date">{formatDate(order.orderedAt)}</td>
                  <td className="order-type">
                    {order.hasMixedItems ? 'Combined' : (order.hasRentalItems ? 'Rental' : 'Purchase')}
                  </td>
                  <td className="order-items-count">{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</td>
                  <td className="order-total">${order.total.toFixed(2)}</td>
                  <td className="order-status">
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="order-actions">
                    {order.paymentEnabled && order.status === 'processing' && (
                      <button 
                        className="pay-now-btn"
                        onClick={() => handlePayment(order)}
                        disabled={loading} // Disable button while loading
                      >
                        {loading ? 'Processing...' : 'Pay Now'}
                      </button>
                    )}
                    <button 
                      className="btn-details" 
                      onClick={() => toggleOrderDetails(order._id)}
                    >
                      {selectedOrder === order._id ? 'Hide Details' : 'View Details'}
                    </button>
                  </td>
                </tr>
                {selectedOrder === order._id && (
                  <tr className="order-details-row">
                    <td colSpan="7">
                      <div className="order-details">
                        <div className="order-details-grid">
                          <div className="order-shipping-info">
                            <h3>Shipping Information</h3>
                            <p><strong>Name:</strong> {order.customer.name}</p>
                            <p><strong>Email:</strong> {order.customer.email}</p>
                            <p><strong>Phone:</strong> {order.customer.phone}</p>
                            <p><strong>Address:</strong></p>
                            <p className="address-line">
                              {order.customer.address.street}<br />
                              {order.customer.address.city}, {order.customer.address.state} {order.customer.address.postalCode}
                            </p>
                          </div>
                          
                          <div className="order-financial-info">
                            <h3>Order Summary</h3>
                            <p><strong>Subtotal:</strong> ${order.subtotal.toFixed(2)}</p>
                            <p><strong>Tax:</strong> ${order.tax.toFixed(2)}</p>
                            <p><strong>Shipping:</strong> ${order.shippingFee.toFixed(2)}</p>
                            <p className="total-line"><strong>Total:</strong> ${order.total.toFixed(2)}</p>
                            
                            {order.paymentEnabled && order.status === 'processing' && (
                              <div className="payment-section">
                                <p className="payment-note">This order is ready for payment</p>
                                <button 
                                  className="pay-now-btn large"
                                  onClick={() => handlePayment(order)}
                                  disabled={loading} // Disable button while loading
                                >
                                  {loading ? 'Processing...' : `Pay Now $${order.total.toFixed(2)}`}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="order-items-list">
                          <h3>Items</h3>
                          <table className="order-items-table">
                            <thead>
                              <tr>
                                <th>Product</th>
                                <th>Type</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.items.map((item, index) => (
                                <tr key={index} className="order-item-row">
                                  <td className="order-item-name">{item.name}</td>
                                  <td className="order-item-type">{item.isRental ? 'Rental' : 'Purchase'}</td>
                                  <td className="order-item-price">
                                    {item.isRental && item.rentalDetails
                                      ? `$${item.rentalDetails.rate.toFixed(2)}/${item.rentalDetails.unit === 'hourly' ? 'hour' : 'day'} × ${item.rentalDetails.duration} ${item.rentalDetails.unit === 'hourly' ? 'hours' : 'days'}` 
                                      : `$${item.price.toFixed(2)}`}
                                  </td>
                                  <td className="order-item-quantity">{item.quantity}</td>
                                  <td className="order-item-total">
                                    ${item.isRental && item.rentalDetails
                                      ? (item.rentalDetails.rate * item.rentalDetails.duration * item.quantity).toFixed(2)
                                      : (item.price * item.quantity).toFixed(2)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="orders-actions">
        <Link href="/">
          <button className="btn-outline">Continue Browsing Cars</button>
        </Link>
      </div>
    </div>
  );
}

export default withAuth(Orders);