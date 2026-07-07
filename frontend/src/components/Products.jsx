import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  Info,
  X,
  Check,
  Eye
} from 'lucide-react';

const Products = ({ isReadOnly = false }) => {
  const { user } = useAuth();
  
  // State
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stock, setStock] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [stockFilter, setStockFilter] = useState(''); // 'low', 'out', 'in'

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add', 'edit', 'view'
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    brand_id: '',
    category_id: '',
    unit_price: '',
    unit: 'pcs',
    minimum_stock: 0,
    is_active: true
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, brandRes, catRes, stockRes] = await Promise.all([
        axios.get('/products'),
        axios.get('/brands'),
        axios.get('/categories'),
        axios.get('/stock')
      ]);
      setProducts(prodRes.data);
      setBrands(brandRes.data);
      setCategories(catRes.data);
      setStock(stockRes.data);
    } catch (err) {
      console.error('Error fetching inventory data:', err);
      setError('Could not load products inventory list.');
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

  const getProductLocations = (productId) => {
    return stock
      .filter(item => item.product_id === productId && item.quantity > 0)
      .map(item => `${item.location.location_code} (${item.quantity} ${item.product.unit})`);
  };

  const handleOpenAddModal = () => {
    setModalType('add');
    setFormData({
      name: '',
      sku: '',
      description: '',
      brand_id: brands[0]?.id || '',
      category_id: categories[0]?.id || '',
      unit_price: '',
      unit: 'pcs',
      minimum_stock: 0,
      is_active: true
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (product) => {
    setModalType('edit');
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      description: product.description || '',
      brand_id: product.brand_id,
      category_id: product.category_id,
      unit_price: product.unit_price,
      unit: product.unit,
      minimum_stock: product.minimum_stock,
      is_active: product.is_active
    });
    setShowModal(true);
  };

  const handleOpenViewModal = (product) => {
    setModalType('view');
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const payload = {
      ...formData,
      brand_id: parseInt(formData.brand_id),
      category_id: parseInt(formData.category_id),
      unit_price: parseFloat(formData.unit_price),
      minimum_stock: parseInt(formData.minimum_stock),
    };

    try {
      if (modalType === 'add') {
        await axios.post('/products', payload);
      } else if (modalType === 'edit') {
        await axios.put(`/products/${selectedProduct.id}`, payload);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err.response?.data?.detail || 'Failed to save product details.');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? All stock entries for this product will also be removed.')) {
      return;
    }
    try {
      await axios.delete(`/products/${productId}`);
      fetchData();
    } catch (err) {
      console.error('Error deleting product:', err);
      alert(err.response?.data?.detail || 'Failed to delete product.');
    }
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) || 
                          product.sku.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = selectedCategory ? product.category_id === parseInt(selectedCategory) : true;
    const matchesBrand = selectedBrand ? product.brand_id === parseInt(selectedBrand) : true;
    
    const totalQty = getProductStockSum(product.id);
    let matchesStock = true;
    if (stockFilter === 'low') {
      matchesStock = totalQty < product.minimum_stock;
    } else if (stockFilter === 'out') {
      matchesStock = totalQty === 0;
    } else if (stockFilter === 'in') {
      matchesStock = totalQty >= product.minimum_stock && totalQty > 0;
    }

    return matchesSearch && matchesCategory && matchesBrand && matchesStock;
  });

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading product catalog...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>{isReadOnly ? 'Inventory Catalog' : 'Product Directory'}</h2>
        {!isReadOnly && user.role === 'Manager' && (
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            <Plus size={16} /> Add Product
          </button>
        )}
      </div>

      {error && <div className="alert-box danger">{error}</div>}

      {/* Filter Bar */}
      <div className="filter-bar glass" style={{ padding: '1rem', borderRadius: '12px' }}>
        <div className="search-input-wrapper">
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search by name or SKU..." 
            className="form-control" 
            style={{ paddingLeft: '2.5rem' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <select 
          className="form-control filter-select" 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select 
          className="form-control filter-select" 
          value={selectedBrand} 
          onChange={(e) => setSelectedBrand(e.target.value)}
        >
          <option value="">All Brands</option>
          {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>

        <select 
          className="form-control filter-select" 
          value={stockFilter} 
          onChange={(e) => setStockFilter(e.target.value)}
        >
          <option value="">All Stock Levels</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
          <option value="in">Healthy Stock</option>
        </select>
      </div>

      {/* Product List Table */}
      {filteredProducts.length === 0 ? (
        <div className="glass" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', borderRadius: '16px' }}>
          No products match your search/filter criteria.
        </div>
      ) : (
        <div className="table-container glass">
          <table>
            <thead>
              <tr>
                <th>Product Info</th>
                <th>SKU</th>
                <th>Category / Brand</th>
                <th>Price</th>
                <th>Stock Level</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const totalQty = getProductStockSum(p.id);
                const isLow = totalQty < p.minimum_stock;
                const isOut = totalQty === 0;

                return (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>
                        Unit: {p.unit}
                      </div>
                    </td>
                    <td><code style={{ background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>{p.sku}</code></td>
                    <td>
                      <div>{p.category.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{p.brand.name}</div>
                    </td>
                    <td>${Number(p.unit_price).toFixed(2)}</td>
                    <td>
                      <span style={{ fontWeight: 600, color: isOut ? 'var(--danger)' : isLow ? 'var(--warning)' : 'var(--text-primary)' }}>
                        {totalQty} {p.unit}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Min: {p.minimum_stock}</div>
                    </td>
                    <td>
                      {isOut ? (
                        <span className="badge badge-danger">Out of Stock</span>
                      ) : isLow ? (
                        <span className="badge badge-warning">Low Stock</span>
                      ) : (
                        <span className="badge badge-success">In Stock</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-secondary" style={{ padding: '0.35rem' }} onClick={() => handleOpenViewModal(p)}>
                          <Eye size={14} />
                        </button>
                        {!isReadOnly && user.role === 'Manager' && (
                          <>
                            <button className="btn btn-secondary" style={{ padding: '0.35rem' }} onClick={() => handleOpenEditModal(p)}>
                              <Edit size={14} />
                            </button>
                            <button className="btn btn-danger" style={{ padding: '0.35rem' }} onClick={() => handleDeleteProduct(p.id)}>
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* CRUD/View Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <div className="modal-header">
              <h3 className="modal-title">
                {modalType === 'add' ? 'Add New Product' : modalType === 'edit' ? 'Edit Product Details' : 'Product Details'}
              </h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            {modalType === 'view' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Product Name</label>
                  <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>{selectedProduct.name}</div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>SKU Code</label>
                    <div><code>{selectedProduct.sku}</code></div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Unit Price</label>
                    <div>${Number(selectedProduct.unit_price).toFixed(2)}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Category</label>
                    <div>{selectedProduct.category.name}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Brand</label>
                    <div>{selectedProduct.brand.name}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Minimum stock threshold</label>
                    <div>{selectedProduct.minimum_stock} {selectedProduct.unit}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Available Stock</label>
                    <div style={{ fontWeight: 600 }}>{getProductStockSum(selectedProduct.id)} {selectedProduct.unit}</div>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Storage Allocations</label>
                  {getProductLocations(selectedProduct.id).length === 0 ? (
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No storage locations allocated yet.</div>
                  ) : (
                    <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem' }}>
                      {getProductLocations(selectedProduct.id).map((loc, idx) => (
                        <li key={idx} style={{ marginTop: '0.25rem' }}>{loc}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Description</label>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                    {selectedProduct.description || 'No description provided.'}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit}>
                <div className="form-group">
                  <label>Product Name *</label>
                  <input 
                    type="text" 
                    required 
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>SKU Code *</label>
                    <input 
                      type="text" 
                      required 
                      className="form-control"
                      value={formData.sku}
                      onChange={(e) => setFormData({...formData, sku: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Unit (e.g. pcs, kg, box) *</label>
                    <input 
                      type="text" 
                      required 
                      className="form-control"
                      value={formData.unit}
                      onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Category *</label>
                    <select 
                      className="form-control"
                      value={formData.category_id}
                      onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                    >
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Brand *</label>
                    <select 
                      className="form-control"
                      value={formData.brand_id}
                      onChange={(e) => setFormData({...formData, brand_id: e.target.value})}
                    >
                      {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Unit Price ($) *</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      required 
                      className="form-control"
                      value={formData.unit_price}
                      onChange={(e) => setFormData({...formData, unit_price: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Minimum Stock Level *</label>
                    <input 
                      type="number" 
                      min="0" 
                      required 
                      className="form-control"
                      value={formData.minimum_stock}
                      onChange={(e) => setFormData({...formData, minimum_stock: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    rows="3" 
                    className="form-control"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                  <input 
                    type="checkbox" 
                    id="is_active" 
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    style={{ width: 'auto' }}
                  />
                  <label htmlFor="is_active" style={{ cursor: 'pointer' }}>Product is active and visible in catalog</label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Product</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
