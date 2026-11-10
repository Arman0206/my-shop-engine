import { useEffect, useState } from "react";
import { FaStar, FaRobot, FaShoppingCart } from "react-icons/fa";
import CartService from "../services/CartService";
import RecommendationService from "../services/RecommendationService";

function RecommendationImage({ image, name }) {
  const [imgFailed, setImgFailed] = useState(false);
  const showPlaceholder = !image || imgFailed;

  if (showPlaceholder) {
    return (
      <div
        style={{
          width: "70px",
          height: "70px",
          borderRadius: "50%",
          background: "#eef4ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "30px",
          marginBottom: "15px",
        }}
      >
        📦
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={name}
      onError={() => setImgFailed(true)}
      style={{
        width: "70px",
        height: "70px",
        borderRadius: "50%",
        objectFit: "cover",
        marginBottom: "15px",
      }}
    />
  );
}

function RecommendationsPage() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedIds, setAddedIds] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const cartItems = await CartService.getCart();

        if (cartItems.length === 0) {
          setRecommendations([]);
          return;
        }

        const firstProductId = cartItems[0].productId?._id;
        const data = await RecommendationService.getRecommendations(firstProductId);

        setSelectedProduct(data.selectedProduct);
        setRecommendations(data.recommendations || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const addToCart = async (product) => {
    try {
      await CartService.addToCart(product._id, 1);
      setAddedIds((prev) => [...prev, product._id]);
    } catch (err) {
      console.error("Failed to add to cart:", err);
    }
  };

  if (loading) {
    return <h2 style={{ textAlign: "center", padding: "60px" }}>Loading recommendations...</h2>;
  }
  if (error) {
    return <h2 style={{ textAlign: "center", padding: "60px" }}>Error: {error}</h2>;
  }

  return (
    <div style={{ padding: "30px", background: "#f5f7fb", minHeight: "100vh" }}>
      <div style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "white", padding: "30px", borderRadius: "18px", marginBottom: "30px" }}>
        <h1 style={{ margin: 0 }}>AI Recommendations</h1>
        <p style={{ marginTop: "10px" }}>
          {selectedProduct
            ? `Because you added ${selectedProduct.productName} to your cart`
            : "Personalized products selected by the Smart Cart Optimization Engine."}
        </p>
      </div>

      {recommendations.length === 0 ? (
        <h2 style={{ textAlign: "center" }}>Add something to your cart to get AI recommendations.</h2>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "20px" }}>
          {recommendations.map((item) => (
            <div
              key={item._id}
              style={{
                background: "white",
                borderRadius: "18px",
                padding: "20px",
                boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <RecommendationImage image={item.image} name={item.productName} />

              <h2 style={{ margin: "5px 0" }}>{item.productName}</h2>
              <p style={{ color: "#666" }}>{item.category}</p>
              <p style={{ fontWeight: "bold", color: "#2563eb" }}>₹{item.price}</p>
              <p><FaStar color="#fbbf24" /> {item.rating}</p>

              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#eef4ff", color: "#2563eb", padding: "6px 12px", borderRadius: "20px", fontSize: "14px", margin: "10px 0" }}>
                <FaRobot />
                {item.reason}
              </div>

              <button
                onClick={() => addToCart(item)}
                disabled={addedIds.includes(item._id)}
                style={{
                  width: "100%",
                  marginTop: "auto",
                  background: addedIds.includes(item._id) ? "#16a34a" : "#2563eb",
                  color: "white",
                  border: "none",
                  padding: "12px",
                  borderRadius: "10px",
                  cursor: addedIds.includes(item._id) ? "default" : "pointer",
                  fontWeight: "600",
                }}
              >
                <FaShoppingCart /> {addedIds.includes(item._id) ? "Added ✓" : "Add to Cart"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecommendationsPage;