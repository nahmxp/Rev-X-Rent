import connectMongo from '../../lib/mongodb';
import Order from '../../models/Order';
import checkAdminAuth from '../../lib/checkAdminAuth';
import { requireAuth } from '../../lib/auth';
import mongoose from 'mongoose';

// Import mockDB and generateId from mongodb.js for in-memory database operations
import { mockDB, generateId, seedMockOrders } from '../../lib/mongodb';

async function handler(req, res) {
  try {
    // First, manually check if user is admin
    const authCheck = await checkAdminAuth(req);
    if (!authCheck.success) {
      return res.status(authCheck.status).json({ error: authCheck.message });
    }
    
    console.log('Authorized admin user is seeding orders');
    
    await connectMongo();
    
    // Clear existing orders if requested
    if (req.query.clear === 'true') {
      console.log('Clearing existing orders');
      if (!mongoose.models.Order.collection) {
        // Using the mock database
        mockDB.orders = [];
      } else {
        // Using real MongoDB
        await Order.deleteMany({});
      }
    }
    
    let insertedOrders = [];
    
    // If we're using the mock database, use seedMockOrders()
    if (!mongoose.models.Order.collection) {
      console.log('Using mock database for seeding');
      // Force re-seed the mock database
      seedMockOrders(true);
      insertedOrders = [...mockDB.orders];
    } else {
      console.log('Using MongoDB for seeding');
      // For real MongoDB, create test orders
      
      // Check if we already have orders
      const orderCount = await Order.countDocuments();
      console.log(`Current order count: ${orderCount}`);
      
      if (orderCount === 0) {
        console.log('Creating seed orders in MongoDB');
        // Create some basic sample orders
        const sampleOrders = [
          {
            orderNumber: 'ORD-' + Date.now() + '-123',
            userId: req.userId || 'user1', // Use current user's ID if available
            items: [
              {
                productId: 'product1',
                name: 'Test Product 1',
                price: 99.99,
                quantity: 1,
                isRental: false
              }
            ],
            customer: {
              name: "Test User",
              email: "test@example.com",
              phone: "123-456-7890",
              address: {
                street: "123 Test St",
                city: "Test City",
                state: "TS",
                postalCode: "12345"
              }
            },
            status: 'processing',
            subtotal: 99.99,
            tax: 8.00,
            shippingFee: 5.99,
            total: 113.98,
            orderedAt: new Date(),
            hasRentalItems: false,
            hasMixedItems: false
          },
          {
            orderNumber: 'ORD-' + Date.now() + '-456',
            userId: 'other-user',  // Different user
            items: [
              {
                productId: 'product2',
                name: 'Test Product 2',
                price: 199.99,
                quantity: 2,
                isRental: false
              }
            ],
            customer: {
              name: "Other User",
              email: "other@example.com",
              phone: "987-654-3210",
              address: {
                street: "456 Other St",
                city: "Other City",
                state: "OS",
                postalCode: "67890"
              }
            },
            status: 'paid',
            subtotal: 399.98,
            tax: 32.00,
            shippingFee: 0,
            total: 431.98,
            orderedAt: new Date(Date.now() - 86400000), // 1 day ago
            hasRentalItems: false,
            hasMixedItems: false
          }
        ];
        
        for (const orderData of sampleOrders) {
          const order = await Order.create(orderData);
          insertedOrders.push(order);
        }
      } else {
        console.log('Orders already exist, not creating new seed data');
        // Just return existing orders
        insertedOrders = await Order.find({}).sort({ orderedAt: -1 });
      }
    }
    
    console.log(`Returning ${insertedOrders.length} orders`);
    res.status(200).json({ 
      message: `Successfully initialized ${insertedOrders.length} orders`,
      orders: insertedOrders
    });
  } catch (error) {
    console.error('Error seeding orders:', error);
    res.status(500).json({ error: 'Failed to seed orders', details: error.message });
  }
}

// Wrap with auth middleware
export default requireAuth(handler); 