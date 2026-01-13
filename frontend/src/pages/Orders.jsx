import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import "./Orders.css";

export default function Orders() {
  const [orders, setOrders] = useState([]);

  const load = async () => {
    const res = await API.get("/orders");
    setOrders(res.data);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await API.put(`/orders/${id}/status`, { status });
    load();
  };

  return (
    <>
      <Navbar />
      <div className="orders-container">
        <h2>Order Management</h2>

        <div className="orders-grid">
          {orders.map(o => (
            <div key={o._id} className="order-box">
              <div className="order-header">
                <span>{o.orderedBy?.name}</span>
                <span className={`badge ${o.status.replace(/ /g, '-')}`}>{o.status.charAt(0).toUpperCase() + o.status.slice(1)}</span>
              </div>

              <div className="order-items">
                {o.items.map(i => (
                  <div key={i._id}>
                    {i.product.name} × {i.quantity}
                  </div>
                ))}
              </div>

              <div className="order-footer">
                <strong>₹{o.total}</strong>

                {o.status === "pending" && (
                  <div>
                    <button className="btn approve" onClick={() => updateStatus(o._id, 'in progress')}>Start Processing</button>
                  </div>
                )}
                
                {o.status === "in progress" && (
                  <div>
                    <button className="btn approve" onClick={() => updateStatus(o._id, 'delivered')}>Mark Delivered</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
