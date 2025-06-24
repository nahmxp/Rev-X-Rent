import connectMongo from '../../../lib/mongodb';
import Product from '../../../models/Product';
import checkAdminAuth from '../../../lib/checkAdminAuth';

export default async function handler(req, res) {
  try {
    await connectMongo();
    
    const { id } = req.query;
    const { method } = req;
    
    if (method === 'GET') {
      try {
        const product = await Product.findById(id);
        
        if (!product) {
          return res.status(404).json({ error: 'Product not found' });
        }
        
        res.status(200).json(product);
      } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Error fetching product', details: error.message });
      }
    }
    
    else if (method === 'PUT') {
      // Check admin authorization
      const authCheck = await checkAdminAuth(req);
      if (!authCheck.success) {
        return res.status(authCheck.status).json({ error: authCheck.message });
      }
      
      try {
        const product = await Product.findByIdAndUpdate(id, req.body, { new: true });
        
        if (!product) {
          return res.status(404).json({ error: 'Product not found' });
        }
        
        res.status(200).json(product);
      } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Error updating product', details: error.message });
      }
    }
    
    else if (method === 'DELETE') {
      // Check admin authorization
      const authCheck = await checkAdminAuth(req);
      if (!authCheck.success) {
        return res.status(authCheck.status).json({ error: authCheck.message });
      }
      
      try {
        const deleted = await Product.findByIdAndDelete(id);
        
        if (!deleted) {
          return res.status(404).json({ error: 'Product not found' });
        }
        
        res.status(204).end();
      } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Error deleting product', details: error.message });
      }
    }
    
    else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    res.status(500).json({ error: 'Error connecting to database', details: error.message });
  }
} 