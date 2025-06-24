import { parse } from 'cookie';
import jwt from 'jsonwebtoken';

// NOTE: This file is not currently being used. Authentication is handled through 
// the auth.js file using getTokenFromRequest and verifyToken functions.
// Keeping this file for reference only.

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development-only';

// Get user session from request cookies
export async function getSession(req) {
  try {
    // Parse cookies from request headers
    const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
    
    // Get token from cookies
    const token = cookies.auth_token;
    
    if (!token) {
      return null;
    }
    
    // Verify token and get user data
    const decoded = jwt.verify(token, JWT_SECRET);
    
    return { user: decoded };
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
} 