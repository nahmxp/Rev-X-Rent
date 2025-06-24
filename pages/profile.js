import { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import withAuth from '../lib/withAuth';

function Profile() {
  const { user, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  
  // Initialize form data when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user]);
  
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    
    // Reset form data to current user values when toggling edit mode
    if (!isEditing) {
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
      });
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Here you would normally update the user profile
    // For now, we just toggle back to view mode
    setIsEditing(false);
  };
  
  if (loading || !user) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }
  
  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1>My Profile</h1>
        
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              <span>{user.name?.charAt(0) || user.username?.charAt(0) || 'U'}</span>
            </div>
            <div className="profile-title">
              <h2>{user.name || user.username}</h2>
              <p>{user.email}</p>
            </div>
          </div>
          
          {isEditing ? (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Your email address"
                  disabled
                />
                <small>Email cannot be changed</small>
              </div>
              
              <div className="profile-actions">
                <button type="button" className="btn-outline" onClick={handleEditToggle}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-info">
              <div className="info-group">
                <label>Username</label>
                <p>{user.username}</p>
              </div>
              
              <div className="info-group">
                <label>Full Name</label>
                <p>{user.name || 'Not specified'}</p>
              </div>
              
              <div className="info-group">
                <label>Email Address</label>
                <p>{user.email}</p>
              </div>
              
              <div className="info-group">
                <label>Account Created</label>
                <p>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</p>
              </div>
              
              <div className="profile-actions">
                <button className="btn-primary" onClick={handleEditToggle}>
                  Edit Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default withAuth(Profile); 