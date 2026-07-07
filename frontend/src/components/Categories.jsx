import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2 } from 'lucide-react';

const Categories = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });

  // Creation form
  const [newForm, setNewForm] = useState({ name: '', description: '' });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/categories');
      setCategories(response.data);
    } catch (err) {
      console.error(err);
      setError('Could not load categories list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post('/categories', newForm);
      setNewForm({ name: '', description: '' });
      setSuccess('Category created successfully!');
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create category.');
    }
  };

  const handleStartEdit = (category) => {
    setEditingId(category.id);
    setEditForm({ name: category.name, description: category.description || '' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.put(`/categories/${editingId}`, editForm);
      setEditingId(null);
      setSuccess('Category updated successfully!');
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update category.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    setError('');
    setSuccess('');
    try {
      await axios.delete(`/categories/${id}`);
      setSuccess('Category deleted successfully!');
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete category.');
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading categories list...</div>;

  return (
    <div>
      <h2>Categories Directory</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Organize stock items by functional category tags.
      </p>

      {error && <div className="alert-box danger">{error}</div>}
      {success && <div className="alert-box success" style={{ background: 'var(--success-glow)', border: '1px solid rgba(16,185,129,0.3)', color: '#a7f3d0' }}>{success}</div>}

      <div className="dashboard-grid" style={{ gridTemplateColumns: user.role === 'Manager' ? '2fr 1fr' : '1fr' }}>
        {/* Categories List */}
        <div className="panel-card glass">
          <h3 className="panel-title">Active Categories</h3>
          {categories.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', padding: '1rem 0' }}>No categories configured.</div>
          ) : (
            <div className="table-container" style={{ marginTop: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Category Name</th>
                    <th>Description</th>
                    {user.role === 'Manager' && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c.id}>
                      {editingId === c.id ? (
                        <td colSpan={user.role === 'Manager' ? 3 : 2}>
                          <form onSubmit={handleUpdate} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <input 
                              type="text" 
                              required 
                              className="form-control" 
                              style={{ width: '180px' }}
                              value={editForm.name} 
                              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
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
                          <td><strong>{c.name}</strong></td>
                          <td style={{ color: 'var(--text-secondary)' }}>{c.description || 'No description'}</td>
                          {user.role === 'Manager' && (
                            <td>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn btn-secondary" style={{ padding: '0.35rem' }} onClick={() => handleStartEdit(c)}>
                                  <Edit size={14} />
                                </button>
                                <button className="btn btn-danger" style={{ padding: '0.35rem' }} onClick={() => handleDelete(c.id)}>
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

        {/* Category Creator Form (Manager Only) */}
        {user.role === 'Manager' && (
          <div className="panel-card glass" style={{ height: 'fit-content' }}>
            <h3 className="panel-title">
              <span>Add Category</span>
              <Plus size={16} />
            </h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Category Name *</label>
                <input 
                  type="text" 
                  required 
                  className="form-control"
                  value={newForm.name}
                  onChange={(e) => setNewForm({...newForm, name: e.target.value})}
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
                Create Category
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
