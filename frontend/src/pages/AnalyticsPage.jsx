 import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import {
  FaShoppingBag,
  FaRupeeSign,
  FaBoxOpen,
} from "react-icons/fa";

import CartService from "../services/CartService";

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

function AnalyticsPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    CartService.getCart()
      .then(setCartItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <h2 style={{ textAlign: "center", padding: "60px" }}>Loading your insights...</h2>;
  }
  if (error) {
    return <h2 style={{ textAlign: "center", padding: "60px" }}>Error: {error}</h2>;
  }

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = cartItems.reduce(
    (sum, item) => sum + Number(item.productId?.price || 0) * item.quantity,
    0
  );
  const uniqueProducts = cartItems.length;

  const categoryMap = {};
  cartItems.forEach((item) => {
    const category = item.productId?.category || "Other";
    categoryMap[category] = (categoryMap[category] || 0) + item.quantity;
  });
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  const summaryCards = [
    { title: "Items in Cart", value: totalItems, icon: <FaShoppingBag size={26} />, color: "#2563eb" },
    { title: "Cart Value", value: `₹${totalValue}`, icon: <FaRupeeSign size={26} />, color: "#10b981" },
    { title: "Unique Products", value: uniqueProducts, icon: <FaBoxOpen size={26} />, color: "#f59e0b" },
  ];

  return (
    <div style={{ padding: "30px", background: "#f5f7fb", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "34px", marginBottom: "8px", color: "#1f2937" }}>
        📊 My Shopping Insights
      </h1>
      <p style={{ color: "#6b7280", marginBottom: "30px" }}>
        A quick look at what's in your cart right now
      </p>

      {cartItems.length === 0 ? (
        <div style={{ background: "white", borderRadius: "18px", padding: "50px", textAlign: "center", boxShadow: "0 5px 15px rgba(0,0,0,.08)" }}>
          <h2 style={{ marginBottom: "10px" }}>Your cart is empty</h2>
          <p style={{ color: "#6b7280", marginBottom: "20px" }}>
            Add some products to see your shopping insights here.
          </p>
          <Link to="/products">
            <button style={{ background: "#2563eb", color: "white", border: "none", padding: "12px 22px", borderRadius: "12px", fontWeight: "600", cursor: "pointer" }}>
              Browse Products
            </button>
          </Link>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: "20px", marginBottom: "30px" }}>
            {summaryCards.map((card) => (
              <div key={card.title} style={{ background: card.color, color: "white", borderRadius: "18px", padding: "22px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 12px 25px rgba(0,0,0,0.15)" }}>
                <div>
                  <p style={{ margin: 0, opacity: 0.9 }}>{card.title}</p>
                  <h2 style={{ marginTop: "10px", marginBottom: 0, fontSize: "30px" }}>{card.value}</h2>
                </div>
                {card.icon}
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px" }}>
            <div style={{ background: "white", padding: "20px", borderRadius: "18px", boxShadow: "0 5px 15px rgba(0,0,0,.08)", height: "380px" }}>
              <h2>🛍 Cart by Category</h2>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={95} label>
                    {categoryData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: "white", borderRadius: "18px", padding: "20px", boxShadow: "0 5px 15px rgba(0,0,0,.08)" }}>
              <h2 style={{ marginBottom: "16px" }}>🧾 Cart Breakdown</h2>
              {cartItems.map((item) => (
                <div key={item._id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #eee" }}>
                  <span>{item.productId?.productName} × {item.quantity}</span>
                  <strong>₹{Number(item.productId?.price || 0) * item.quantity}</strong>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AnalyticsPage;