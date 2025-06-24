import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import { applyCookieParser } from './middleware';

// Secret key for JWT signing - in production, use environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development-only';

// Generate JWT token
export const generateToken = (id) => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Set JWT token in cookie
export const setTokenCookie = (res, token) => {
  const cookie = serialize('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    priority: 'high',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/'
  });
  
  res.setHeader('Set-Cookie', cookie);
};

// Remove JWT token from cookie (for logout)
export const removeTokenCookie = (res) => {
  const cookie = serialize('auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    priority: 'high',
    maxAge: -1,
    path: '/'
  });
  
  res.setHeader('Set-Cookie', cookie);
};

// Parse JWT token from request
export const getTokenFromRequest = async (req) => {
  // Ensure cookies are parsed
  await applyCookieParser(req, req.res || {});
  
  // Check for the auth_token cookie
  if (req.cookies && req.cookies.auth_token) {
    return req.cookies.auth_token;
  }
  
  // Check authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  
  return null;
};

// Verify JWT token
export const verifyToken = (token) => {
  if (!JWT_SECRET) {
    console.error('JWT_SECRET is not configured');
    return null;
  }
  
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
};

// Authentication middleware for API routes
export const requireAuth = (handler) => {
  return async (req, res) => {
    const token = await getTokenFromRequest(req);
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
    
    // Attach user ID to request for use in handler
    req.userId = decoded.id;
    
    // Check if this user is admin and attach that information to the request
    await applyCookieParser(req, req.res || {});
    const mongoose = await import('mongoose');
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}));
    
    const user = await User.findById(decoded.id);
    req.isAdmin = user?.isAdmin || false;
    
    return handler(req, res);
  };
}; 