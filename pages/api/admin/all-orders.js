import connectMongo from '../../../lib/mongodb';
import Order from '../../../models/Order';
import checkAdminAuth from '../../../lib/checkAdminAuth';
import { requireAuth } from '../../../lib/auth';
import { seedMockOrders } from '../../../lib/mongodb';

async function handler(req, res) {
  try {
    // First, verify this is an admin user
    const authCheck = await checkAdminAuth(req);
    if (!authCheck.success) {
      return res.status(authCheck.status).json({ error: authCheck.message });
    }
    
    await connectMongo();
    
    // Auto-seed mock orders if using the mock database
    if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('your-username')) {
      seedMockOrders();
    }
    
    const { method } = req;

    // GET - Fetch ALL orders regardless of user
    if (method === 'GET') {
      console.log('Admin API: Fetching all orders');
      
      const orders = await Order.find({}).sort({ orderedAt: -1 });
      console.log(`Admin API: Found ${orders.length} total orders`);
      
      return res.status(200).json(orders);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Admin orders API error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
}

// Wrap with auth middleware
export default requireAuth(handler); 