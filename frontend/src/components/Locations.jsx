import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2 } from 'lucide-react';

const Locations = () => {
  const { user } = useAuth();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ location_code: '', warehouse: '', aisle: '', shelf: '', description: '' });

  // Creation form
  const [newForm, setNewForm] = useState({ location_code: '', warehouse: '', aisle: '', shelf: '', description: '' });

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/locations');
      setLocations(response.data);
    } catch (err) {
      console.error(err);
      setError('Could not load storage locations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post('/locations', newForm);
      setNewForm({ location_code: '', warehouse: '', aisle: '', shelf: '', description: '' });
      setSuccess('Storage location created successfully!');
      fetchLocations();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create location.');
    }
  };

  const handleStartEdit = (loc) => {
    setEditingId(loc.id);
    setEditForm({
      location_code: loc.location_code,
      warehouse: loc.warehouse,
      aisle: loc.aisle,
      shelf: loc.shelf,
      description: loc.description || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.put(`/locations/${editingId}`, editForm);
      setEditingId(null);
      setSuccess('Storage location updated successfully!');
      fetchLocations();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update location.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this storage location?')) return;
    setError('');
    setSuccess('');
    try {
      await axios.delete(`/locations/${id}`);
      setSuccess('Storage location deleted successfully!');
      fetchLocations();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete location.');
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading storage zones...</div>;

  return (
    <div>
      <h2>Storage Locations</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Configure warehouse shelves, aisles, and sections for optimal inventory sorting.
      </p>

      {error && <div className="alert-box danger">{error}</div>}
      {success && <div className="alert-box success" style={{ background: 'var(--success-glow)', border: '1px solid rgba(16,185,129,0.3)', color: '#a7f3d0' }}>{success}</div>}

      <div className="dashboard-grid" style={{ gridTemplateColumns: user.role === 'Manager' ? '2fr 1fr' : '1fr' }}>
        {/* Locations List */}
        <div className="panel-card glass">
          <h3 className="panel-title">Active Warehouse Coordinates</h3>
          {locations.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', padding: '1rem 0' }}>No storage locations configured.</div>
          ) : (
            <div className="table-container" style={{ marginTop: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Location Code</th>
                    <th>Warehouse</th>
                    <th>Aisle</th>
                    <th>Shelf</th>
                    <th>Description</th>
                    {user.role === 'Manager' && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {locations.map((l) => (
                    <tr key={l.id}>
                      {editingId === l.id ? (
                        <td colSpan={user.role === 'Manager' ? 6 : 5}>
                          <form onSubmit={handleUpdate} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr) auto auto', gap: '0.5rem' }}>
                            <input 
                              type="text" 
                              required 
                              placeholder="Code (e.g. WH-A-1-A)"
                              className="form-control" 
                              value={editForm.location_code} 
                              onChange={(e) => setEditForm({...editForm, location_code: e.target.value})}
                            />
                            <input 
                              type="text" 
                              required 
                              placeholder="Warehouse"
                              className="form-control" 
                              value={editForm.warehouse} 
                              onChange={(e) => setEditForm({...editForm, warehouse: e.target.value})}
                            />
                            <input 
                              type="text" 
                              required 
                              placeholder="Aisle"
                              className="form-control" 
                              value={editForm.aisle} 
                              onChange={(e) => setEditForm({...editForm, aisle: e.target.value})}
                            />
                            <input 
                              type="text" 
                              required 
                              placeholder="Shelf"
                              className="form-control" 
                              value={editForm.shelf} 
                              onChange={(e) => setEditForm({...editForm, shelf: e.target.value})}
                            />
                            <input 
                              type="text" 
                              placeholder="Notes"
                              className="form-control" 
                              value={editForm.description} 
                              onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                            />
                            <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Save</button>
                            <button type="button" className="btn btn-secondary" onClick={handleCancelEdit} style={{ padding: '0.5rem 1rem' }}>Cancel</button>
                          </form>
                        </td>
                      ) : (
                        <>
                          <td><code style={{ background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>{l.location_code}</code></td>
                          <td><strong>{l.warehouse}</strong></td>
                          <td>Aisle {l.aisle}</td>
                          <td>Shelf {l.shelf}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{l.description || 'No description'}</td>
                          {user.role === 'Manager' && (
                            <td>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn btn-secondary" style={{ padding: '0.35rem' }} onClick={() => handleStartEdit(l)}>
                                  <Edit size={14} />
                                </button>
                                <button className="btn btn-danger" style={{ padding: '0.35rem' }} onClick={() => handleDelete(l.id)}>
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

        {/* Location Creator Form (Manager Only) */}
        {user.role === 'Manager' && (
          <div className="panel-card glass" style={{ height: 'fit-content' }}>
            <h3 className="panel-title">
              <span>Create Location</span>
              <Plus size={16} />
            </h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Location Code * (Unique)</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. WH-A-1-C"
                  className="form-control"
                  value={newForm.location_code}
                  onChange={(e) => setNewForm({...newForm, location_code: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Warehouse Name *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Warehouse A"
                  className="form-control"
                  value={newForm.warehouse}
                  onChange={(e) => setNewForm({...newForm, warehouse: e.target.value})}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Aisle Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. 1"
                    className="form-control"
                    value={newForm.aisle}
                    onChange={(e) => setNewForm({...newForm, aisle: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Shelf Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. C"
                    className="form-control"
                    value={newForm.shelf}
                    onChange={(e) => setNewForm({...newForm, shelf: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description / Instructions</label>
                <textarea 
                  rows="2" 
                  placeholder="Aisle instructions or specific notes"
                  className="form-control"
                  value={newForm.description}
                  onChange={(e) => setNewForm({...newForm, description: e.target.value})}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                Create Location
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Locations;
