import connectMongo from '../../../lib/mongodb';
import User from '../../../models/User';
import { getTokenFromRequest, verifyToken } from '../../../lib/auth';

export default async function handler(req, res) {
  try {
    await connectMongo();
    const { method } = req;
    const userId = req.query.id;

    // Authenticate the request
    const token = await getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    // Check if user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (method === 'PUT') {
      const { name, email, username, password, isAdmin } = req.body;
      
      // Validate required fields
      if (!name || !email || !username) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please provide name, email, and username'
        });
      }
      
      // Check if email already exists for another user
      const existingEmail = await User.findOne({ email });
      if (existingEmail && existingEmail._id.toString() !== userId) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use by another user'
        });
      }
      
      // Check if username already exists for another user
      const existingUsername = await User.findOne({ username });
      if (existingUsername && existingUsername._id.toString() !== userId) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken by another user'
        });
      }
      
      // Create update data (excluding password if not provided)
      const updateData = { name, email, username };
      
      // Include isAdmin in update data if provided
      if (isAdmin !== undefined) {
        updateData.isAdmin = isAdmin;
      }
      
      if (password) {
        updateData.password = password;
      }
      
      // Update user
      const updatedUser = await User.findByIdAndUpdate(
        userId, 
        updateData,
        { new: true } // Return the updated document
      );
      
      // Return user without password
      const userResponse = {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        username: updatedUser.username,
        isAdmin: updatedUser.isAdmin,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      };
      
      return res.status(200).json(userResponse);
    }
    
    else if (method === 'PATCH') {
      // Handle partial updates, especially for admin status
      const updates = req.body;
      
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No update data provided'
        });
      }
      
      // Update user with only the provided fields
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        updates,
        { new: true }
      );
      
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Return user without password
      return res.status(200).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        username: updatedUser.username,
        isAdmin: updatedUser.isAdmin,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      });
    }
    
    else if (method === 'DELETE') {
      // Delete user
      await User.findByIdAndDelete(userId);
      
      return res.status(200).json({ success: true, message: 'User deleted successfully' });
    }
    
    // Method not allowed for other request types
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Error in users API:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
} 