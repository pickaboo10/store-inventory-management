import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Database, Plus, Minus } from 'lucide-react';

const Stock = ({ onlyStockIn = false }) => {
  const { user } = useAuth();
  
  // Data State
  const [stockList, setStockList] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form States
  const [stockInForm, setStockInForm] = useState({ product_id: '', location_id: '', quantity: '', reason: 'Restocking' });
  const [stockOutForm, setStockOutForm] = useState({ product_id: '', location_id: '', quantity: '', reason: 'Sales/Usage' });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [stockRes, prodRes, locRes] = await Promise.all([
        axios.get('/stock'),
        axios.get('/products'),
        axios.get('/locations')
      ]);
      setStockList(stockRes.data);
      setProducts(prodRes.data);
      setLocations(locRes.data);
      
      // Pre-fill dropdowns
      if (prodRes.data.length > 0) {
        setStockInForm(prev => ({ ...prev, product_id: prodRes.data[0].id }));
        setStockOutForm(prev => ({ ...prev, product_id: prodRes.data[0].id }));
      }
      if (locRes.data.length > 0) {
        setStockInForm(prev => ({ ...prev, location_id: locRes.data[0].id }));
        setStockOutForm(prev => ({ ...prev, location_id: locRes.data[0].id }));
      }
    } catch (err) {
      console.error(err);
      setError('Could not retrieve stock allocations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStockIn = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const payload = {
      product_id: parseInt(stockInForm.product_id),
      location_id: parseInt(stockInForm.location_id),
      quantity: parseInt(stockInForm.quantity),
      reason: stockInForm.reason
    };

    try {
      await axios.post('/stock/in', payload);
      setSuccess('Stock successfully added!');
      setStockInForm(prev => ({ ...prev, quantity: '', reason: 'Restocking' }));
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Stock In failed.');
    }
  };

  const handleStockOut = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const payload = {
      product_id: parseInt(stockOutForm.product_id),
      location_id: parseInt(stockOutForm.location_id),
      quantity: parseInt(stockOutForm.quantity),
      reason: stockOutForm.reason
    };

    try {
      await axios.post('/stock/out', payload);
      setSuccess('Stock successfully deducted!');
      setStockOutForm(prev => ({ ...prev, quantity: '', reason: 'Sales/Usage' }));
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Stock Out failed.');
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading stock levels...</div>;

  return (
    <div>
      <h2>Stock Management</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Perform stock transactions and view real-time product quantities at various warehouse shelves.
      </p>

      {error && <div className="alert-box danger">{error}</div>}
      {success && <div className="alert-box success" style={{ background: 'var(--success-glow)', border: '1px solid rgba(16,185,129,0.3)', color: '#a7f3d0' }}>{success}</div>}

      <div className="dashboard-grid" style={{ gridTemplateColumns: onlyStockIn ? '1fr' : '2fr 1fr' }}>
        
        {/* Allocations List (Only shown on Stock tab, hidden if staff is viewing just StockUpdates form) */}
        {!onlyStockIn && (
          <div className="panel-card glass">
            <h3 className="panel-title">Current Storage Allocations</h3>
            {stockList.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', padding: '1rem 0' }}>No stock allocations in any location.</div>
            ) : (
              <div className="table-container" style={{ marginTop: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Location</th>
                      <th>Quantity</th>
                      <th>Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockList.map((s) => (
                      <tr key={s.id}>
                        <td>
                          <strong>{s.product.name}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SKU: {s.product.sku}</div>
                        </td>
                        <td>
                          <strong>{s.location.location_code}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.location.warehouse}</div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{s.quantity} {s.product.unit}</span>
                          {s.quantity < s.product.minimum_stock && (
                            <span className="badge badge-warning" style={{ marginLeft: '0.5rem', padding: '0.125rem 0.35rem', fontSize: '0.65rem' }}>Low</span>
                          )}
                        </td>
                        <td>{new Date(s.last_updated).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Transaction Forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Stock In Form */}
          <div className="panel-card glass">
            <h3 className="panel-title">
              <span>Stock In (Add Inventory)</span>
              <Plus size={16} style={{ color: 'var(--success)' }} />
            </h3>
            <form onSubmit={handleStockIn} className="stock-adjust-form">
              <div className="form-group">
                <label>Select Product *</label>
                <select 
                  className="form-control"
                  value={stockInForm.product_id}
                  onChange={(e) => setStockInForm({...stockInForm, product_id: e.target.value})}
                >
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Select Storage Location *</label>
                <select 
                  className="form-control"
                  value={stockInForm.location_id}
                  onChange={(e) => setStockInForm({...stockInForm, location_id: e.target.value})}
                >
                  {locations.map(l => <option key={l.id} value={l.id}>{l.location_code} - {l.warehouse}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Quantity *</label>
                <input 
                  type="number" 
                  min="1" 
                  required 
                  placeholder="Number of units"
                  className="form-control"
                  value={stockInForm.quantity}
                  onChange={(e) => setStockInForm({...stockInForm, quantity: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Transaction Note / Reason</label>
                <input 
                  type="text" 
                  placeholder="e.g. Restocking order, returned shipment"
                  className="form-control"
                  value={stockInForm.reason}
                  onChange={(e) => setStockInForm({...stockInForm, reason: e.target.value})}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ background: 'var(--success)' }}>
                Commit Stock In
              </button>
            </form>
          </div>

          {/* Stock Out Form (Manager Only) */}
          {!onlyStockIn && user.role === 'Manager' && (
            <div className="panel-card glass">
              <h3 className="panel-title">
                <span>Stock Out (Deduct Inventory)</span>
                <Minus size={16} style={{ color: 'var(--danger)' }} />
              </h3>
              <form onSubmit={handleStockOut} className="stock-adjust-form">
                <div className="form-group">
                  <label>Select Product *</label>
                  <select 
                    className="form-control"
                    value={stockOutForm.product_id}
                    onChange={(e) => setStockOutForm({...stockOutForm, product_id: e.target.value})}
                  >
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Select Storage Location *</label>
                  <select 
                    className="form-control"
                    value={stockOutForm.location_id}
                    onChange={(e) => setStockOutForm({...stockOutForm, location_id: e.target.value})}
                  >
                    {locations.map(l => <option key={l.id} value={l.id}>{l.location_code} - {l.warehouse}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Quantity *</label>
                  <input 
                    type="number" 
                    min="1" 
                    required 
                    placeholder="Number of units to deduct"
                    className="form-control"
                    value={stockOutForm.quantity}
                    onChange={(e) => setStockOutForm({...stockOutForm, quantity: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Transaction Note / Reason</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Sold, damaged, written-off"
                    className="form-control"
                    value={stockOutForm.reason}
                    onChange={(e) => setStockOutForm({...stockOutForm, reason: e.target.value})}
                  />
                </div>

                <button type="submit" className="btn btn-danger">
                  Commit Stock Out
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stock;
