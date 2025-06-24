import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../lib/AuthContext';
import Layout from '../components/Layout';
import withAuth from '../lib/withAuth';

function UserDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { user, refreshUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    isAdmin: false
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [adminLoading, setAdminLoading] = useState({});

  const fetchUsers = useCallback(async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    setError(null);
    
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch users');
      }
      
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users", error);
      setError(error.message || 'Failed to load users. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // Fetch all users
    fetchUsers();
  }, [fetchUsers]);

  // Filter users based on search term
  const filteredUsers = users.filter(userItem => {
    const searchLower = searchTerm.toLowerCase();
    return (
      userItem.name?.toLowerCase().includes(searchLower) ||
      userItem.username?.toLowerCase().includes(searchLower) ||
      userItem.email?.toLowerCase().includes(searchLower)
    );
  });

  // Sort users to place admins at the top
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    // If a is admin and b is not, a comes first
    if (a.isAdmin && !b.isAdmin) return -1;
    // If b is admin and a is not, b comes first
    if (!a.isAdmin && b.isAdmin) return 1;
    // Otherwise maintain existing order (could add secondary sort criteria here)
    return 0;
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const toggleModal = (mode = 'create', userId = null) => {
    setIsModalOpen(!isModalOpen);
    setFormError('');
    setFormSuccess('');
    
    if (!isModalOpen) {
      // Opening modal
      setEditMode(mode === 'edit');
      setEditUserId(userId);
      
      if (mode === 'edit' && userId) {
        // Find user data for editing
        const userToEdit = users.find(u => u._id === userId);
        if (userToEdit) {
          setNewUser({
            name: userToEdit.name || '',
            email: userToEdit.email || '',
            username: userToEdit.username || '',
            password: '', // Don't pre-fill password
            isAdmin: userToEdit.isAdmin || false
          });
        }
      } else {
        // Reset form for create mode
        setNewUser({
          name: '',
          email: '',
          username: '',
          password: '',
          isAdmin: false
        });
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewUser({
      ...newUser,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!newUser.name || !newUser.email || !newUser.username) {
      setFormError('Name, email and username are required');
      return;
    }

    if (!editMode && !newUser.password) {
      setFormError('Password is required for new users');
      return;
    }

    if (newUser.password && newUser.password.length < 6 && newUser.password.length > 0) {
      setFormError('Password must be at least 6 characters long');
      return;
    }

    if (!newUser.email.includes('@')) {
      setFormError('Please enter a valid email address');
      return;
    }

    setFormLoading(true);
    setFormError('');
    
    try {
      let res, data;
      
      if (editMode) {
        // Update existing user
        const updateData = { ...newUser };
        if (!updateData.password) {
          delete updateData.password; // Don't update password if empty
        }
        
        res = await fetch(`/api/users/${editUserId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });
      } else {
        // Create new user
        res = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newUser)
        });
      }
      
      data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || `Failed to ${editMode ? 'update' : 'create'} user`);
      }
      
      if (editMode) {
        // Update user in the list
        setUsers(users.map(u => u._id === editUserId ? data : u));
        setFormSuccess('User updated successfully!');
      } else {
        // Add new user to the list
        setUsers([...users, data]);
        setFormSuccess('User created successfully!');
      }
      
      // Reset form
      setNewUser({
        name: '',
        email: '',
        username: '',
        password: '',
        isAdmin: false
      });
      
      // Close modal after a delay
      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess('');
        setEditMode(false);
        setEditUserId(null);
        
        // Refresh the user list to ensure it's up to date
        fetchUsers(true);
      }, 2000);
      
    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'creating'} user:`, error);
      setFormError(error.message || `Failed to ${editMode ? 'update' : 'create'} user. Please try again.`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleAdminStatusChange = async (userId, isAdmin) => {
    // Set loading state for this specific user
    setAdminLoading(prev => ({ ...prev, [userId]: true }));
    
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isAdmin })
      });
      
      if (!res.ok) {
        throw new Error('Failed to update admin status');
      }
      
      const data = await res.json();
      
      // Update user in the list
      setUsers(users.map(u => u._id === userId ? data : u));
      
      console.log(`User admin status updated: ${data.isAdmin ? 'Admin' : 'User'}`);
      
      // Refresh the user list to ensure it's up to date
      setTimeout(() => fetchUsers(true), 500);
      
      // If the updated user is the currently logged-in user, refresh the auth context
      if (user && user._id === userId) {
        await refreshUser();
      }
      
    } catch (error) {
      console.error('Error updating admin status:', error);
      alert('Failed to update admin status. Please try again.');
    } finally {
      // Remove loading state for this user
      setAdminLoading(prev => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
    }
  };

  const handleDeleteUser = (userId, userName) => {
    setUserToDelete({ id: userId, name: userName });
    setShowDeleteConfirm(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      const res = await fetch(`/api/users/${userToDelete.id}`, {
        method: 'DELETE'
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete user');
      }
      
      // Remove user from the list
      setUsers(users.filter(u => u._id !== userToDelete.id));
      
      // Close confirmation modal
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      
      // Refresh the user list to ensure it's up to date
      setTimeout(() => fetchUsers(true), 500);
      
    } catch (error) {
      console.error('Error deleting user:', error);
      // You might want to show an error message here
    }
  };

  const cancelDeleteUser = () => {
    setShowDeleteConfirm(false);
    setUserToDelete(null);
  };

  // Refresh users manually
  const handleRefresh = () => {
    fetchUsers(true);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        {error}
        <div className="mt-4">
          <button onClick={() => window.location.reload()} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-actions">
          <button onClick={handleRefresh} className="btn-outline refresh-btn" disabled={refreshing}>
            {refreshing ? 'Refreshing...' : 'Refresh Users'}
          </button>
          <button onClick={() => toggleModal('create')} className="btn-primary">+ Add New User</button>
        </div>
      </div>
      
      <p>Welcome, {user?.name || 'User'}!</p>

      <div className="user-search-container">
        <input
          type="text"
          placeholder="Search users by name, username, or email"
          value={searchTerm}
          onChange={handleSearchChange}
          className="user-search-input"
        />
        <div className="user-count">
          Showing {sortedUsers.length} of {users.length} users
          {refreshing && <span className="refreshing-indicator"> (Refreshing...)</span>}
        </div>
      </div>

      <div className="user-table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Joined</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.length > 0 ? (
              sortedUsers.map((userItem) => (
                <tr key={userItem._id} className={userItem.isAdmin ? 'admin-row' : ''}>
                  <td>{userItem.name}</td>
                  <td>{userItem.username}</td>
                  <td>{userItem.email}</td>
                  <td>{new Date(userItem.createdAt).toLocaleDateString()}</td>
                  <td className="role-column">
                    <div className="role-selector">
                      <label className={`role-option ${userItem.isAdmin ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name={`role-${userItem._id}`}
                          checked={userItem.isAdmin}
                          onChange={() => handleAdminStatusChange(userItem._id, true)}
                          disabled={adminLoading[userItem._id]}
                        />
                        Admin
                      </label>
                      <label className={`role-option ${!userItem.isAdmin ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name={`role-${userItem._id}`}
                          checked={!userItem.isAdmin}
                          onChange={() => handleAdminStatusChange(userItem._id, false)}
                          disabled={adminLoading[userItem._id]}
                        />
                        User
                      </label>
                      {adminLoading[userItem._id] && (
                        <span className="role-loading"></span>
                      )}
                    </div>
                  </td>
                  <td className="action-buttons">
                    <button 
                      onClick={() => toggleModal('edit', userItem._id)} 
                      className="btn-edit"
                      title="Edit user"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(userItem._id, userItem.name)} 
                      className="btn-delete"
                      title="Delete user"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-table-message">
                  {searchTerm ? 'No users match your search' : 'No users found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <>
          <div className="modal-overlay" onClick={() => toggleModal()}></div>
          <div className="modal">
            <div className="modal-header">
              <h3>{editMode ? 'Edit User' : 'Create New User'}</h3>
              <button className="modal-close" onClick={() => toggleModal()}>&times;</button>
            </div>
            <div className="modal-body">
              {formError && <div className="form-error">{formError}</div>}
              {formSuccess && <div className="form-success">{formSuccess}</div>}
              
              <form onSubmit={handleUserSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newUser.name}
                    onChange={handleInputChange}
                    placeholder="Full Name"
                    disabled={formLoading}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={newUser.email}
                    onChange={handleInputChange}
                    placeholder="Email Address"
                    disabled={formLoading}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={newUser.username}
                    onChange={handleInputChange}
                    placeholder="Username"
                    disabled={formLoading}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="password">
                    {editMode ? 'Password (leave empty to keep current)' : 'Password'}
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={newUser.password}
                    onChange={handleInputChange}
                    placeholder={editMode ? "Leave empty to keep current password" : "Password (min. 6 characters)"}
                    disabled={formLoading}
                  />
                </div>
                
                <div className="form-group">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      name="isAdmin"
                      checked={newUser.isAdmin}
                      onChange={handleInputChange}
                      disabled={formLoading}
                    />
                    <span>Admin privileges</span>
                  </label>
                  <small>Admins can manage users and have full access to the system.</small>
                </div>
                
                <div className="form-actions">
                  <button type="button" className="btn-outline" onClick={() => toggleModal()} disabled={formLoading}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={formLoading}>
                    {formLoading 
                      ? (editMode ? 'Updating...' : 'Creating...') 
                      : (editMode ? 'Update User' : 'Create User')
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {showDeleteConfirm && userToDelete && (
        <>
          <div className="modal-overlay" onClick={cancelDeleteUser}></div>
          <div className="modal confirm-modal">
            <div className="modal-header">
              <h3>Confirm Delete</h3>
              <button className="modal-close" onClick={cancelDeleteUser}>&times;</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete the user: <strong>{userToDelete.name}</strong>?</p>
              <p className="warning-text">This action cannot be undone.</p>
              
              <div className="form-actions">
                <button className="btn-outline" onClick={cancelDeleteUser}>
                  Cancel
                </button>
                <button className="btn-delete" onClick={confirmDeleteUser}>
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default withAuth(UserDashboard, true); 