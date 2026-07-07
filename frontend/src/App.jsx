import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Brands from './components/Brands';
import Categories from './components/Categories';
import Locations from './components/Locations';
import Stock from './components/Stock';
import Logs from './components/Logs';
import Reports from './components/Reports';
import Profile from './components/Profile';
import { KeyRound, Mail, UserPlus, Database, Menu, Shield } from 'lucide-react';

function App() {
  const { user, login, register, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auth screen toggle
  const [isLoginView, setIsLoginView] = useState(true);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Login form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('Staff');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      await login(loginEmail, loginPassword);
      setActiveTab('dashboard');
    } catch (err) {
      setAuthError(err);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    try {
      await register(regName, regEmail, regPassword, regRole);
      setAuthSuccess('Account registered successfully! You can now log in.');
      setIsLoginView(true);
      // Pre-fill login details
      setLoginEmail(regEmail);
      setLoginPassword('');
    } catch (err) {
      setAuthError(err);
    }
  };

  const fillDemoCredentials = (role) => {
    setAuthError('');
    if (role === 'Manager') {
      setLoginEmail('manager@store.com');
      setLoginPassword('manager123');
    } else {
      setLoginEmail('staff@store.com');
      setLoginPassword('staff123');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: '#fff' }}>
        <h2>Loading StoreFlow...</h2>
      </div>
    );
  }

  // --- UNAUTHENTICATED RENDER ---
  if (!user) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card glass">
          <div className="auth-header">
            <div style={{ display: 'inline-flex', width: '56px', height: '56px', borderRadius: '12px', background: 'var(--primary-glow)', color: 'var(--primary)', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Database size={32} />
            </div>
            <h2>StoreFlow</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              {isLoginView ? 'Sign in to manage inventory' : 'Create a staff account'}
            </p>
          </div>

          {authError && <div className="alert-box danger" style={{ padding: '0.75rem', borderRadius: '6px' }}>{authError}</div>}
          {authSuccess && <div className="alert-box success" style={{ padding: '0.75rem', borderRadius: '6px', background: 'var(--success-glow)', color: '#a7f3d0' }}>{authSuccess}</div>}

          {isLoginView ? (
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input 
                    type="email" 
                    required 
                    placeholder="name@store.com"
                    className="form-control"
                    style={{ paddingLeft: '2.5rem' }}
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input 
                    type="password" 
                    required 
                    placeholder="••••••••"
                    className="form-control"
                    style={{ paddingLeft: '2.5rem' }}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                Sign In
              </button>

              {/* Demo Assist Panel */}
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--card-border)', paddingTop: '1rem' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '0.5rem' }}>
                  <strong>Demo Accounts (Quick Autofill):</strong>
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem' }} onClick={() => fillDemoCredentials('Manager')}>
                    Manager Profile
                  </button>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem' }} onClick={() => fillDemoCredentials('Staff')}>
                    Staff Profile
                  </button>
                </div>
              </div>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '1.5rem' }}>
                Don't have an account?{' '}
                <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }} onClick={() => { setIsLoginView(false); setAuthError(''); }}>
                  Register Staff
                </span>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="John Doe"
                  className="form-control"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  required 
                  placeholder="john@store.com"
                  className="form-control"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  required 
                  placeholder="Minimum 6 characters"
                  className="form-control"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>System Access Level</label>
                <select 
                  className="form-control"
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                >
                  <option value="Staff">Staff (Operations, restock only)</option>
                  <option value="Manager">Manager (Full catalog write/deduct rights)</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                <UserPlus size={16} /> Register Member
              </button>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '1.5rem' }}>
                Already registered?{' '}
                <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }} onClick={() => { setIsLoginView(true); setAuthError(''); }}>
                  Sign In
                </span>
              </p>
            </form>
          )}
        </div>
      </div>
    );
  }

  // --- AUTHENTICATED RENDER ---
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <Products />;
      case 'inventory':
        return <Products isReadOnly={true} />;
      case 'brands':
        return <Brands />;
      case 'categories':
        return <Categories />;
      case 'locations':
        return <Locations />;
      case 'stock':
        return <Stock />;
      case 'stock_updates':
        return <Stock onlyStockIn={true} />;
      case 'logs':
        return <Logs />;
      case 'reports':
        return <Reports />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      {/* Responsive mobile sidebar toggle overlay */}
      {sidebarOpen && <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.4)', zIndex: 9 }} onClick={() => setSidebarOpen(false)}></div>}

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />

      <div className="main-content">
        <header className="top-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button className="btn btn-secondary" style={{ padding: '0.5rem', display: 'none' }} className="mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu size={18} />
            </button>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Store Inventory Control</h1>
          </div>

          <div className="user-profile-badge">
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{user.name}</span>
            <span className={`role-tag ${user.role.toLowerCase()}`}>
              {user.role}
            </span>
          </div>
        </header>

        <main className="content-body">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
