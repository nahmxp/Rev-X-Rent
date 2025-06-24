import { getTokenFromRequest, verifyToken } from './auth';
import dbConnect from './mongodb';
import User from '../models/User';

// Middleware to check if the current user is an admin
export default async function checkAdminAuth(req, res) {
  const token = await getTokenFromRequest(req);
  
  if (!token) {
    return {
      success: false,
      status: 401,
      message: 'Authentication required'
    };
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    return {
      success: false,
      status: 401,
      message: 'Invalid or expired token'
    };
  }
  
  await dbConnect();
  const userId = decoded.id;
  const user = await User.findById(userId);
  
  if (!user) {
    return {
      success: false,
      status: 404,
      message: 'User not found'
    };
  }
  
  if (!user.isAdmin) {
    return {
      success: false,
      status: 403,
      message: 'Admin privileges required'
    };
  }
  
  return {
    success: true,
    user: user
  };
} 