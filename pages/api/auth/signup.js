import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import { generateToken, setTokenCookie } from '../../../lib/auth';
import { validateEmail, sendEmail } from '../../../lib/email';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  // Prevent caching on Vercel
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
  
  try {
    await dbConnect();
    
    const { name, email, username, password, confirmPassword } = req.body;
    
    // Basic validation
    if (!name || !email || !username || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({ 
        success: false, 
        message: emailValidation.message 
      });
    }
    
    // Validate username (alphanumeric, 3+ chars)
    const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username must be at least 3 characters and contain only letters, numbers, and underscores' 
      });
    }
    
    // Password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }
    
    // Password strength validation
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    if (!hasUpperCase || !hasNumber || !hasSymbol || !isLongEnough) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one number, and one special character'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email or username already exists' 
      });
    }
    
    // Create new user
    const user = await User.create({
      name,
      email,
      username,
      password
    });
    
    // Generate token
    const token = generateToken(user._id);
    
    // Set cookie with token
    setTokenCookie(res, token);

    // Send welcome email in a separate try-catch to not break the signup flow
    try {
      await sendEmail({
        to: email,
        template: 'welcome',
        data: { name }
      });
    } catch (emailError) {
      // Log the error but don't fail the signup
      console.error('Failed to send welcome email:', emailError);
    }
    
    // Return user data (without password)
    return res.status(201).json({
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
    console.error('Signup error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred during signup',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 