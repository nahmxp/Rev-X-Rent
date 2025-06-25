import { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useRouter } from 'next/router';

export default function MyPickupRequests() {
  const { user, isAuthenticated, loading } = useAuth();
  const [requests, setRequests] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [showEmailLookup, setShowEmailLookup] = useState(false);
  const [email, setEmail] = useState('');
  const [emailRequests, setEmailRequests] = useState([]);
  const [emailError, setEmailError] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace('/login?redirect=/my-pickup-requests');
      return;
    }
    fetch('/api/pickup-requests', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRequests(data);
        setFetching(false);
      });
  }, [isAuthenticated, loading, router]);

  const handleEmailLookup = async (e) => {
    e.preventDefault();
    setEmailError('');
    setEmailLoading(true);
    setEmailRequests([]);
    try {
      const res = await fetch(`/api/pickup-requests?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setEmailRequests(data);
      } else {
        setEmailError('No pickup requests found for this email.');
      }
    } catch (err) {
      setEmailError('Error fetching requests.');
    } finally {
      setEmailLoading(false);
    }
  };

  if (loading || fetching) {
    return <div style={{ textAlign: 'center', marginTop: 60 }}>Loading your pickup requests...</div>;
  }

  if (!isAuthenticated) {
    return null; // Redirecting
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 32 }}>
      <h1 style={{ marginBottom: 32 }}>My Pickup Requests</h1>
      {requests.length === 0 ? (
        <>
          <div style={{ color: '#888', fontSize: 18, marginBottom: 24 }}>You have not made any pickup requests yet with your account.</div>
          <button className="btn-outline" style={{ marginBottom: 24 }} onClick={() => setShowEmailLookup(v => !v)}>
            {showEmailLookup ? 'Hide' : 'Look up by Email'}
          </button>
          {showEmailLookup && (
            <form onSubmit={handleEmailLookup} style={{ marginBottom: 24 }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email to find requests"
                required
                style={{ padding: 10, fontSize: 16, width: '70%', marginRight: 10 }}
              />
              <button type="submit" className="btn-primary" disabled={emailLoading}>
                {emailLoading ? 'Searching...' : 'Find Requests'}
              </button>
              {emailError && <div style={{ color: 'red', marginTop: 8 }}>{emailError}</div>}
            </form>
          )}
          {emailRequests.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {emailRequests.map(req => (
                <li key={req._id} style={{ border: '1px solid #eee', borderRadius: 10, margin: '18px 0', padding: 20, background: '#fafbfc' }}>
                  <div style={{ fontWeight: 600, fontSize: 18 }}>{req.carCategory} <span style={{ color: '#888', fontWeight: 400, fontSize: 15 }}>({new Date(req.pickupTime).toLocaleString()})</span></div>
                  <div style={{ margin: '8px 0' }}>
                    <b>From:</b> {req.pickupLocation} <b>→</b> <b>To:</b> {req.dropLocation}
                  </div>
                  <div><b>Headcount:</b> {req.headcount}</div>
                  <div style={{ color: '#aaa', fontSize: 13, marginTop: 6 }}>Requested: {new Date(req.createdAt).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {requests.map(req => (
            <li key={req._id} style={{ border: '1px solid #eee', borderRadius: 10, margin: '18px 0', padding: 20, background: '#fafbfc' }}>
              <div style={{ fontWeight: 600, fontSize: 18 }}>{req.carCategory} <span style={{ color: '#888', fontWeight: 400, fontSize: 15 }}>({new Date(req.pickupTime).toLocaleString()})</span></div>
              <div style={{ margin: '8px 0' }}>
                <b>From:</b> {req.pickupLocation} <b>→</b> <b>To:</b> {req.dropLocation}
              </div>
              <div><b>Headcount:</b> {req.headcount}</div>
              <div style={{ color: '#aaa', fontSize: 13, marginTop: 6 }}>Requested: {new Date(req.createdAt).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 