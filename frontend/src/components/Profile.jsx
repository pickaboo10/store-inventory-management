import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Check, X } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  const managerPermissions = [
    'Add, Edit, and Delete Products',
    'Manage Brands (Create, Update, Delete)',
    'Manage Categories (Create, Update, Delete)',
    'Manage Storage Locations (Create, Update, Delete)',
    'Perform Stock In operations',
    'Perform Stock Out operations',
    'View all Inventory Audit Logs',
    'View financial inventory reports',
    'View low stock alerts'
  ];

  const staffPermissions = {
    allowed: [
      'View Inventory catalog',
      'Search and Filter products',
      'View detailed product locations',
      'Perform Stock In (Restocking) operations',
      'View active storage coordinates'
    ],
    denied: [
      'Add new products to directory',
      'Edit or modify product catalog info',
      'Delete products',
      'Manage Brands, Categories, or Locations',
      'Perform Stock Out (Deductions)',
      'View financial valuation reports',
      'View Inventory logs history trail'
    ]
  };

  return (
    <div>
      <h2>User Profile</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Manage your user account credentials and review system access permissions.
      </p>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 2fr' }}>
        
        {/* User Card */}
        <div className="panel-card glass" style={{ textAlign: 'center', height: 'fit-content' }}>
          <div style={{ display: 'inline-flex', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <User size={40} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{user.name}</h3>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{user.email}</div>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', borderRadius: '9999px', background: user.role === 'Manager' ? 'var(--primary-glow)' : 'var(--success-glow)', border: `1px solid ${user.role === 'Manager' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(16, 185, 129, 0.3)'}` }}>
            <Shield size={14} style={{ color: user.role === 'Manager' ? 'var(--primary)' : 'var(--success)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: user.role === 'Manager' ? 'var(--primary)' : 'var(--success)' }}>
              {user.role} Authorization
            </span>
          </div>
        </div>

        {/* Permissions Log */}
        <div className="panel-card glass">
          <h3 className="panel-title">System Permissions Matrix</h3>
          
          {user.role === 'Manager' ? (
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--success)', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Check size={16} /> Full Administrator Access:
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {managerPermissions.map((perm, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }}></span>
                    {perm}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--success)', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={16} /> Authorized Operations:
                </p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {staffPermissions.allowed.map((perm, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }}></span>
                      {perm}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '1.25rem' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--danger)', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <X size={16} /> Restricted Actions:
                </p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {staffPermissions.denied.map((perm, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <X size={12} style={{ color: 'var(--danger)' }} />
                      {perm}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Profile;
