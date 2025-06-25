import { useEffect, useState } from 'react';
import withAdminAuth from '../lib/withAdminAuth';

const STATUS_OPTIONS = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

function AllPickupRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    fetch('/api/admin/pickup-requests')
      .then(res => res.json())
      .then(data => {
        setRequests(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load pickup requests.');
        setLoading(false);
      });
  }, []);

  const handleUpdate = async (id, updates) => {
    setUpdating(u => ({ ...u, [id]: true }));
    try {
      const res = await fetch(`/api/admin/pickup-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const updated = await res.json();
      setRequests(reqs => reqs.map(r => r._id === id ? { ...r, ...updated } : r));
    } catch {
      alert('Failed to update request.');
    } finally {
      setUpdating(u => ({ ...u, [id]: false }));
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: 60 }}>Loading all pickup requests...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: 60 }}>{error}</div>;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 32 }}>
      <h1 style={{ marginBottom: 32 }}>All Pickup Requests</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={{ padding: 10, border: '1px solid #eee' }}>Customer</th>
            <th style={{ padding: 10, border: '1px solid #eee' }}>Email</th>
            <th style={{ padding: 10, border: '1px solid #eee' }}>Phone</th>
            <th style={{ padding: 10, border: '1px solid #eee' }}>Pickup Time</th>
            <th style={{ padding: 10, border: '1px solid #eee' }}>From</th>
            <th style={{ padding: 10, border: '1px solid #eee' }}>To</th>
            <th style={{ padding: 10, border: '1px solid #eee' }}>Category</th>
            <th style={{ padding: 10, border: '1px solid #eee' }}>Headcount</th>
            <th style={{ padding: 10, border: '1px solid #eee' }}>Price ($)</th>
            <th style={{ padding: 10, border: '1px solid #eee' }}>Status</th>
            <th style={{ padding: 10, border: '1px solid #eee' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(req => (
            <tr key={req._id}>
              <td style={{ padding: 8, border: '1px solid #eee' }}>{req.customerName}</td>
              <td style={{ padding: 8, border: '1px solid #eee' }}>{req.email}</td>
              <td style={{ padding: 8, border: '1px solid #eee' }}>{req.phone}</td>
              <td style={{ padding: 8, border: '1px solid #eee' }}>{new Date(req.pickupTime).toLocaleString()}</td>
              <td style={{ padding: 8, border: '1px solid #eee' }}>{req.pickupLocation}</td>
              <td style={{ padding: 8, border: '1px solid #eee' }}>{req.dropLocation}</td>
              <td style={{ padding: 8, border: '1px solid #eee' }}>{req.carCategory}</td>
              <td style={{ padding: 8, border: '1px solid #eee' }}>{req.headcount}</td>
              <td style={{ padding: 8, border: '1px solid #eee' }}>
                <input
                  type="number"
                  value={req.price || ''}
                  min={0}
                  style={{ width: 80 }}
                  onChange={e => handleUpdate(req._id, { price: Number(e.target.value) })}
                  disabled={updating[req._id]}
                />
              </td>
              <td style={{ padding: 8, border: '1px solid #eee' }}>
                <select
                  value={req.status || 'Pending'}
                  onChange={e => handleUpdate(req._id, { status: e.target.value })}
                  disabled={updating[req._id]}
                >
                  {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </td>
              <td style={{ padding: 8, border: '1px solid #eee' }}>
                {updating[req._id] && <span>Updating...</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default withAdminAuth(AllPickupRequests); 