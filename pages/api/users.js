import connectMongo from '../../lib/mongodb';
import User from '../../models/User';
import { getTokenFromRequest, verifyToken } from '../../lib/auth';

export default async function handler(req, res) {
  try {
    await connectMongo();
    const { method } = req;

    // Authenticate the request
    const token = await getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    if (method === 'GET') {
      // Fetch all users but exclude sensitive information like password
      const users = await User.find({}).select('-password');
      
      // Return users as JSON response
      return res.status(200).json(users);
    }
    
    else if (method === 'POST') {
      const { name, email, username, password, isAdmin } = req.body;
      
      // Validate required fields
      if (!name || !email || !username || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please provide all required fields'
        });
      }
      
      // Check if email already exists
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
      
      // Check if username already exists
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken'
        });
      }
      
      // Create new user
      const newUser = await User.create({
        name,
        email,
        username,
        password, // Password will be hashed by the User model pre-save hook
        isAdmin: isAdmin || false // Default to regular user if not specified
      });
      
      // Return user without password
      const userResponse = {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        isAdmin: newUser.isAdmin,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt
      };
      
      return res.status(201).json(userResponse);
    }
    
    // Method not allowed for other request types
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Error in users API:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
} 