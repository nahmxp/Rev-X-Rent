import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import withAdminAuth from '../lib/withAdminAuth';
import { loadStripe } from '@stripe/stripe-js';

// Load the Stripe.js library with your publishable key
// Make sure to replace with your actual public key from environment variables
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

function AllOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sortField, setSortField] = useState('orderedAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [statusUpdates, setStatusUpdates] = useState({});
  const [shippingOptions, setShippingOptions] = useState({});
  const [taxOptions, setTaxOptions] = useState({});
  const [offerOptions, setOfferOptions] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  const fetchOrders = useCallback(async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    setError(null);
    
    try {
      const response = await fetch('/api/admin/all-orders');
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const ordersData = await response.json();
      console.log(`Loaded ${ordersData.length} orders from the admin API`);
      
      if (ordersData.length === 0) {
        // If no orders found, attempt to seed
        try {
          const seedResponse = await fetch('/api/seed-orders');
          if (seedResponse.ok) {
            // Try fetching orders again after seeding
            const retryResponse = await fetch('/api/admin/all-orders');
            if (retryResponse.ok) {
              const retryData = await retryResponse.json();
              setOrders(retryData);
              console.log('Successfully loaded orders after seeding');
            }
          }
        } catch (seedError) {
          console.error('Failed to seed orders:', seedError);
          setError('Failed to load orders. Please try again later.');
        }
      } else {
        setOrders(ordersData);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
      setError(error.message || 'Failed to load orders. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  
  // Initialize or update shipping options when orders change
  useEffect(() => {
    if (orders.length > 0) {
      const initialShippingOptions = {};
      const initialTaxOptions = {};
      const initialOfferOptions = {};
      
      orders.forEach(order => {
        // Set shipping options
        const shippingOption = order.shippingFee === 0 
          ? "free" 
          : order.shippingFee === 15 
            ? "standard" 
            : "custom";
        initialShippingOptions[order._id] = shippingOption;
        
        // Set tax options (standard is 8% or custom)
        const standardTaxRate = 0.08;
        const calculatedStandardTax = order.subtotal * standardTaxRate;
        const taxOption = Math.abs(order.tax - calculatedStandardTax) < 0.01 
          ? "standard" 
          : "custom";
        initialTaxOptions[order._id] = taxOption;

        // Set offer options
        initialOfferOptions[order._id] = order.offer?.type || 'none';
      });
      
      setShippingOptions(initialShippingOptions);
      setTaxOptions(initialTaxOptions);
      setOfferOptions(initialOfferOptions);
    }
  }, [orders]);
  
  // Determine price range based on orders
  useEffect(() => {
    if (orders.length > 0) {
      const prices = orders.map(order => order.total);
      const minOrderPrice = Math.floor(Math.min(...prices));
      const maxOrderPrice = Math.ceil(Math.max(...prices));
      
      setMinPrice(minOrderPrice);
      setMaxPrice(maxOrderPrice);
      setPriceRange({ min: minOrderPrice, max: maxOrderPrice });
    }
  }, [orders]);

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

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (e) => {
    setFilterStatus(e.target.value);
  };

  const handleTypeFilter = (e) => {
    setFilterType(e.target.value);
  };

  const handleMinPriceChange = (e) => {
    const value = Number(e.target.value);
    setPriceRange(prev => ({ ...prev, min: value }));
  };

  const handleMaxPriceChange = (e) => {
    const value = Number(e.target.value);
    setPriceRange(prev => ({ ...prev, max: value }));
  };

  const handlePriceRangeReset = () => {
    setPriceRange({ min: minPrice, max: maxPrice });
  };

  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  // Helper function to update shipping fee
  const updateShippingFee = (orderId, newShippingFee, oldShippingFee) => {
    // Update shipping fee via API
    fetch(`/api/order/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ shippingFee: newShippingFee })
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Failed to update shipping fee');
    })
    .then(updatedOrder => {
      // Update orders in state
      const updatedOrders = orders.map(o => 
        o._id === orderId ? updatedOrder : o
      );
      setOrders(updatedOrders);
      
      // Display confirmation message
      alert(`Shipping fee updated from $${oldShippingFee.toFixed(2)} to $${updatedOrder.shippingFee.toFixed(2)}. Order total recalculated to $${updatedOrder.total.toFixed(2)}.`);
    })
    .catch(error => {
      console.error('Error updating shipping fee:', error);
      alert('Failed to update shipping fee. Please try again.');
    });
  };
  
  const updateTax = (orderId, newTax, oldTax) => {
    fetch(`/api/order/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tax: newTax })
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Failed to update tax');
    })
    .then(updatedOrder => {
      const updatedOrders = orders.map(o => 
        o._id === orderId ? updatedOrder : o
      );
      setOrders(updatedOrders);
      
      const taxRate = ((newTax / updatedOrder.subtotal) * 100).toFixed(1);
      alert(`Tax updated from $${oldTax.toFixed(2)} (${((oldTax / updatedOrder.subtotal) * 100).toFixed(1)}%) to $${newTax.toFixed(2)} (${taxRate}%). Order total recalculated to $${updatedOrder.total.toFixed(2)}.`);
    })
    .catch(error => {
      console.error('Error updating tax:', error);
      alert('Failed to update tax. Please try again.');
    });
  };

  const updateOffer = (orderId, offerData) => {
    fetch(`/api/order/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ offer: offerData })
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Failed to update offer');
    })
    .then(updatedOrder => {
      const updatedOrders = orders.map(o => 
        o._id === orderId ? updatedOrder : o
      );
      setOrders(updatedOrders);
      
      let message;
      if (offerData.type === 'none') {
        message = `Offer removed. Order total restored to $${updatedOrder.total.toFixed(2)}`;
      } else {
        const originalTotal = updatedOrder.originalValues?.total || updatedOrder.total;
        const discountAmount = originalTotal - updatedOrder.total;
        const percentSaved = ((discountAmount / originalTotal) * 100).toFixed(1);
        message = `Offer applied successfully. Discount: $${discountAmount.toFixed(2)} (${percentSaved}% savings). New total: $${updatedOrder.total.toFixed(2)}`;
      }
      alert(message);
    })
    .catch(error => {
      console.error('Error updating offer:', error);
      alert('Failed to update offer. Please try again.');
    });
  };

  // Apply filters and sorting
  const filteredAndSortedOrders = orders
    .filter(order => {
      // Search filter - check if search term is in order number, customer name, or email
      const searchMatch = !searchTerm || 
        order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const statusMatch = filterStatus === 'all' || order.status?.toLowerCase() === filterStatus.toLowerCase();
      
      // Type filter
      let typeMatch = true;
      if (filterType === 'purchase') {
        typeMatch = !order.hasRentalItems;
      } else if (filterType === 'rental') {
        typeMatch = order.hasRentalItems && !order.hasMixedItems;
      } else if (filterType === 'combined') {
        typeMatch = order.hasMixedItems;
      }
      
      // Price range filter
      const priceMatch = order.total >= priceRange.min && order.total <= priceRange.max;
      
      return searchMatch && statusMatch && typeMatch && priceMatch;
    })
    .sort((a, b) => {
      // Default fallback values
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      
      // Handle different field types
      if (sortField === 'orderedAt') {
        return sortDirection === 'asc' 
          ? new Date(aValue) - new Date(bValue)
          : new Date(bValue) - new Date(aValue);
      } else if (sortField === 'total') {
        return sortDirection === 'asc' 
          ? (aValue || 0) - (bValue || 0)
          : (bValue || 0) - (aValue || 0);
      } else {
        // String comparison for other fields
        return sortDirection === 'asc'
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      }
    });

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAndSortedOrders.slice(indexOfFirstItem, indexOfLastItem);
  
  // Update total pages when filtered results change
  useEffect(() => {
    setTotalPages(Math.ceil(filteredAndSortedOrders.length / itemsPerPage));
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [filteredAndSortedOrders, itemsPerPage]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top of table
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = Number(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Add refresh handler
  const handleRefresh = () => {
    fetchOrders(true);
  };

  // Add function to toggle payment enablement
  const togglePaymentEnabled = (orderId, currentValue) => {
    fetch(`/api/order/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ paymentEnabled: !currentValue })
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Failed to update payment status');
    })
    .then(updatedOrder => {
      const updatedOrders = orders.map(o => 
        o._id === orderId ? updatedOrder : o
      );
      setOrders(updatedOrders);
      
      alert(`Payment ${!currentValue ? 'enabled' : 'disabled'} for order ${updatedOrder.orderNumber}`);
    })
    .catch(error => {
      console.error('Error updating payment status:', error);
      alert('Failed to update payment status. Please try again.');
    });
  };

  // Add handlePayment function
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        {error}
        <div className="mt-4">
          <button onClick={() => window.location.reload()} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-container">
        <h1>All Orders Dashboard</h1>
        <div className="empty-state">
          <img 
            src="https://via.placeholder.com/150?text=No+Orders" 
            alt="No orders" 
            style={{ opacity: 0.5 }}
          />
          <h3>No orders found</h3>
          <p>There are no orders in the system yet.</p>
          <Link href="/catalog">
            <button className="btn-primary">Go to Products</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container admin-orders">
      <h1>All Orders Dashboard</h1>
      
      <div className="dashboard-header">
        <div className="header-actions">
          <button onClick={handleRefresh} className="btn-outline refresh-btn" disabled={refreshing}>
            {refreshing ? 'Refreshing...' : 'Refresh Orders'}
          </button>
        </div>
      </div>
      
      <div className="dashboard-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by order #, customer name or email"
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="status-filter">Status:</label>
            <select 
              id="status-filter" 
              value={filterStatus} 
              onChange={handleStatusFilter}
              className="filter-select"
            >
              <option value="all">All Statuses</option>
              <option value="processing">Processing</option>
              <option value="paid">Paid</option>
              <option value="confirmed">Confirmed</option>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="type-filter">Type:</label>
            <select 
              id="type-filter" 
              value={filterType} 
              onChange={handleTypeFilter}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="purchase">Purchase Only</option>
              <option value="rental">Rental Only</option>
              <option value="combined">Combined</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="price-range-filter">
        <h3>Price Range Filter</h3>
        <div className="price-inputs">
          <div className="price-input-group">
            <label htmlFor="min-price">Min Price:</label>
            <div className="price-input-wrapper">
              <span className="currency-symbol">$</span>
              <input
                type="number"
                id="min-price"
                value={priceRange.min}
                onChange={handleMinPriceChange}
                min={minPrice}
                max={priceRange.max}
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
                value={priceRange.max}
                onChange={handleMaxPriceChange}
                min={priceRange.min}
                max={maxPrice}
                step="1"
              />
            </div>
          </div>
          <button className="reset-price-btn" onClick={handlePriceRangeReset}>
            Reset
          </button>
        </div>
        <div className="price-slider-container">
          <input
            type="range"
            className="price-slider"
            min={minPrice}
            max={maxPrice}
            value={priceRange.min}
            onChange={handleMinPriceChange}
          />
          <input
            type="range"
            className="price-slider"
            min={minPrice}
            max={maxPrice}
            value={priceRange.max}
            onChange={handleMaxPriceChange}
          />
          <div className="price-range-values">
            <span>${priceRange.min}</span>
            <span>${priceRange.max}</span>
          </div>
        </div>
        <div className="active-filters">
          <p>
            Active Filters: 
            {filterStatus !== 'all' && <span className="filter-tag">Status: {filterStatus}</span>}
            {filterType !== 'all' && <span className="filter-tag">Type: {filterType}</span>}
            {(priceRange.min > minPrice || priceRange.max < maxPrice) && 
              <span className="filter-tag">Price: ${priceRange.min} - ${priceRange.max}</span>
            }
            {filterStatus === 'all' && filterType === 'all' && 
             priceRange.min === minPrice && priceRange.max === maxPrice && 
             <span className="filter-tag no-filters">None</span>
            }
          </p>
        </div>
      </div>
      
      <p className="order-count">
        Showing {filteredAndSortedOrders.length} of {orders.length} orders
      </p>

      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('orderNumber')} className="sortable-header">
                Order #
                {sortField === 'orderNumber' && (
                  <span className="sort-indicator">{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                )}
              </th>
              <th onClick={() => handleSort('orderedAt')} className="sortable-header">
                Date
                {sortField === 'orderedAt' && (
                  <span className="sort-indicator">{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                )}
              </th>
              <th onClick={() => handleSort('customer.name')} className="sortable-header">
                Customer
                {sortField === 'customer.name' && (
                  <span className="sort-indicator">{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                )}
              </th>
              <th>Type</th>
              <th>Items</th>
              <th onClick={() => handleSort('total')} className="sortable-header">
                Total
                {sortField === 'total' && (
                  <span className="sort-indicator">{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                )}
              </th>
              <th onClick={() => handleSort('status')} className="sortable-header">
                Status
                {sortField === 'status' && (
                  <span className="sort-indicator">{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                )}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((order) => (
              <>
                <tr key={order._id} className="order-row">
                  <td className="order-number">{order.orderNumber}</td>
                  <td className="order-date">{formatDate(order.orderedAt)}</td>
                  <td className="customer-info">
                    <div>{order.customer.name}</div>
                    <div className="customer-email">{order.customer.email}</div>
                  </td>
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
                    <td colSpan="8">
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
                            
                            {order.hasRentalItems && !order.rentalDetails && (
                              <div className="rental-info">
                                <h3>Rental Information</h3>
                                <p>This order contains rental items. Please check individual items for details.</p>
                              </div>
                            )}
                            
                            {order.hasRentalItems && order.rentalDetails && (
                              <div className="rental-details">
                                <h3>Rental Details</h3>
                                <p><strong>Duration:</strong> {order.rentalDetails.duration} {order.rentalDetails.duration === 1 ? 'day' : 'days'}</p>
                                <p><strong>Daily Rate:</strong> ${order.rentalDetails.dailyRate.toFixed(2)}</p>
                                <p><strong>Return Date:</strong> {new Date(order.rentalDetails.returnDate).toLocaleDateString()}</p>
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
                        
                        <div className="admin-order-actions">
                          <h4 className="admin-action-title">Update Order Status (Admin Only)</h4>
                          <select 
                            className="status-select"
                            value={order.status}
                            onChange={(e) => {
                              // In a real application, this would update the database
                              const newStatus = e.target.value;
                              const oldStatus = order.status;
                              
                              // Only update if the status has actually changed
                              if (newStatus !== oldStatus) {
                                // Update order status via API
                                fetch(`/api/order/${order._id}`, {
                                  method: 'PUT',
                                  headers: {
                                    'Content-Type': 'application/json'
                                  },
                                  body: JSON.stringify({ status: newStatus })
                                })
                                .then(response => {
                                  if (response.ok) {
                                    return response.json();
                                  }
                                  throw new Error('Failed to update order status');
                                })
                                .then(updatedOrder => {
                                  // Update orders in state
                                  const updatedOrders = orders.map(o => 
                                    o._id === order._id ? updatedOrder : o
                                  );
                                  setOrders(updatedOrders);
                                  
                                  // Add status update confirmation message
                                  setStatusUpdates({
                                    ...statusUpdates,
                                    [order._id]: {
                                      from: oldStatus,
                                      to: newStatus,
                                      timestamp: new Date()
                                    }
                                  });
                                  
                                  // Remove the confirmation message after 5 seconds
                                  setTimeout(() => {
                                    setStatusUpdates(prev => {
                                      const updated = {...prev};
                                      delete updated[order._id];
                                      return updated;
                                    });
                                  }, 5000);
                                })
                                .catch(error => {
                                  console.error('Error updating order status:', error);
                                  alert('Failed to update order status. Please try again.');
                                });
                              }
                            }}
                          >
                            <option value="processing">Processing</option>
                            <option value="paid">Paid</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="sent">Sent</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          {statusUpdates[order._id] && (
                            <div className="status-update-message">
                              Status updated from <span className="old-status">{statusUpdates[order._id].from}</span> to <span className="new-status">{statusUpdates[order._id].to}</span>
                            </div>
                          )}
                          
                          <div className="order-actions-section payment-section">
                            <h4 className="admin-action-title">Manage Payment</h4>
                            <button 
                              className={`payment-toggle-btn ${order.paymentEnabled ? 'enabled' : 'disabled'}`}
                              onClick={() => {
                                fetch(`/api/order/${order._id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ paymentEnabled: !order.paymentEnabled })
                                })
                                .then(response => {
                                  if (!response.ok) throw new Error('Failed to update payment status');
                                  return response.json();
                                })
                                .then(updatedOrder => {
                                  setOrders(orders.map(o => o._id === order._id ? updatedOrder : o));
                                  alert(`Payment ${!order.paymentEnabled ? 'enabled' : 'disabled'} for order ${order.orderNumber}`);
                                })
                                .catch(error => {
                                  console.error('Error:', error);
                                  alert('Failed to update payment status');
                                });
                              }}
                            >
                              {order.paymentEnabled ? 'Disable Payment' : 'Enable Payment'}
                            </button>
                            <div className="payment-status">
                              Payment is currently <strong>{order.paymentEnabled ? 'enabled' : 'disabled'}</strong>
                            </div>
                          </div>

                          <div className="order-actions-section">
                            <h4 className="admin-action-title">Manage Delivery Charge</h4>
                            <div className="shipping-fee-controls">
                              <div className="shipping-fee-options">
                                <select 
                                  className="shipping-fee-select"
                                  value={shippingOptions[order._id] || "standard"}
                                  onChange={(e) => {
                                    const shippingAction = e.target.value;
                                    // Update the selection in state
                                    setShippingOptions({
                                      ...shippingOptions,
                                      [order._id]: shippingAction
                                    });
                                    
                                    let newShippingFee;
                                    
                                    if (shippingAction === "standard") {
                                      newShippingFee = 15.00;
                                      
                                      // Update shipping fee via API
                                      updateShippingFee(order._id, newShippingFee, order.shippingFee);
                                    } else if (shippingAction === "free") {
                                      newShippingFee = 0.00;
                                      
                                      // Update shipping fee via API
                                      updateShippingFee(order._id, newShippingFee, order.shippingFee);
                                    }
                                    // For custom, don't do anything - let the custom input handle it
                                  }}
                                >
                                  <option value="standard">Standard Shipping ($15.00)</option>
                                  <option value="free">Free Shipping ($0.00)</option>
                                  <option value="custom">Custom Amount</option>
                                </select>
                                
                                {shippingOptions[order._id] === "custom" && (
                                  <div className="custom-shipping-input">
                                    <label htmlFor={`custom-shipping-${order._id}`}>Custom shipping amount ($):</label>
                                    <div className="custom-shipping-control">
                                      <input
                                        id={`custom-shipping-${order._id}`}
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        defaultValue={order.shippingFee}
                                        className="custom-shipping-fee-input"
                                      />
                                      <button
                                        className="apply-shipping-fee"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          const inputEl = document.getElementById(`custom-shipping-${order._id}`);
                                          const newShippingFee = parseFloat(inputEl.value);
                                          
                                          if (isNaN(newShippingFee) || newShippingFee < 0) {
                                            alert("Please enter a valid shipping fee amount.");
                                            return;
                                          }
                                          
                                          // Only update if the shipping fee has changed
                                          if (newShippingFee !== order.shippingFee) {
                                            updateShippingFee(order._id, newShippingFee, order.shippingFee);
                                          }
                                        }}
                                      >
                                        Apply
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="current-shipping-fee">
                                Current delivery charge: <strong>${order.shippingFee.toFixed(2)}</strong>
                              </div>
                            </div>
                          </div>
                          
                          <div className="order-actions-section">
                            <h4 className="admin-action-title">Manage Tax Amount</h4>
                            <div className="tax-controls">
                              <div className="tax-options">
                                <select 
                                  className="tax-select"
                                  value={taxOptions[order._id] || "standard"}
                                  onChange={(e) => {
                                    const taxAction = e.target.value;
                                    // Update the selection in state
                                    setTaxOptions({
                                      ...taxOptions,
                                      [order._id]: taxAction
                                    });
                                    
                                    if (taxAction === "standard") {
                                      // Calculate standard tax (8%)
                                      const standardTaxRate = 0.08;
                                      const newTax = order.subtotal * standardTaxRate;
                                      
                                      // Update tax via API
                                      updateTax(order._id, newTax, order.tax);
                                    }
                                    // For custom, don't do anything - let the custom input handle it
                                  }}
                                >
                                  <option value="standard">Standard Tax (8%)</option>
                                  <option value="custom">Custom Amount</option>
                                  <option value="percentage">Adjust by Percentage</option>
                                </select>
                                
                                {taxOptions[order._id] === "custom" && (
                                  <div className="custom-tax-input">
                                    <label htmlFor={`custom-tax-${order._id}`}>Custom tax amount ($):</label>
                                    <div className="custom-tax-control">
                                      <input
                                        id={`custom-tax-${order._id}`}
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        defaultValue={order.tax}
                                        className="custom-tax-input"
                                      />
                                      <button
                                        className="apply-tax"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          const inputEl = document.getElementById(`custom-tax-${order._id}`);
                                          const newTax = parseFloat(inputEl.value);
                                          
                                          if (isNaN(newTax) || newTax < 0) {
                                            alert("Please enter a valid tax amount.");
                                            return;
                                          }
                                          
                                          // Only update if the tax has changed
                                          if (newTax !== order.tax) {
                                            updateTax(order._id, newTax, order.tax);
                                          }
                                        }}
                                      >
                                        Apply
                                      </button>
                                    </div>
                                  </div>
                                )}
                                
                                {taxOptions[order._id] === "percentage" && (
                                  <div className="percentage-tax-input">
                                    <label htmlFor={`percentage-tax-${order._id}`}>Adjust tax by percentage:</label>
                                    <div className="percentage-tax-control">
                                      <div className="percentage-buttons">
                                        <button
                                          className="percentage-btn decrease"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            // Decrease tax by 1%
                                            const currentTaxRate = order.tax / order.subtotal;
                                            const newTaxRate = Math.max(0, currentTaxRate - 0.01); // Ensure tax rate doesn't go below 0
                                            const newTax = order.subtotal * newTaxRate;
                                            updateTax(order._id, newTax, order.tax);
                                          }}
                                        >
                                          -1%
                                        </button>
                                        <button
                                          className="percentage-btn decrease"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            // Decrease tax by 0.5%
                                            const currentTaxRate = order.tax / order.subtotal;
                                            const newTaxRate = Math.max(0, currentTaxRate - 0.005);
                                            const newTax = order.subtotal * newTaxRate;
                                            updateTax(order._id, newTax, order.tax);
                                          }}
                                        >
                                          -0.5%
                                        </button>
                                        <button
                                          className="percentage-btn increase"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            // Increase tax by 0.5%
                                            const currentTaxRate = order.tax / order.subtotal;
                                            const newTaxRate = currentTaxRate + 0.005;
                                            const newTax = order.subtotal * newTaxRate;
                                            updateTax(order._id, newTax, order.tax);
                                          }}
                                        >
                                          +0.5%
                                        </button>
                                        <button
                                          className="percentage-btn increase"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            // Increase tax by 1%
                                            const currentTaxRate = order.tax / order.subtotal;
                                            const newTaxRate = currentTaxRate + 0.01;
                                            const newTax = order.subtotal * newTaxRate;
                                            updateTax(order._id, newTax, order.tax);
                                          }}
                                        >
                                          +1%
                                        </button>
                                      </div>
                                      <div className="custom-percentage-input">
                                        <input
                                          id={`percentage-tax-${order._id}`}
                                          type="number"
                                          step="0.1"
                                          placeholder="Custom %"
                                          className="percentage-input"
                                        />
                                        <button
                                          className="apply-tax"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            const inputEl = document.getElementById(`percentage-tax-${order._id}`);
                                            const percentValue = parseFloat(inputEl.value);
                                            
                                            if (isNaN(percentValue)) {
                                              alert("Please enter a valid percentage.");
                                              return;
                                            }
                                            
                                            const newTaxRate = percentValue / 100;
                                            const newTax = order.subtotal * newTaxRate;
                                            updateTax(order._id, newTax, order.tax);
                                          }}
                                        >
                                          Apply %
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="current-tax">
                                Current tax amount: <strong>${order.tax.toFixed(2)}</strong>
                                <span className="tax-rate"> (~{((order.tax / order.subtotal) * 100).toFixed(1)}% of subtotal)</span>
                              </div>
                            </div>
                          </div>

                          <div className="order-actions-section">
                            <h4 className="admin-action-title">Manage Offer</h4>
                            <div className="offer-controls">
                              <div className="offer-options">
                                <select 
                                  className="offer-select"
                                  value={offerOptions[order._id] || "none"}
                                  onChange={(e) => {
                                    const offerType = e.target.value;
                                    // Update the selection in state
                                    setOfferOptions({
                                      ...offerOptions,
                                      [order._id]: offerType
                                    });
                                    
                                    if (offerType === "none") {
                                      // Remove offer
                                      updateOffer(order._id, { type: 'none', value: 0, description: '' });
                                    }
                                  }}
                                >
                                  <option value="none">No Offer</option>
                                  <option value="fixed">Fixed Amount Discount</option>
                                  <option value="percentage">Percentage Discount</option>
                                </select>
                                
                                {offerOptions[order._id] === "fixed" && (
                                  <div className="fixed-offer-input">
                                    <label htmlFor={`fixed-offer-${order._id}`}>Discount amount ($):</label>
                                    <div className="fixed-offer-control">
                                      <input
                                        id={`fixed-offer-${order._id}`}
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="Enter amount"
                                        className="fixed-offer-input"
                                      />
                                      <input
                                        type="text"
                                        placeholder="Offer description (optional)"
                                        className="offer-description-input"
                                      />
                                      <button
                                        className="apply-offer"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          const amountEl = document.getElementById(`fixed-offer-${order._id}`);
                                          const descEl = amountEl.nextElementSibling;
                                          const amount = parseFloat(amountEl.value);
                                          
                                          if (isNaN(amount) || amount < 0) {
                                            alert("Please enter a valid discount amount.");
                                            return;
                                          }
                                          
                                          updateOffer(order._id, {
                                            type: 'fixed',
                                            value: amount,
                                            description: descEl.value
                                          });
                                        }}
                                      >
                                        Apply Discount
                                      </button>
                                    </div>
                                  </div>
                                )}
                                
                                {offerOptions[order._id] === "percentage" && (
                                  <div className="percentage-offer-input">
                                    <label htmlFor={`percentage-offer-${order._id}`}>Discount percentage (%):</label>
                                    <div className="percentage-offer-control">
                                      <div className="percentage-buttons">
                                        <button
                                          className="percentage-btn decrease"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            const currentOffer = order.offer || { type: 'percentage', value: 0 };
                                            const newValue = Math.max(0, currentOffer.value - 5);
                                            updateOffer(order._id, {
                                              type: 'percentage',
                                              value: newValue,
                                              description: currentOffer.description
                                            });
                                          }}
                                        >
                                          -5%
                                        </button>
                                        <button
                                          className="percentage-btn decrease"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            const currentOffer = order.offer || { type: 'percentage', value: 0 };
                                            const newValue = Math.max(0, currentOffer.value - 1);
                                            updateOffer(order._id, {
                                              type: 'percentage',
                                              value: newValue,
                                              description: currentOffer.description
                                            });
                                          }}
                                        >
                                          -1%
                                        </button>
                                        <button
                                          className="percentage-btn increase"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            const currentOffer = order.offer || { type: 'percentage', value: 0 };
                                            const newValue = Math.min(100, currentOffer.value + 1);
                                            updateOffer(order._id, {
                                              type: 'percentage',
                                              value: newValue,
                                              description: currentOffer.description
                                            });
                                          }}
                                        >
                                          +1%
                                        </button>
                                        <button
                                          className="percentage-btn increase"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            const currentOffer = order.offer || { type: 'percentage', value: 0 };
                                            const newValue = Math.min(100, currentOffer.value + 5);
                                            updateOffer(order._id, {
                                              type: 'percentage',
                                              value: newValue,
                                              description: currentOffer.description
                                            });
                                          }}
                                        >
                                          +5%
                                        </button>
                                      </div>
                                      <div className="custom-percentage-input">
                                        <input
                                          id={`percentage-offer-${order._id}`}
                                          type="number"
                                          min="0"
                                          max="100"
                                          step="0.1"
                                          placeholder="Custom %"
                                          className="percentage-input"
                                        />
                                        <input
                                          type="text"
                                          placeholder="Offer description (optional)"
                                          className="offer-description-input"
                                        />
                                        <button
                                          className="apply-offer"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            const percentEl = document.getElementById(`percentage-offer-${order._id}`);
                                            const descEl = percentEl.nextElementSibling;
                                            const percentValue = parseFloat(percentEl.value);
                                            
                                            if (isNaN(percentValue) || percentValue < 0 || percentValue > 100) {
                                              alert("Please enter a valid percentage between 0 and 100.");
                                              return;
                                            }
                                            
                                            updateOffer(order._id, {
                                              type: 'percentage',
                                              value: percentValue,
                                              description: descEl.value
                                            });
                                          }}
                                        >
                                          Apply %
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              {order.offer && order.offer.type !== 'none' && (
                                <div className="current-offer">
                                  <p>Current offer: {order.offer.type === 'fixed' ? `$${order.offer.value.toFixed(2)} off` : `${order.offer.value}% off`}</p>
                                  {order.offer.description && <p className="offer-description">{order.offer.description}</p>}
                                  <p>Original total: ${((order.originalValues?.total || (order.subtotal + (order.tax || 0) + (order.shippingFee || 0))) || 0).toFixed(2)}</p>
                                  <p>Discount: ${((order.originalValues?.total ? 
                                    (order.originalValues.total - (order.total || 0)) : 
                                    (order.offer?.type === 'fixed' ? (order.offer?.value || 0) : 
                                    ((order.subtotal + (order.tax || 0) + (order.shippingFee || 0)) * ((order.offer?.value || 0) / 100)))
                                  ) || 0).toFixed(2)}</p>
                                  <p>Final total: ${(order.total || 0).toFixed(2)}</p>
                                </div>
                              )}
                            </div>

                            <h4 className="admin-action-title">Payment Settings</h4>
                            <div className="payment-settings">
                              <p>
                                Payment is currently <strong>{order.paymentEnabled ? 'enabled' : 'disabled'}</strong> for this order.
                              </p>
                              <button
                                className={`btn-toggle-payment ${order.paymentEnabled ? 'enabled' : 'disabled'}`}
                                onClick={() => togglePaymentEnabled(order._id, order.paymentEnabled)}
                              >
                                {order.paymentEnabled ? 'Disable Payment' : 'Enable Payment'}
                              </button>
                            </div>
                          </div>
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

      {/* Pagination Controls */}
      <div className="pagination-controls">
        <div className="pagination-info">
          Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredAndSortedOrders.length)} of {filteredAndSortedOrders.length} orders
        </div>
        
        <div className="items-per-page">
          <label htmlFor="items-per-page">Items per page:</label>
          <select
            id="items-per-page"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="items-per-page-select"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>

        <div className="pagination-buttons">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            «
          </button>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            ‹
          </button>

          {/* Page Numbers */}
          {[...Array(totalPages)].map((_, index) => {
            const pageNumber = index + 1;
            // Show first page, last page, current page, and pages around current page
            if (
              pageNumber === 1 ||
              pageNumber === totalPages ||
              (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
            ) {
              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`pagination-btn ${currentPage === pageNumber ? 'active' : ''}`}
                >
                  {pageNumber}
                </button>
              );
            } else if (
              pageNumber === currentPage - 2 ||
              pageNumber === currentPage + 2
            ) {
              return <span key={pageNumber} className="pagination-ellipsis">...</span>;
            }
            return null;
          })}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            ›
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            »
          </button>
        </div>
      </div>

      <div className="orders-actions">
        <Link href="/">
          <button className="btn-outline">Back to Dashboard</button>
        </Link>
      </div>
    </div>
  );
}

export default withAdminAuth(AllOrders);