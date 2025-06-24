import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  // Get username from query
  const { username } = req.query;
  
  if (!username) {
    return res.status(400).json({ success: false, message: 'Username is required' });
  }
  
  await dbConnect();
  
  try {
    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username must be at least 3 characters and contain only letters, numbers, and underscores',
        available: false
      });
    }
    
    // Check if username exists
    const existingUser = await User.findOne({ username });
    
    return res.status(200).json({
      success: true,
      available: !existingUser
    });
  } catch (error) {
    console.error('Check username error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
} 