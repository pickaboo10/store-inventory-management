import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, TrendingUp, AlertTriangle, Layers, Tag } from 'lucide-react';

const Reports = () => {
  const [products, setProducts] = useState([]);
  const [stock, setStock] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, stockRes, catRes, brandRes] = await Promise.all([
        axios.get('/products'),
        axios.get('/stock'),
        axios.get('/categories'),
        axios.get('/brands')
      ]);
      setProducts(prodRes.data);
      setStock(stockRes.data);
      setCategories(catRes.data);
      setBrands(brandRes.data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve reports database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getProductStockSum = (productId) => {
    return stock
      .filter(item => item.product_id === productId)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Generating stock analytics reports...</div>;

  // 1. Core Analytics
  const totalItems = products.length;
  
  const totalValue = stock.reduce((sum, s) => {
    const prod = products.find(p => p.id === s.product_id);
    return sum + (s.quantity * (prod ? Number(prod.unit_price) : 0));
  }, 0);

  const totalStockUnits = stock.reduce((sum, s) => sum + s.quantity, 0);

  // 2. Category Breakdown
  const categoryStats = categories.map(cat => {
    const catProducts = products.filter(p => p.category_id === cat.id);
    const catUnits = stock
      .filter(s => {
        const p = products.find(prod => prod.id === s.product_id);
        return p && p.category_id === cat.id;
      })
      .reduce((sum, s) => sum + s.quantity, 0);

    const catValue = stock
      .filter(s => {
        const p = products.find(prod => prod.id === s.product_id);
        return p && p.category_id === cat.id;
      })
      .reduce((sum, s) => {
        const p = products.find(prod => prod.id === s.product_id);
        return sum + (s.quantity * (p ? Number(p.unit_price) : 0));
      }, 0);

    return {
      name: cat.name,
      productsCount: catProducts.length,
      unitsCount: catUnits,
      value: catValue
    };
  }).sort((a, b) => b.value - a.value);

  // 3. Brand Breakdown
  const brandStats = brands.map(b => {
    const brandProducts = products.filter(p => p.brand_id === b.id);
    const brandUnits = stock
      .filter(s => {
        const p = products.find(prod => prod.id === s.product_id);
        return p && p.brand_id === b.id;
      })
      .reduce((sum, s) => sum + s.quantity, 0);

    const brandValue = stock
      .filter(s => {
        const p = products.find(prod => prod.id === s.product_id);
        return p && p.brand_id === b.id;
      })
      .reduce((sum, s) => {
        const p = products.find(prod => prod.id === s.product_id);
        return sum + (s.quantity * (p ? Number(p.unit_price) : 0));
      }, 0);

    return {
      name: b.name,
      productsCount: brandProducts.length,
      unitsCount: brandUnits,
      value: brandValue
    };
  }).sort((a, b) => b.value - a.value);

  // 4. Most Stocked Items
  const stockedItems = products.map(p => {
    const qty = getProductStockSum(p.id);
    const value = qty * Number(p.unit_price);
    return { name: p.name, sku: p.sku, quantity: qty, unit: p.unit, value };
  }).sort((a, b) => b.quantity - a.quantity).slice(0, 5);

  const maxVal = Math.max(...categoryStats.map(c => c.value), 1);
  const maxBrandVal = Math.max(...brandStats.map(b => b.value), 1);

  return (
    <div>
      <h2>Inventory Valuation & Reports</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Detailed breakdown of current stock, categories, brands, and monetary value allocation.
      </p>

      {error && <div className="alert-box danger">{error}</div>}

      {/* Overview Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card glass">
          <div className="stat-details">
            <h3>Net Inventory Value</h3>
            <div className="stat-number">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-details">
            <h3>Total Stock Volume</h3>
            <div className="stat-number">{totalStockUnits.toLocaleString()} units</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <BarChart3 size={24} />
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-details">
            <h3>Active Products</h3>
            <div className="stat-number">{totalItems} models</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>
            <Layers size={24} />
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Category Value Contribution Chart */}
        <div className="panel-card glass">
          <h3 className="panel-title" style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
            <span>Category Value Allocation</span>
            <Layers size={16} style={{ color: '#6b7280' }} />
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.25rem' }}>
            {categoryStats.map((c, i) => {
              const pct = (c.value / maxVal) * 100;
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                    <strong>{c.name}</strong>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      ${c.value.toFixed(2)} ({c.unitsCount} units)
                    </span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.05)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ background: 'var(--primary)', width: `${pct}%`, height: '100%', borderRadius: '4px' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Brand Value Contribution Chart */}
        <div className="panel-card glass">
          <h3 className="panel-title" style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
            <span>Brand Value Distribution</span>
            <Tag size={16} style={{ color: '#6b7280' }} />
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.25rem' }}>
            {brandStats.map((b, i) => {
              const pct = (b.value / maxBrandVal) * 100;
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                    <strong>{b.name}</strong>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      ${b.value.toFixed(2)}
                    </span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.05)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ background: 'var(--success)', width: `${pct}%`, height: '100%', borderRadius: '4px' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top 5 Stocked Products */}
      <div className="panel-card glass">
        <h3 className="panel-title">Top 5 Most Stocked Products</h3>
        <div className="table-container" style={{ marginTop: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Units Stocked</th>
                <th>Monetary Value</th>
              </tr>
            </thead>
            <tbody>
              {stockedItems.map((item, idx) => (
                <tr key={idx}>
                  <td><strong>{item.name}</strong></td>
                  <td><code>{item.sku}</code></td>
                  <td>{item.quantity} {item.unit}</td>
                  <td>${item.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
