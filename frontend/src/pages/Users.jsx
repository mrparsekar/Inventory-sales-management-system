import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import Toast from "../components/Toast";
import "./Users.css";

export default function Users() {
  const [staff, setStaff] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const load = () => {
    API.get("/users/staff").then(res => setStaff(res.data)).catch(() => {});
    API.get("/users/customers").then(res => setCustomers(res.data)).catch(() => {});
  };

  useEffect(load, []);

  const toggleStaffStatus = async (staffId, currentStatus) => {
    try {
      await API.put(`/users/staff/${staffId}/toggle-status`);
      showToast(`Staff ${currentStatus ? 'disabled' : 'enabled'} successfully`, "success");
      load();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to update staff status", "error");
    }
  };

  const addStaff = async () => {
    if (!name || !email || !password) {
      showToast("Please fill all fields", "error");
      return;
    }

    if (password.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    setLoading(true);
    try {
      await API.post("/auth/register-staff", { name, email, password });
      showToast("Staff member created successfully!", "success");
      setName("");
      setEmail("");
      setPassword("");
      load();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to create staff", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ show: false, message: "", type: "" })} 
        />
      )}
      
      <div className="users-container">
        <div className="users-header">
          <h2>User Management</h2>
          <p className="subtitle">Manage staff members and view customers</p>
        </div>

        {/* Add Staff Form */}
        <div className="add-staff-section">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <path d="M20 8v6M23 11h-6"/>
            </svg>
            Add New Staff Member
          </h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter full name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="staff@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <button className="add-staff-btn" onClick={addStaff} disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-small"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                    Create Staff
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Staff List */}
        <div className="users-section">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
            </svg>
            Staff Members
            <span className="count-badge">{staff.length}</span>
          </h3>

          <div className="users-list">
            {staff.length === 0 ? (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                </svg>
                <p>No staff members yet</p>
              </div>
            ) : (
              staff.map(u => (
                <div key={u._id} className={`user-card ${!u.isActive ? 'disabled' : ''}`}>
                  <div className="user-avatar staff">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div className="user-info">
                    <h4>{u.name}</h4>
                    <p>{u.email}</p>
                    {!u.isActive && <span className="status-text disabled">Account Disabled</span>}
                  </div>
                  <div className="user-actions">
                    <span className={`role-badge staff ${!u.isActive ? 'disabled' : ''}`}>Staff</span>
                    <button 
                      className={`toggle-btn ${u.isActive ? 'disable' : 'enable'}`}
                      onClick={() => toggleStaffStatus(u._id, u.isActive)}
                      title={u.isActive ? 'Disable Access' : 'Enable Access'}
                    >
                      {u.isActive ? (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                            <line x1="1" y1="1" x2="23" y2="23"/>
                          </svg>
                          Disable
                        </>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <path d="M22 4L12 14.01l-3-3"/>
                          </svg>
                          Enable
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Customers List */}
        <div className="users-section">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
            </svg>
            Customers
            <span className="count-badge">{customers.length}</span>
          </h3>

          <div className="users-list">
            {customers.length === 0 ? (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                </svg>
                <p>No customers yet</p>
              </div>
            ) : (
              customers.map(u => (
                <div key={u._id} className="user-card">
                  <div className="user-avatar customer">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div className="user-info">
                    <h4>{u.name}</h4>
                    <p>{u.email}</p>
                  </div>
                  <span className="role-badge customer">Customer</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
