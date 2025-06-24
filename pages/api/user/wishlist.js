import connectMongo from '../../../lib/mongodb';
import Wishlist from '../../../models/Wishlist';
import { requireAuth } from '../../../lib/auth';

// API endpoint for user-specific wishlist operations
const handler = async (req, res) => {
  try {
    await connectMongo();
    
    const { method } = req;
    const { userId } = req;
    
    console.log(`Wishlist API: Processing ${method} request for userId: ${userId}`);

    // GET - Fetch user's wishlist
    if (method === 'GET') {
      try {
        const wishlist = await Wishlist.findOne({ userId });
        
        // Return empty wishlist if none exists
        if (!wishlist) {
          return res.status(200).json({ userId, items: [] });
        }
        
        res.status(200).json(wishlist);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ error: 'Error fetching wishlist', details: error.message });
      }
    }
    
    // PUT - Update entire wishlist
    else if (method === 'PUT') {
      try {
        const { items } = req.body;
        
        if (!items || !Array.isArray(items)) {
          return res.status(400).json({ error: 'Items array is required' });
        }
        
        // Create or update wishlist using findOneAndUpdate with upsert option
        const updatedWishlist = await Wishlist.findOneAndUpdate(
          { userId },
          { $set: { items } },
          { new: true, upsert: true }
        );
        
        res.status(200).json(updatedWishlist);
      } catch (error) {
        console.error('Error updating wishlist:', error);
        res.status(500).json({ error: 'Error updating wishlist', details: error.message });
      }
    }
    
    // DELETE - Clear user's wishlist
    else if (method === 'DELETE') {
      try {
        await Wishlist.findOneAndDelete({ userId });
        res.status(200).json({ message: 'Wishlist cleared successfully' });
      } catch (error) {
        console.error('Error clearing wishlist:', error);
        res.status(500).json({ error: 'Error clearing wishlist', details: error.message });
      }
    }
    
    else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Wishlist API error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

export default requireAuth(handler); 