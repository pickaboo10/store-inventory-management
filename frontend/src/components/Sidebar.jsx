import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  Tag, 
  Layers, 
  MapPin, 
  Database, 
  History, 
  BarChart3, 
  User, 
  LogOut,
  FolderInput
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  
  if (!user) return null;

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false); // Close sidebar on mobile
  };

  const renderManagerMenu = () => (
    <>
      <li 
        className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => handleNavClick('dashboard')}
      >
        <LayoutDashboard size={20} />
        Dashboard
      </li>
      <li 
        className={`sidebar-item ${activeTab === 'products' ? 'active' : ''}`}
        onClick={() => handleNavClick('products')}
      >
        <Package size={20} />
        Products
      </li>
      <li 
        className={`sidebar-item ${activeTab === 'brands' ? 'active' : ''}`}
        onClick={() => handleNavClick('brands')}
      >
        <Tag size={20} />
        Brands
      </li>
      <li 
        className={`sidebar-item ${activeTab === 'categories' ? 'active' : ''}`}
        onClick={() => handleNavClick('categories')}
      >
        <Layers size={20} />
        Categories
      </li>
      <li 
        className={`sidebar-item ${activeTab === 'locations' ? 'active' : ''}`}
        onClick={() => handleNavClick('locations')}
      >
        <MapPin size={20} />
        Locations
      </li>
      <li 
        className={`sidebar-item ${activeTab === 'stock' ? 'active' : ''}`}
        onClick={() => handleNavClick('stock')}
      >
        <Database size={20} />
        Stock
      </li>
      <li 
        className={`sidebar-item ${activeTab === 'logs' ? 'active' : ''}`}
        onClick={() => handleNavClick('logs')}
      >
        <History size={20} />
        Inventory Logs
      </li>
      <li 
        className={`sidebar-item ${activeTab === 'reports' ? 'active' : ''}`}
        onClick={() => handleNavClick('reports')}
      >
        <BarChart3 size={20} />
        Reports
      </li>
    </>
  );

  const renderStaffMenu = () => (
    <>
      <li 
        className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => handleNavClick('dashboard')}
      >
        <LayoutDashboard size={20} />
        Dashboard
      </li>
      <li 
        className={`sidebar-item ${activeTab === 'inventory' ? 'active' : ''}`}
        onClick={() => handleNavClick('inventory')}
      >
        <Package size={20} />
        Inventory
      </li>
      <li 
        className={`sidebar-item ${activeTab === 'stock_updates' ? 'active' : ''}`}
        onClick={() => handleNavClick('stock_updates')}
      >
        <FolderInput size={20} />
        Stock Updates
      </li>
      <li 
        className={`sidebar-item ${activeTab === 'locations' ? 'active' : ''}`}
        onClick={() => handleNavClick('locations')}
      >
        <MapPin size={20} />
        Locations
      </li>
    </>
  );

  return (
    <aside className={`sidebar glass ${sidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <Database size={24} className="primary-color" style={{ stroke: '#6366f1' }} />
        <span>STOREFLOW</span>
      </div>
      
      <ul className="sidebar-menu">
        {user.role === 'Manager' ? renderManagerMenu() : renderStaffMenu()}
        
        <li 
          className={`sidebar-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => handleNavClick('profile')}
        >
          <User size={20} />
          Profile
        </li>
      </ul>

      <div className="sidebar-footer">
        <button className="btn btn-secondary" style={{ width: '100%' }} onClick={logout}>
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
