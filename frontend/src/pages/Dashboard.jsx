import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaShoppingBag, FaRobot, FaBolt } from "react-icons/fa";

import ProductService from "../services/ProductService";
import CartService from "../services/CartService";
import ProductCard from "../components/products/ProductCard";

import "./Dashboard.css";

function Dashboard() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    ProductService.getAllProducts()
      .then((products) => {
        const featured = [...products]
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 4);
        setFeaturedProducts(featured);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const addToCart = async (product) => {
    try {
      await CartService.addToCart(product._id, 1);
    } catch (err) {
      console.error("Failed to add to cart:", err);
    }
  };

  return (
    <div className="dashboard">
      <motion.div
        className="hero"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1>👋 Welcome</h1>
          <p>Smart Cart Optimization Engine</p>
          <span>Shop smarter with AI-powered recommendations</span>
        </div>

        <Link to="/products">
          <button>
            <FaBolt />
            Shop Now
          </button>
        </Link>
      </motion.div>

      <div className="section-header">
        <h2>
          <FaShoppingBag /> Featured Products
        </h2>
        <Link to="/products" className="see-all-link">
          See all products →
        </Link>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", padding: "40px" }}>Loading featured products...</p>
      ) : error ? (
        <p style={{ textAlign: "center", padding: "40px" }}>
          Couldn't load products: {error}
        </p>
      ) : featuredProducts.length === 0 ? (
        <p style={{ textAlign: "center", padding: "40px" }}>
          No products yet — check back soon!
        </p>
      ) : (
        <div className="dashboard-grid">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product._id}
              image={product.image}
              name={product.productName}
              brand={product.brand}
              category={product.category}
              price={product.price}
              rating={product.rating}
              onAddToCart={() => addToCart(product)}
              onView={() => ProductService.trackView(product._id)}
            />
          ))}
        </div>
      )}

      <motion.div
        className="insights-card"
        style={{ marginTop: "35px" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h2>
          <FaRobot /> Personalized For You
        </h2>
        <p style={{ color: "#374151", marginBottom: "20px" }}>
          Add a few items to your cart and our AI engine will suggest products
          picked just for you.
        </p>
        <Link to="/recommendations">
          <button
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "12px 22px",
              borderRadius: "12px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            View My Recommendations
          </button>
        </Link>
      </motion.div>
    </div>
  );
}

export default Dashboard;