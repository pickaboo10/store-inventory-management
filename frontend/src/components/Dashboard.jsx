import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Package, 
  Tag, 
  Layers, 
  DollarSign, 
  AlertTriangle, 
  History, 
  CheckCircle,
  Database,
  RefreshCw
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = user.role === 'Manager' ? '/dashboard/manager' : '/dashboard/staff';
      const response = await axios.get(endpoint);
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Could not retrieve dashboard analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user.role]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>Loading dashboard analytics...</div>;
  }

  if (error) {
    return <div className="alert-box danger">{error}</div>;
  }

  const renderManagerDashboard = () => {
    const { 
      total_products, 
      total_brands, 
      total_categories, 
      inventory_value, 
      low_stock_products, 
      out_of_stock_products, 
      recent_activity 
    } = stats;

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>Manager Dashboard</h2>
          <button className="btn btn-secondary btn-sm" onClick={fetchStats}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Analytics Cards */}
        <div className="stats-grid">
          <div className="stat-card glass">
            <div className="stat-details">
              <h3>Total Products</h3>
              <div className="stat-number">{total_products}</div>
            </div>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
              <Package size={24} />
            </div>
          </div>

          <div className="stat-card glass">
            <div className="stat-details">
              <h3>Brands</h3>
              <div className="stat-number">{total_brands}</div>
            </div>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <Tag size={24} />
            </div>
          </div>

          <div className="stat-card glass">
            <div className="stat-details">
              <h3>Categories</h3>
              <div className="stat-number">{total_categories}</div>
            </div>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>
              <Layers size={24} />
            </div>
          </div>

          <div className="stat-card glass">
            <div className="stat-details">
              <h3>Inventory Value</h3>
              <div className="stat-number">${Number(inventory_value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="stat-card glass" style={{ borderColor: low_stock_products > 0 ? 'rgba(245, 158, 11, 0.4)' : '' }}>
            <div className="stat-details">
              <h3>Low Stock Alert</h3>
              <div className="stat-number" style={{ color: low_stock_products > 0 ? '#f59e0b' : '' }}>{low_stock_products}</div>
            </div>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
              <AlertTriangle size={24} />
            </div>
          </div>

          <div className="stat-card glass" style={{ borderColor: out_of_stock_products > 0 ? 'rgba(239, 68, 68, 0.4)' : '' }}>
            <div className="stat-details">
              <h3>Out of Stock</h3>
              <div className="stat-number" style={{ color: out_of_stock_products > 0 ? '#ef4444' : '' }}>{out_of_stock_products}</div>
            </div>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Recent Inventory Activity Panel */}
          <div className="panel-card glass">
            <h3 className="panel-title">
              <span>Recent Inventory Activity</span>
              <History size={16} style={{ color: '#6b7280' }} />
            </h3>
            
            {recent_activity.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', padding: '1rem 0' }}>No recent activity logged.</div>
            ) : (
              <div className="table-container" style={{ marginTop: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Product</th>
                      <th>Operation</th>
                      <th>Quantity</th>
                      <th>User</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent_activity.map((log) => (
                      <tr key={log.id}>
                        <td>{new Date(log.created_at).toLocaleString()}</td>
                        <td>
                          <strong>{log.product.name}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SKU: {log.product.sku}</div>
                        </td>
                        <td>
                          <span className={`badge ${log.operation === 'Stock In' ? 'badge-success' : 'badge-danger'}`}>
                            {log.operation}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: log.operation === 'Stock In' ? 'var(--success)' : 'var(--danger)' }}>
                            {log.operation === 'Stock In' ? '+' : '-'}{log.quantity_changed}
                          </span>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {log.previous_quantity} → {log.new_quantity}
                          </div>
                        </td>
                        <td>{log.user ? log.user.name : 'Unknown User'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Replenishment Alert Panel */}
          <div className="panel-card glass">
            <h3 className="panel-title">
              <span>Replenishment Tasks</span>
              <CheckCircle size={16} style={{ color: '#10b981' }} />
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {low_stock_products === 0 ? (
                <div style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 0' }}>
                  <CheckCircle size={16} /> All product stocks are healthy!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="alert-box warning" style={{ margin: 0 }}>
                    <AlertTriangle size={18} />
                    <div>
                      <strong>{low_stock_products} products need restocking</strong>
                      <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Current stock level is below the defined reorder points.</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStaffDashboard = () => {
    const { 
      products_in_stock, 
      low_stock_items, 
      recent_stock_updates 
    } = stats;

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>Staff Dashboard</h2>
          <button className="btn btn-secondary btn-sm" onClick={fetchStats}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card glass">
            <div className="stat-details">
              <h3>Products in Stock</h3>
              <div className="stat-number">{products_in_stock}</div>
            </div>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <Database size={24} />
            </div>
          </div>

          <div className="stat-card glass" style={{ borderColor: low_stock_items > 0 ? 'rgba(245, 158, 11, 0.4)' : '' }}>
            <div className="stat-details">
              <h3>Low Stock Alerts</h3>
              <div className="stat-number" style={{ color: low_stock_items > 0 ? '#f59e0b' : '' }}>{low_stock_items}</div>
            </div>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>

        <div className="panel-card glass">
          <h3 className="panel-title">
            <span>My Recent Stock Updates</span>
            <History size={16} style={{ color: '#6b7280' }} />
          </h3>

          {recent_stock_updates.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', padding: '1rem 0' }}>No recent stock updates.</div>
          ) : (
            <div className="table-container" style={{ marginTop: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Product</th>
                    <th>Warehouse Location</th>
                    <th>Quantity Added</th>
                    <th>Reason / Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {recent_stock_updates.map((log) => (
                    <tr key={log.id}>
                      <td>{new Date(log.created_at).toLocaleString()}</td>
                      <td>
                        <strong>{log.product.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SKU: {log.product.sku}</div>
                      </td>
                      <td>
                        <strong>{log.location.location_code}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{log.location.warehouse}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--success)' }}>
                          +{log.quantity_changed}
                        </span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          New Stock: {log.new_quantity} {log.product.unit}
                        </div>
                      </td>
                      <td>{log.reason || 'Restocking'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  return user.role === 'Manager' ? renderManagerDashboard() : renderStaffDashboard();
};

export default Dashboard;
