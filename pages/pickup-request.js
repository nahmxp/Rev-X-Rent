import { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useRouter } from 'next/router';

const carCategories = ['Economy', 'SUV', 'Luxury', 'Van'];

export default function PickupRequestPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    customerName: '',
    email: '',
    phone: '',
    pickupTime: '',
    pickupLocation: '',
    dropLocation: '',
    carCategory: carCategories[0],
    headcount: 1
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [myRequests, setMyRequests] = useState([]);

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated) {
      fetch('/api/pickup-requests', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setMyRequests(data);
        });
    }
  }, [isAuthenticated, loading, success]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);
    try {
      const res = await fetch('/api/pickup-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          headcount: Number(form.headcount),
          pickupTime: new Date(form.pickupTime)
        })
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to submit request');
      setSuccess(true);
      setForm({
        customerName: '',
        email: '',
        phone: '',
        pickupTime: '',
        pickupLocation: '',
        dropLocation: '',
        carCategory: carCategories[0],
        headcount: 1
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pickup-request-page" style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h1>Request a Car Pickup</h1>
      <form onSubmit={handleSubmit} className="pickup-form" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <input name="customerName" value={form.customerName} onChange={handleChange} placeholder="Your Name" required />
        <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone Number" required />
        <input name="pickupTime" type="datetime-local" value={form.pickupTime} onChange={handleChange} required />
        <input name="pickupLocation" value={form.pickupLocation} onChange={handleChange} placeholder="Pickup Location" required />
        <input name="dropLocation" value={form.dropLocation} onChange={handleChange} placeholder="Drop Location" required />
        <select name="carCategory" value={form.carCategory} onChange={handleChange} required>
          {carCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <input name="headcount" type="number" min="1" max="20" value={form.headcount} onChange={handleChange} placeholder="Headcount" required />
        <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Request Pickup'}</button>
        {success && <div style={{ color: 'green' }}>Pickup request submitted!</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </form>
      {isAuthenticated && (
        <div className="my-pickup-requests" style={{ marginTop: 40 }}>
          <h2>My Pickup Requests</h2>
          {myRequests.length === 0 ? <p>No requests yet.</p> : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {myRequests.map(req => (
                <li key={req._id} style={{ border: '1px solid #eee', borderRadius: 8, margin: '12px 0', padding: 12 }}>
                  <b>{req.carCategory}</b> | {new Date(req.pickupTime).toLocaleString()}<br />
                  <span>From: {req.pickupLocation} → To: {req.dropLocation}</span><br />
                  <span>Headcount: {req.headcount}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
} 