import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from './AuthContext';

// Higher-order component for admin-protected routes
export default function withAdminAuth(Component) {
  const AdminProtectedComponent = (props) => {
    const { isAuthenticated, isAdmin, loading } = useAuth();
    const router = useRouter();
    
    useEffect(() => {
      // If auth state is loaded and user is either not authenticated or not admin, redirect to home
      if (!loading && (!isAuthenticated || !isAdmin)) {
        router.replace('/');
      }
    }, [isAuthenticated, isAdmin, loading, router]);
    
    // Show nothing while checking auth status
    if (loading || !isAuthenticated || !isAdmin) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      );
    }
    
    // If authenticated and admin, render the protected component
    return <Component {...props} />;
  };
  
  // Set display name for debugging
  const displayName = Component.displayName || Component.name || 'Component';
  AdminProtectedComponent.displayName = `withAdminAuth(${displayName})`;
  
  return AdminProtectedComponent;
} 