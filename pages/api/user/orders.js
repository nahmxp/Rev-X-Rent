import connectMongo from '../../../lib/mongodb';
import Order from '../../../models/Order';
import { requireAuth } from '../../../lib/auth';

async function handler(req, res) {
  try {
    await connectMongo();
    
    const { method } = req;
    const { userId } = req;

    // GET - Fetch only the current user's orders
    if (method === 'GET') {
      console.log(`User API: Fetching orders for user ${userId}`);
      
      // Ensure we only get orders for the current user
      const query = { userId };
      console.log('User orders query:', query);
      
      const orders = await Order.find(query).sort({ orderedAt: -1 });
      console.log(`User API: Found ${orders.length} orders for user`);
      
      return res.status(200).json(orders);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('User orders API error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
}

// Wrap with auth middleware
export default requireAuth(handler); 