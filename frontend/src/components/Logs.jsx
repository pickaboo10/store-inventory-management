import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { History, RefreshCw } from 'lucide-react';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/inventory-logs');
      setLogs(response.data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve audit history logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading audit logs...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2>Inventory Audit Logs</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Traceable timeline of every single inventory change, restock operation, and stock write-off.
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchLogs}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {error && <div className="alert-box danger">{error}</div>}

      {logs.length === 0 ? (
        <div className="glass" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', borderRadius: '16px' }}>
          No inventory transactions recorded yet.
        </div>
      ) : (
        <div className="table-container glass">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Product Info</th>
                <th>Operation</th>
                <th>Quantity Shift</th>
                <th>Warehouse Coordinate</th>
                <th>Performed By</th>
                <th>Transaction Note</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
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
                      {log.operation === 'Stock In' ? '+' : '-'}{log.quantity_changed} {log.product.unit}
                    </span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {log.previous_quantity} → {log.new_quantity}
                    </div>
                  </td>
                  <td>
                    <strong>{log.location.location_code}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{log.location.warehouse}</div>
                  </td>
                  <td>
                    <strong>{log.user ? log.user.name : 'System'}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{log.user ? log.user.role : ''}</div>
                  </td>
                  <td style={{ maxWidth: '250px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                    {log.reason || <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>N/A</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Logs;
