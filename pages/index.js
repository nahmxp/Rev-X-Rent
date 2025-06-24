import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Index() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect from the root path to the home page
    router.push('/home');
  }, [router]);
  
  // Return empty div while redirecting
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Redirecting to homepage...</p>
    </div>
  );
}
