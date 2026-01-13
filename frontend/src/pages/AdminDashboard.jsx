import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0 });
  const [orders, setOrders] = useState({ pending: 0, totalOrders: 0 });
  const [users, setUsers] = useState({ customers: 0, staff: 0 });
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      API.get("/sales/stats"),
      API.get("/orders/stats"),
      API.get("/users/stats"),
      API.get("/products")
    ]).then(([salesRes, ordersRes, usersRes, productsRes]) => {
      setRevenue(salesRes.data.revenue);
      setOrders(ordersRes.data);
      setUsers(usersRes.data);
      setStats({ products: productsRes.data.length });
      
      // Filter low stock products (quantity < 5)
      const lowStock = productsRes.data.filter(p => p.quantity < 5);
      setLowStockProducts(lowStock);
      
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="admin-dashboard">
          <div className="loading">Loading dashboard...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <h2>Admin Dashboard</h2>
          <p className="subtitle">Overview of your store performance</p>
        </div>

        {/* Low Stock Alerts */}
        {lowStockProducts.length > 0 && (
          <div className="alert-section">
            <div className="alert-header">
              <div className="alert-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <div>
                <h3>Low Stock Alert</h3>
                <p>{lowStockProducts.length} product{lowStockProducts.length > 1 ? 's' : ''} running low on stock</p>
              </div>
            </div>
            <div className="alert-products">
              {lowStockProducts.map(product => (
                <div key={product._id} className="alert-product-card">
                  <div className="alert-product-info">
                    {product.image ? (
                      <img src={`http://localhost:5000${product.image}`} alt={product.name} />
                    ) : (
                      <div className="alert-no-image">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                          <path d="M21 15l-5-5L5 21"/>
                        </svg>
                      </div>
                    )}
                    <div className="alert-product-details">
                      <h4>{product.name}</h4>
                      <span className="alert-category">{product.category}</span>
                    </div>
                  </div>
                  <div className="alert-stock-info">
                    <span className={`stock-badge ${product.quantity === 0 ? 'out' : 'low'}`}>
                      {product.quantity === 0 ? 'Out of Stock' : `Only ${product.quantity} left`}
                    </span>
                    <button className="restock-btn" onClick={() => navigate('/admin/products')}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14"/>
                      </svg>
                      Restock
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="stats-grid">
          <div className="stat-card blue">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 7h-9M14 17H5M3 3h18v18H3z"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
            </div>
            <div className="stat-content">
              <p className="stat-label">Total Products</p>
              <h3 className="stat-value">{stats?.products || 0}</h3>
            </div>
          </div>

          <div className="stat-card yellow">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <div className="stat-content">
              <p className="stat-label">Pending Orders</p>
              <h3 className="stat-value">{orders?.pending || 0}</h3>
            </div>
          </div>

          <div className="stat-card green">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9 4a1 1 0 100 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H10z"/>
              </svg>
            </div>
            <div className="stat-content">
              <p className="stat-label">Total Orders</p>
              <h3 className="stat-value">{orders?.totalOrders || 0}</h3>
            </div>
          </div>

          <div className="stat-card purple">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 7H9a2 2 0 00-2 2v10a2 2 0 002 2h4a2 2 0 002-2V9a2 2 0 00-2-2z"/>
                <path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2"/>
                <line x1="9" y1="12" x2="15" y2="12"/>
                <line x1="9" y1="16" x2="15" y2="16"/>
              </svg>
            </div>
            <div className="stat-content">
              <p className="stat-label">Total Revenue</p>
              <h3 className="stat-value">₹{(revenue || 0).toLocaleString()}</h3>
            </div>
          </div>

          <div className="stat-card orange">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
              </svg>
            </div>
            <div className="stat-content">
              <p className="stat-label">Customers</p>
              <h3 className="stat-value">{users?.customers || 0}</h3>
            </div>
          </div>

          <div className="stat-card pink">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div className="stat-content">
              <p className="stat-label">Staff Members</p>
              <h3 className="stat-value">{users?.staff || 0}</h3>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
