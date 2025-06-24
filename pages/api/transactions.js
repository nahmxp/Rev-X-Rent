import connectMongo from '../../lib/mongodb';
import Product from '../../models/Product';

// In a real application, we would have Transaction and Rental models
// This is a simplified version for demonstration purposes

export default async function handler(req, res) {
  await connectMongo();
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { transactionType, productId, ...transactionData } = req.body;
    
    // Verify that the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // In a real application, we would create a transaction record in the database
    // For this example, we'll just return a successful response with mock data
    
    // Generate a transaction ID
    const transactionId = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Create response based on transaction type
    if (transactionType === 'purchase') {
      return res.status(200).json({
        success: true,
        transactionId,
        transactionType: 'purchase',
        productId,
        productName: product.name,
        amount: product.price,
        date: new Date(),
        ...transactionData
      });
    } else if (transactionType === 'rental') {
      const { days, dailyRate } = transactionData;
      const totalAmount = days * dailyRate;
      
      // Calculate return date
      const returnDate = new Date();
      returnDate.setDate(returnDate.getDate() + parseInt(days));
      
      return res.status(200).json({
        success: true,
        transactionId,
        transactionType: 'rental',
        productId,
        productName: product.name,
        days: parseInt(days),
        dailyRate,
        totalAmount,
        startDate: new Date(),
        returnDate,
        ...transactionData
      });
    } else {
      return res.status(400).json({ error: 'Invalid transaction type' });
    }
  } catch (error) {
    console.error('Transaction error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
} 