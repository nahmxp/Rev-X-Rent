import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from './AuthContext';

// Higher-order component for protected routes
export default function withAuth(Component, adminOnly = false) {
  const AuthenticatedComponent = (props) => {
    const { isAuthenticated, isAdmin, loading } = useAuth();
    const router = useRouter();
    
    useEffect(() => {
      // If auth state is loaded and user is not authenticated, redirect to login
      if (!loading && !isAuthenticated) {
        router.replace('/login');
        return;
      }
      
      // If admin-only route and user is not admin, redirect to home
      if (!loading && isAuthenticated && adminOnly && !isAdmin) {
        router.replace('/');
      }
    }, [isAuthenticated, isAdmin, loading, router]);
    
    // Show nothing while checking auth status
    if (loading || !isAuthenticated || (adminOnly && !isAdmin)) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      );
    }
    
    // If authenticated (and admin if required), render the protected component
    return <Component {...props} />;
  };
  
  // Set display name for debugging
  const displayName = Component.displayName || Component.name || 'Component';
  AuthenticatedComponent.displayName = `withAuth(${displayName})`;
  
  return AuthenticatedComponent;
} 