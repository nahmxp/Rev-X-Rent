import { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Fetch current user data
  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Check if user is logged in
  useEffect(() => {
    fetchUserData();
  }, []);

  // Refresh user data (useful after role changes)
  const refreshUser = async () => {
    setLoading(true);
    await fetchUserData();
  };

  // Register user
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData),
        credentials: 'include'
      });
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      setUser(data.data);
      router.push('/');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentialsObj, redirectPath) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentialsObj),
        credentials: 'include'
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      setUser(data.data);
      // Force a full page reload to ensure cookie is picked up
      window.location.href = redirectPath || '/';
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    setLoading(true);
    
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!res.ok) {
        throw new Error('Logout failed');
      }
      
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if username is available
  const checkUsername = async (username) => {
    try {
      const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(username)}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to check username');
      }
      
      return data.available;
    } catch (error) {
      console.error('Check username error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        checkUsername,
        refreshUser,
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin || false
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 