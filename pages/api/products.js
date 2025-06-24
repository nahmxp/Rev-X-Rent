import connectMongo from '../../lib/mongodb';
import Product from '../../models/Product';
import checkAdminAuth from '../../lib/checkAdminAuth';

export default async function handler(req, res) {
  try {
    await connectMongo();
    const { method } = req;

    if (method === 'GET') {
      // Check if there's a search query
      const { search } = req.query;
      
      if (search && search.trim()) {
        // Create a case-insensitive search query for multiple fields
        const searchQuery = {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { brand: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { category: { $regex: search, $options: 'i' } }
          ]
        };
        
        const products = await Product.find(searchQuery);
        return res.status(200).json(products);
      }
      
      // Regular product listing without search
      const products = await Product.find({});
      res.status(200).json(products);
    }

    else if (method === 'POST') {
      // Check admin authorization
      const authCheck = await checkAdminAuth(req);
      if (!authCheck.success) {
        return res.status(authCheck.status).json({ error: authCheck.message });
      }
      
      try {
        const newProduct = await Product.create(req.body);
        res.status(201).json(newProduct);
      } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: error.message });
      }
    }

    else if (method === 'PUT') {
      // Check admin authorization
      const authCheck = await checkAdminAuth(req);
      if (!authCheck.success) {
        return res.status(authCheck.status).json({ error: authCheck.message });
      }
      
      try {
        const { id, ...rest } = req.body;
        const updated = await Product.findByIdAndUpdate(id, rest, { new: true });
        res.status(200).json(updated);
      } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: error.message });
      }
    }

    else if (method === 'DELETE') {
      // Check admin authorization
      const authCheck = await checkAdminAuth(req);
      if (!authCheck.success) {
        return res.status(authCheck.status).json({ error: authCheck.message });
      }
      
      try {
        const { id } = req.body;
        await Product.findByIdAndDelete(id);
        res.status(204).end();
      } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: error.message });
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
