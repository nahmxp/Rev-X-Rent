import connectMongo from '../../lib/mongodb';
import Order from '../../models/Order';
import checkAdminAuth from '../../lib/checkAdminAuth';
import { requireAuth } from '../../lib/auth';
import { seedMockOrders } from '../../lib/mongodb';
import { sendEmail } from '../../lib/email';

async function handler(req, res) {
  try {
    await connectMongo();
    
    // Auto-seed mock orders if using the mock database
    if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('your-username')) {
      seedMockOrders();
    }
    
    const { method } = req;

    // GET - Fetch orders based on user role
    if (method === 'GET') {
      const { userId, isAdmin } = req;
      
      // Debug information
      console.log('API Request: GET /api/orders');
      console.log('User ID:', userId);
      console.log('Is Admin:', isAdmin);
      
      // Admin can see all orders, regular users only see their own orders
      const query = isAdmin ? {} : { userId };
      console.log('MongoDB query:', query);
      
      // Force empty query for all-orders page to ensure all orders are fetched
      if (req.headers.referer && req.headers.referer.includes('/all-orders')) {
        console.log('Request from all-orders page, fetching all orders');
        const orders = await Order.find({}).sort({ orderedAt: -1 });
        console.log(`Found ${orders.length} orders`);
        return res.status(200).json(orders);
      }
      
      const orders = await Order.find(query).sort({ orderedAt: -1 });
      console.log(`Found ${orders.length} orders matching query`);
      return res.status(200).json(orders);
    }
    
    // POST - Create a new order
    else if (method === 'POST') {
      const { userId } = req;
      
      try {
        // Generate a unique order number
        const orderNumber = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        
        // Create the order with the user ID
        const orderData = {
          ...req.body,
          userId,
          orderNumber
        };
        
        const newOrder = await Order.create(orderData);

        // Send order confirmation email
        try {
          await sendEmail({
            to: newOrder.customer.email,
            template: 'orderConfirmation',
            data: newOrder
          });
          console.log('Order confirmation email sent successfully');
        } catch (emailError) {
          console.error('Failed to send order confirmation email:', emailError);
          // Don't fail the order creation if email fails
        }
        
        res.status(201).json(newOrder);
      } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: error.message });
      }
    }
    
    else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Orders API error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
}

// Wrap with auth middleware
export default requireAuth(handler); 