import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2 } from 'lucide-react';

const Brands = () => {
  const { user } = useAuth();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', country: '', description: '' });

  // Creation form
  const [newForm, setNewForm] = useState({ name: '', country: '', description: '' });

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/brands');
      setBrands(response.data);
    } catch (err) {
      console.error(err);
      setError('Could not load brands list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post('/brands', newForm);
      setNewForm({ name: '', country: '', description: '' });
      setSuccess('Brand created successfully!');
      fetchBrands();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create brand.');
    }
  };

  const handleStartEdit = (brand) => {
    setEditingId(brand.id);
    setEditForm({ name: brand.name, country: brand.country || '', description: brand.description || '' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.put(`/brands/${editingId}`, editForm);
      setEditingId(null);
      setSuccess('Brand updated successfully!');
      fetchBrands();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update brand.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this brand?')) return;
    setError('');
    setSuccess('');
    try {
      await axios.delete(`/brands/${id}`);
      setSuccess('Brand deleted successfully!');
      fetchBrands();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete brand.');
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading brands list...</div>;

  return (
    <div>
      <h2>Brands Directory</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Manage manufacturers and brand names associated with inventory items.
      </p>

      {error && <div className="alert-box danger">{error}</div>}
      {success && <div className="alert-box success" style={{ background: 'var(--success-glow)', border: '1px solid rgba(16,185,129,0.3)', color: '#a7f3d0' }}>{success}</div>}

      <div className="dashboard-grid" style={{ gridTemplateColumns: user.role === 'Manager' ? '2fr 1fr' : '1fr' }}>
        {/* Brands List */}
        <div className="panel-card glass">
          <h3 className="panel-title">Active Brands</h3>
          {brands.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', padding: '1rem 0' }}>No brands configured.</div>
          ) : (
            <div className="table-container" style={{ marginTop: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Brand Name</th>
                    <th>Country</th>
                    <th>Description</th>
                    {user.role === 'Manager' && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {brands.map((b) => (
                    <tr key={b.id}>
                      {editingId === b.id ? (
                        <td colSpan={user.role === 'Manager' ? 4 : 3}>
                          <form onSubmit={handleUpdate} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <input 
                              type="text" 
                              required 
                              className="form-control" 
                              style={{ width: '150px' }}
                              value={editForm.name} 
                              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                            />
                            <input 
                              type="text" 
                              className="form-control" 
                              style={{ width: '120px' }}
                              placeholder="Country"
                              value={editForm.country} 
                              onChange={(e) => setEditForm({...editForm, country: e.target.value})}
                            />
                            <input 
                              type="text" 
                              className="form-control" 
                              style={{ flex: 1 }}
                              placeholder="Description"
                              value={editForm.description} 
                              onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                            />
                            <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Save</button>
                            <button type="button" className="btn btn-secondary" onClick={handleCancelEdit} style={{ padding: '0.5rem 1rem' }}>Cancel</button>
                          </form>
                        </td>
                      ) : (
                        <>
                          <td><strong>{b.name}</strong></td>
                          <td>{b.country || 'N/A'}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{b.description || 'No description'}</td>
                          {user.role === 'Manager' && (
                            <td>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn btn-secondary" style={{ padding: '0.35rem' }} onClick={() => handleStartEdit(b)}>
                                  <Edit size={14} />
                                </button>
                                <button className="btn btn-danger" style={{ padding: '0.35rem' }} onClick={() => handleDelete(b.id)}>
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          )}
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Brand Creator Form (Manager Only) */}
        {user.role === 'Manager' && (
          <div className="panel-card glass" style={{ height: 'fit-content' }}>
            <h3 className="panel-title">
              <span>Add Brand</span>
              <Plus size={16} />
            </h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Brand Name *</label>
                <input 
                  type="text" 
                  required 
                  className="form-control"
                  value={newForm.name}
                  onChange={(e) => setNewForm({...newForm, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Country of Origin</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={newForm.country}
                  onChange={(e) => setNewForm({...newForm, country: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  rows="3" 
                  className="form-control"
                  value={newForm.description}
                  onChange={(e) => setNewForm({...newForm, description: e.target.value})}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                Create Brand
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Brands;
