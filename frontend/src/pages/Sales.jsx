import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import "./Sales.css";

export default function Sales() {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    API.get("/sales").then(res => setSales(res.data));
  }, []);

  const exportCSV = () => {
    let csv = "Product,Quantity,Amount,Sold By\n";
    sales.forEach(s => {
      csv += `${s.product?.name},${s.quantity},${s.totalAmount},${s.soldBy?.name}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "sales.csv";
    a.click();
  };

  return (
    <>
      <Navbar />
      <div className="sales-container">
        <h2>Sales History</h2>
        <button className="export-btn" onClick={exportCSV}>Export CSV</button>

        <div className="table">
          <div className="row head">
            <span>Product</span>
            <span>Qty</span>
            <span>Amount</span>
            <span>Sold By</span>
          </div>

          {sales.map(s => (
            <div className="row" key={s._id}>
              <span>{s.product?.name}</span>
              <span>{s.quantity}</span>
              <span>₹{s.totalAmount}</span>
              <span>{s.soldBy?.name}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
