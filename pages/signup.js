import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../lib/AuthContext';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameTypingTimeout, setUsernameTypingTimeout] = useState(null);
  
  const router = useRouter();
  const { register, error, isAuthenticated, checkUsername } = useAuth();
  
  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
    
    // Check username availability after user stops typing
    if (name === 'username' && value.length >= 3) {
      // Clear any existing timeout
      if (usernameTypingTimeout) {
        clearTimeout(usernameTypingTimeout);
      }
      
      // Set username available to null while typing
      setUsernameAvailable(null);
      
      // Set a new timeout
      const timeout = setTimeout(async () => {
        setIsCheckingUsername(true);
        const available = await checkUsername(value);
        setUsernameAvailable(available);
        setIsCheckingUsername(false);
      }, 500); // 500ms delay
      
      setUsernameTypingTimeout(timeout);
    } else if (name === 'username') {
      setUsernameAvailable(null);
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }
    
    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else {
      const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
      if (!usernameRegex.test(formData.username)) {
        newErrors.username = 'Username must be at least 3 characters and contain only letters, numbers, and underscores';
      } else if (usernameAvailable === false) {
        newErrors.username = 'Username is already taken';
      }
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    const success = await register(formData);
    
    if (!success) {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Sign up to start managing your products</p>
        </div>
        
        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
              placeholder="Enter your full name"
            />
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="Enter your email address"
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="username-input-wrapper">
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`${errors.username ? 'error' : ''} ${
                  usernameAvailable === true ? 'valid' : ''
                }`}
                placeholder="Choose a username"
                autoComplete="off"
              />
              {formData.username.length >= 3 && (
                <div className="username-status">
                  {isCheckingUsername ? (
                    <span className="checking">Checking...</span>
                  ) : usernameAvailable === true ? (
                    <span className="available">✓ Available</span>
                  ) : usernameAvailable === false ? (
                    <span className="unavailable">✗ Taken</span>
                  ) : null}
                </div>
              )}
            </div>
            {errors.username && <div className="error-message">{errors.username}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="Create a password"
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? 'error' : ''}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
          </div>
          
          <button
            type="submit"
            className="btn-primary auth-button"
            disabled={isSubmitting || usernameAvailable === false}
          >
            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="auth-links">
          <p>
            Already have an account? <Link href="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
} 