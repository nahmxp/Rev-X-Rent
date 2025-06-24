import connectMongo from '../../../lib/mongodb';
import Cart from '../../../models/Cart';
import { requireAuth } from '../../../lib/auth';

// API endpoint for user-specific cart operations
const handler = async (req, res) => {
  try {
    await connectMongo();
    
    const { method } = req;
    const { userId } = req;
    
    console.log(`Cart API: Processing ${method} request for userId: ${userId}`);

    // GET - Fetch user's cart
    if (method === 'GET') {
      try {
        const cart = await Cart.findOne({ userId });
        
        // Return empty cart if none exists
        if (!cart) {
          return res.status(200).json({ userId, items: [] });
        }
        
        res.status(200).json(cart);
      } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ error: 'Error fetching cart', details: error.message });
      }
    }
    
    // PUT - Update entire cart
    else if (method === 'PUT') {
      try {
        const { items } = req.body;
        
        if (!items || !Array.isArray(items)) {
          return res.status(400).json({ error: 'Items array is required' });
        }
        
        // Create or update cart using findOneAndUpdate with upsert option
        const updatedCart = await Cart.findOneAndUpdate(
          { userId },
          { $set: { items } },
          { new: true, upsert: true }
        );
        
        res.status(200).json(updatedCart);
      } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).json({ error: 'Error updating cart', details: error.message });
      }
    }
    
    // DELETE - Clear user's cart
    else if (method === 'DELETE') {
      try {
        await Cart.findOneAndDelete({ userId });
        res.status(200).json({ message: 'Cart cleared successfully' });
      } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ error: 'Error clearing cart', details: error.message });
      }
    }
    
    else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Cart API error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

export default requireAuth(handler); 