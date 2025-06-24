import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import { getTokenFromRequest, verifyToken } from '../../../lib/auth';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  // Prevent caching on Vercel
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
  // Debug: log cookies and headers
  console.log('Cookies:', req.headers.cookie);
  try {
    // Get token from request
    const token = await getTokenFromRequest(req);
    console.log('Token from request:', token);
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    
    // Verify token
    const decoded = verifyToken(token);
    console.log('Decoded JWT:', decoded);
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
    
    await dbConnect();
    
    // Get user ID from the token
    const userId = decoded.id;
    
    // Find user by ID
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Return user data
    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        isAdmin: user.isAdmin
      }
    });
    
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
} 